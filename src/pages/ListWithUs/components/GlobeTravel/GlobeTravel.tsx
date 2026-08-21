import { useCallback, useEffect, useRef, useState } from "react";
import wrapperHOC from "@Utils/wrapperHOC";
import styles from "./GlobeTravel.module.scss";
import DemandGlobe, { GlobeFocus } from "../DemandGlobe/DemandGlobe";

/**
 * The globe, lifted out of any one section so it can travel between them.
 *
 * ── Why it works this way ───────────────────────────────────────────────────
 * The globe has to appear in the hero and then move into "Why partners list with
 * amber" as the reader scrolls. There are three ways to do that and only one of
 * them is viable:
 *
 *   · Two globes, one per section — doubles the Mapbox map loads (which are
 *     BILLED), doubles the WebGL contexts, and the two would finish loading at
 *     different times so the handover would flicker.
 *   · Move the DOM node from one section to the other — reparenting a live WebGL
 *     canvas tears down its context, and there is no way to animate across a
 *     reparent anyway.
 *   · ONE globe in a fixed layer, positioned every frame from measured "slots" in
 *     each section. One context, one map load, and the movement is a plain
 *     transform, so it can be as smooth as the compositor allows.
 *
 * So: each section renders an empty `[data-globe-slot]` box that reserves the
 * space, and this component owns the only globe and parks it over whichever slot
 * the scroll position calls for.
 *
 * ── One canvas, sized once; everything else is a transform ──────────────────
 * The canvas is created at the HERO slot's size and never resized. Resizing it means
 * reallocating Mapbox's framebuffer, which is not something to do on scroll.
 *
 * Sections change the globe through a POSE instead — an offset and a scale, folded
 * into the same single transform below. Every pose scale is DELIBERATELY ≤ 1:
 * downsampling a canvas is clean and even looks slightly supersampled, whereas
 * upsampling is what turns it to mush. So the hero holds the largest size and every
 * other section shrinks from it.
 *
 * That is also why slots need not be the same size. The layer is positioned by slot
 * CENTRES, so a section can reserve a smaller — or differently shaped — box and let
 * its pose scale the sphere to suit. "Why partners" does exactly that: its slot is a
 * short rectangle, so its panel is not forced to be as tall as the hero globe is wide.
 *
 * ── Positioned in a rAF loop, not on scroll events ─────────────────────────
 * Scroll events lag behind momentum scrolling on touch, which would show up as the
 * globe juddering against the page. A continuous rAF reads both slots and writes
 * one transform — two `getBoundingClientRect` calls and a style write per frame.
 */

/** Where the globe sits when the hero owns it, versus this section. */
type Slot = "hero" | "why";

/**
 * Scroll window over which the globe moves from the hero slot to the "why" slot,
 * expressed as fractions of the viewport height relative to the destination slot.
 *
 * Travel starts when the destination slot's top is one viewport below the fold and
 * completes when it has risen to a quarter of the way down the screen — by which
 * point the section it belongs to is the thing being read.
 */
const TRAVEL_FROM_VH = 1.0;
const TRAVEL_TO_VH = 0.25;

/** Hero entrance: the globe holds a lifted position, then settles into its slot. */
const HOLD_MS = 900;
const SETTLE_MS = 1150;
/** Fallback, in case the globe never reports ready — the page must still assemble. */
const FALLBACK_MS = 2600;

/** Smooth, symmetric ease so the departure and the arrival both feel deliberate. */
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * Broadcast on `window` when the globe is drawable.
 *
 * A DOM event rather than context or a prop: the hero and this component are
 * siblings, and the hero only needs one boolean to time its copy against. Wiring a
 * provider through the page for that would be more moving parts than the problem
 * has. Documented here because an undocumented global event is a trap.
 */
export const GLOBE_READY_EVENT = "lwu:globe-ready";

/**
 * Sent by a section that wants the globe to emphasise part of the network — the stepped
 * rail in "Your place is made for amber" uses it so each claim changes the sphere.
 * `detail` is a `GlobeFocus`.
 */
export const GLOBE_FOCUS_EVENT = "lwu:globe-focus";

/**
 * Where the globe should sit relative to its slot, and how big.
 *
 * `dx`/`dy` are fractions of the SLOT WIDTH, not pixels — the slot is a `clamp()` that
 * shrinks with the viewport, and a pose measured in pixels would drift out of proportion
 * with it at every width. `scale` is absolute and must not exceed 1 (see the note at the
 * top of this file).
 */
export interface GlobePose {
  dx: number;
  dy: number;
  scale: number;
}

/** Sent with a `GlobePose` in `detail`. Identity is `{ dx: 0, dy: 0, scale: 1 }`. */
export const GLOBE_POSE_EVENT = "lwu:globe-pose";

const POSE_IDENTITY: GlobePose = { dx: 0, dy: 0, scale: 1 };

/**
 * Time constant for the pose easing, in seconds.
 *
 * The pose is smoothed exponentially in the same rAF loop that positions the layer
 * rather than with a CSS transition, because there is only ever ONE writer of this
 * element's `transform` — a transition on a property the loop rewrites every frame just
 * lags a frame behind forever and never arrives.
 *
 * Exponential smoothing, not a fixed-duration tween, because the step can change again
 * mid-move (scrolling fast, or clicking down the rail). A tween would have to be
 * restarted from a new origin each time and would visibly stutter; this simply retargets
 * and keeps its velocity. 0.26s reads as "deliberate but not slow" — the sphere arrives
 * at about the same moment the step's copy has finished opening.
 */
const POSE_TAU = 0.26;

/**
 * Below this width the panel that hosts the pose stacks into one column, so there is no
 * freed space beside the sphere to move it into and nothing to make room for. Poses are
 * ignored under it. Must match the `max-width: 1024px` block in WhyPartners.module.scss,
 * which hides the chips over the same threshold.
 */
const POSE_MIN_WIDTH = 1024;

const GlobeTravel = () => {
  const layerRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<GlobeFocus>("all");
  const rafRef = useRef(0);
  /** Where the pose is heading, and where it currently is. Refs, not state: the frame
   *  loop is the only reader and re-rendering a Mapbox map 60x a second is pointless. */
  const poseTargetRef = useRef<GlobePose>(POSE_IDENTITY);
  const poseNowRef = useRef<GlobePose>({ ...POSE_IDENTITY });
  const lastTimeRef = useRef(0);
  /** When the globe became drawable, which starts the entrance clock. */
  const readyAtRef = useRef(0);
  const sizeRef = useRef(0);

  const onReady = useCallback(() => {
    if (readyAtRef.current) return;
    readyAtRef.current = Date.now();
    window.dispatchEvent(new CustomEvent(GLOBE_READY_EVENT));
  }, []);

  // Sections ask for an emphasis by event rather than by prop, for the same reason the
  // readiness signal is an event: they are siblings of this component, not parents.
  useEffect(() => {
    const onFocus = (e: Event) => {
      const next = (e as CustomEvent<GlobeFocus>).detail;
      if (next) setFocus(next);
    };
    window.addEventListener(GLOBE_FOCUS_EVENT, onFocus);
    return () => window.removeEventListener(GLOBE_FOCUS_EVENT, onFocus);
  }, []);

  useEffect(() => {
    const onPose = (e: Event) => {
      const next = (e as CustomEvent<GlobePose>).detail;
      if (!next) return;
      poseTargetRef.current = next;
      // Reduced motion gets the pose but not the journey: snap straight to it, the same
      // way the hero entrance is skipped rather than merely shortened.
      const still =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (still) poseNowRef.current = { ...next };
    };
    window.addEventListener(GLOBE_POSE_EVENT, onPose);
    return () => window.removeEventListener(GLOBE_POSE_EVENT, onPose);
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return undefined;

    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Even if Mapbox never loads, the entrance must complete or the globe would sit
    // lifted forever and the hero would never release its copy.
    const fallback = window.setTimeout(onReady, FALLBACK_MS);

    const slotRect = (name: Slot) => {
      const el = document.querySelector<HTMLElement>(`[data-globe-slot="${name}"]`);
      return el ? el.getBoundingClientRect() : null;
    };

    const frame = () => {
      const hero = slotRect("hero");
      const why = slotRect("why");

      if (hero) {
        // One size for the layer, taken from the hero slot — the LARGEST the globe is
        // ever drawn. It is never resized after this: resizing means reallocating
        // Mapbox's framebuffer, and every section that wants the globe smaller asks for
        // it through the pose's scale instead, which is a compositor transform and always
        // a DOWNSCALE (see the note at the top of this file).
        const size = Math.round(hero.width);
        if (size > 0 && size !== sizeRef.current) {
          sizeRef.current = size;
          layer.style.width = `${size}px`;
          layer.style.height = `${size}px`;
        }

        // How far through the handover we are. Driven off the DESTINATION slot's
        // position rather than raw scrollY, so it stays correct no matter how tall the
        // hero is or what the section spacing becomes.
        const vh = window.innerHeight || 1;
        let p = 0;
        if (why) {
          const from = vh * TRAVEL_FROM_VH;
          const to = vh * TRAVEL_TO_VH;
          p = smoothstep(clamp01((from - why.top) / (from - to)));
        }

        // Positioned by slot CENTRES, not top-left corners.
        //
        // This is what lets the two slots be DIFFERENT SIZES. The layer is always the
        // hero slot's size and the pose scales it about its own centre, so aligning
        // centres puts the rendered sphere in the middle of whichever slot owns it
        // whatever that slot's dimensions are. Aligning corners only worked while both
        // slots were identical squares, and the "why" slot is now a shorter rectangle so
        // the panel is not forced to be as tall as the hero's globe is wide.
        const centreX = (r: DOMRect) => r.left + r.width / 2;
        const centreY = (r: DOMRect) => r.top + r.height / 2;
        const cx = why
          ? centreX(hero) + (centreX(why) - centreX(hero)) * p
          : centreX(hero);
        const cy = why ? centreY(hero) + (centreY(why) - centreY(hero)) * p : centreY(hero);
        const target = { x: cx - size / 2, y: cy - size / 2 };

        // Hero entrance, folded into the same transform: while it runs, the globe is
        // offset from its slot, and the offset decays to zero. Two systems writing
        // `transform` on one element would fight, so there is only ever one writer.
        let ox = 0;
        let oy = 0;
        if (!still && readyAtRef.current) {
          const since = Date.now() - readyAtRef.current;
          const e = 1 - smoothstep(clamp01((since - HOLD_MS) / SETTLE_MS));
          // Lifted to the horizontal centre of the viewport and slightly above, which
          // is where the hero wants it before it settles into the column.
          ox = (window.innerWidth / 2 - (hero.left + hero.width / 2)) * e;
          oy = -70 * e;
        } else if (!still && !readyAtRef.current) {
          ox = window.innerWidth / 2 - (hero.left + hero.width / 2);
          oy = -70;
        }

        // The pose, eased toward its target. `dt` is real elapsed time rather than an
        // assumed 16ms, so the easing takes the same wall-clock time on a 120Hz display
        // as on a 60Hz one and does not slow down when a frame is dropped.
        //
        // Capped, because a backgrounded tab hands back one enormous dt and an uncapped
        // one would snap the pose in a single visible jump on return. The cap is the one
        // place this is deliberately NOT frame-rate independent: below ~10fps the easing
        // starts taking longer than its wall-clock time constant. That is the right
        // trade — it degrades to "slower" rather than "teleports" — but it is worth
        // knowing when measuring, because a headless browser on software GL runs this
        // page at about 5fps and the pose looks stuck when it is simply crawling.
        const nowMs = Date.now();
        const dt = lastTimeRef.current
          ? Math.min(0.1, (nowMs - lastTimeRef.current) / 1000)
          : 0;
        lastTimeRef.current = nowMs;

        // Narrow viewports stack the panel into one column: no freed space beside the
        // sphere, so no pose. Read per frame rather than from a resize listener — it is
        // one property read, and it cannot go stale.
        const asked =
          window.innerWidth >= POSE_MIN_WIDTH ? poseTargetRef.current : POSE_IDENTITY;

        // The pose is FADED IN BY THE TRAVEL, not applied the moment a section asks for
        // it. A pose is expressed relative to the destination slot, so it only means
        // anything once the globe is over that slot; at `p = 0` the globe is the hero's
        // and the hero always wants it whole.
        //
        // This is not theoretical. The section requests its pose as soon as it is roughly
        // in view, and its IntersectionObserver carries a 200px rootMargin — on a 950px
        // viewport the section's top is close enough to the fold at scroll 0 that it counts
        // as visible immediately. Without this blend, its step-1 scale of 0.74 was applied
        // straight away and the HERO globe rendered at 481px instead of 650. Multiplying
        // through `p` also means the shrink is part of the handover rather than a separate
        // thing that happens near it.
        const wants = {
          dx: asked.dx * p,
          dy: asked.dy * p,
          scale: 1 + (asked.scale - 1) * p,
        };

        const pose = poseNowRef.current;
        const k = 1 - Math.exp(-dt / POSE_TAU);
        pose.dx += (wants.dx - pose.dx) * k;
        pose.dy += (wants.dy - pose.dy) * k;
        pose.scale += (wants.scale - pose.scale) * k;

        // The pose is expressed in slot widths, so it scales with the `clamp()` that
        // sizes the slot instead of drifting out of proportion at other viewports.
        const px = pose.dx * hero.width;
        const py = pose.dy * hero.width;

        // ONE writer, one transform. Slot position, hero entrance offset and pose all
        // compose here: translate first, then scale, so the scale is about the sphere's
        // own centre and not about the top-left of the page.
        layer.style.transform = `translate3d(${target.x + ox + px}px, ${
          target.y + oy + py
        }px, 0) scale(${pose.scale})`;
        // Non-interactive while in flight: a globe drifting across the page should not
        // be swallowing hovers meant for the copy it passes over.
        layer.style.pointerEvents = p > 0.02 && p < 0.98 ? "none" : "auto";
      }

      rafRef.current = window.requestAnimationFrame(frame);
    };

    frame();
    return () => {
      window.clearTimeout(fallback);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [onReady]);

  return (
    <div ref={layerRef} className={styles.layer}>
      <DemandGlobe onReady={onReady} focus={focus} />
    </div>
  );
};

export default wrapperHOC(GlobeTravel, {
  componentName: "GlobeTravel-ListWithUs",
  showForChina: true,
});
