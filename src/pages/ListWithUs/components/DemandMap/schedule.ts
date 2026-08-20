/**
 * Arc timing, shared by every renderer of the demand network.
 *
 * Extracted from the flat map so the Mapbox globe animates on exactly the same
 * clock. Two components each with their own copy of this would drift apart the
 * first time either was tuned, and the timing is the part that was hardest to get
 * right — see the note on the launch queue below.
 */
import { PROPERTIES, ROUTES } from "./network";

/**
 * How long one arc spends in the air.
 *
 * Slower than it needs to be to look smooth, on purpose: the arc is carrying the
 * sentence "this demand came from there and arrived here", and at the 1800ms tried
 * first the eye could not follow one line to its end before the next launched.
 */
export const ARC_MS = 2800;

/** Fraction of an arc's life spent flying; the rest is the tail catching up. */
export const FLY = 0.72;

/** How long a destination pulses after an arrival, and holds its label up. */
export const PULSE_MS = 900;
export const LABEL_MS = 2000;

/**
 * The launch queue.
 *
 * Arcs do NOT each run on their own period. That was the obvious design and it
 * measured badly: with a per-route period derived from the destination's weight the
 * periods differ, so launches are only evenly spread *within* each route, never
 * across the set. Sampled over 14s the coverage swung from 3,800 lit pixels down to
 * 110 — a visibly empty map for a couple of seconds, which is fatal for a graphic
 * whose whole job is "demand keeps arriving".
 *
 * Instead there is one global cadence: a launch every LAUNCH_GAP, cycling a fixed
 * queue. A flight lasts ARC_MS and a launch happens every ARC_MS /
 * TARGET_IN_FLIGHT, so there are always almost exactly TARGET_IN_FLIGHT arcs up —
 * by construction rather than by tuning. Measured across a full cycle: 4 to 5.
 *
 * Weighting survives: a busy destination earns extra slots rather than a shorter
 * period, so London appears about three times as often as Berlin. Repeats are laid
 * out in ROUNDS — every route once, then the busiest again, then the busiest
 * again.
 *
 * The queue is then re-ordered by a STRIDE. `ROUTES` is grouped by origin, so
 * launching in queue order walked the origin list from India to Brazil in
 * sequence: demand appeared to sweep the world on a fixed circuit, which read as
 * mechanical. Stepping by a stride co-prime with the queue length scatters origins
 * and destinations while staying fully deterministic — no randomness, so SSR and
 * client agree.
 *
 * Stride 2 was chosen by measuring every co-prime candidate: it maximises the gap
 * between two slots of the SAME route (5 slots, comfortably more than the ~4 in
 * flight, so no route overlaps itself) while mixing origins. It opens
 * India→London, India→Birmingham, India→Amsterdam, China→Sydney, Nigeria→Coventry,
 * Kenya→Manchester, Egypt→Barcelona.
 */
export const TARGET_IN_FLIGHT = 4;
export const LAUNCH_GAP = Math.round(ARC_MS / TARGET_IN_FLIGHT);

/** Queue slots a destination earns, by weight. */
const slotsFor = (weight: number) => (weight >= 5 ? 3 : weight >= 4 ? 2 : 1);

/** Must stay co-prime with the queue length; see above. */
const QUEUE_STRIDE = 2;

export interface Slot {
  /** Index into `ROUTES`. */
  route: number;
  /** Milliseconds into the cycle at which this slot launches. */
  at: number;
}

export const SLOTS: Slot[] = (() => {
  const rounds: number[] = [];
  for (let round = 1; round <= 3; round += 1) {
    ROUTES.forEach((route, i) => {
      if (slotsFor(PROPERTIES[route.to].weight) >= round) rounds.push(i);
    });
  }
  const n = rounds.length;
  return rounds.map((_, k) => ({
    route: rounds[(k * QUEUE_STRIDE) % n],
    at: k * LAUNCH_GAP,
  }));
})();

export const CYCLE_MS = SLOTS.length * LAUNCH_GAP;

export interface Phase {
  /** False between flights — nothing to draw for this slot. */
  active: boolean;
  /** Head of the comet, 0 → 1 along the arc. */
  head: number;
  /** Tail, which catches the head up over the last of the flight. */
  tail: number;
  /** Arrival-pulse progress, 0 → 1 after the head lands. */
  landed: number;
}

/** What every arc looks like under `prefers-reduced-motion`: drawn, not moving. */
export const STILL_PHASE: Phase = { active: true, head: 1, tail: 0, landed: 0 };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export const phaseFor = (slot: Slot, elapsed: number): Phase => {
  const p = ((((elapsed - slot.at) % CYCLE_MS) + CYCLE_MS) % CYCLE_MS) / ARC_MS;
  if (p > 1) return { active: false, head: 0, tail: 0, landed: 0 };
  return {
    active: true,
    head: easeOut(clamp01(p / FLY)),
    tail: easeInOut(clamp01((p - (1 - FLY)) / FLY)),
    landed: clamp01(((p - FLY) * ARC_MS) / PULSE_MS),
  };
};

/**
 * How lit an origin is while it is sending: up fast as the arc leaves, held for
 * most of the flight, down as it arrives. An origin marks demand LEAVING, so it
 * should be quiet again by the time that demand has landed somewhere else.
 */
export const originGlow = (head: number) =>
  Math.min(1, head / 0.06) * (head < 0.82 ? 1 : Math.max(0, (1 - head) / 0.18));
