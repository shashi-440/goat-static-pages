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
 * The canvas is created at the HERO slot's size times HERO_ZOOM and never resized.
 * Resizing it means reallocating Mapbox's framebuffer, which is not something to do on
 * scroll.
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

/**
 * How much LARGER than its slot the globe is drawn while the page is at the top, and
 * over how much scroll it shrinks back into the slot.
 *
 * ⚠️  SET TO 1, WHICH TURNS THE WHOLE MECHANISM OFF. It is kept rather than deleted
 * because the machinery is still correct and is one constant away from working again.
 *
 * What it did: draw the map larger than its slot at the top of the page and unwind that
 * to slot size as the reader scrolled. Two things scaled together — `HERO_ZOOM` grew the
 * canvas, and the matching `zoomBoost` handed to `DemandGlobe` grew what Mapbox drew
 * inside it, since Mapbox sizes by the map's ZOOM LEVEL and not by its container. Raising
 * one without the other only pads unchanged content with empty space.
 *
 * Why it is off: it existed to make a SPHERE bigger, back when the hero held a globe that
 * was too small in its slot. The map is now full-bleed — it is already as wide as the
 * window — so there is nothing left for the zoom to grow into, and unwinding it on scroll
 * would only shrink a map away from the edges it was asked to reach.
 *
 * The shrink is driven off `scrollY` and not off the hero slot's position: the slot is
 * what the globe is shrinking INTO, so measuring against it would be measuring against
 * the thing that is not moving.
 */
const HERO_ZOOM = 1;
const HERO_ZOOM_VH = 0.55;

/**
 * How far the globe shrinks as the reader scrolls out of the hero, and over how much scroll.
 *
 * The globe is as large as the hero's geometry allows (see the ZOOM note in DemandGlobe), which
 * is right while it is the subject of the frame and far too much once the reader has moved past
 * it. So it eases down to HALF over the first 55% of a viewport of scroll and stays there.
 *
 * ⚠️  0.5, and 0.84 was tried first and was nowhere near enough — for a reason that is not about
 * the number. Scrolling does not just move the globe DOWN the page, it brings the sphere's widest
 * band into the viewport: at rest the reader sees the crown, and a few hundred pixels later they
 * see the equator. So the globe reads as GROWING on scroll even at a constant scale, and the
 * shrink has to beat that apparent growth as well as reduce the size. At 78% of the window a 16%
 * reduction lost that race and the globe filled the screen.
 *
 * ⚠️  A DOWNSCALE, never an upscale, and that is the whole reason this is done as a transform
 * on the layer rather than by changing the map's zoom:
 *   · Re-zooming Mapbox would re-render the sphere at a new size every frame — a scripted
 *     camera fighting a scroll handler, on the thread that is also drawing the tour.
 *   · A compositor downscale of an already-drawn canvas is free and stays sharp. Upscaling one
 *     is what turns it to mush, which is why every scale in this file is <= 1.
 *
 * It multiplies into the SAME single transform as the slot position, the entrance offset and
 * the pose — there is only ever one writer of this element's transform.
 */
const SCROLL_SHRINK_TO = 0.5;
const SCROLL_SHRINK_VH = 0.55;

/**
 * The layer's shape: a SQUARE, because it holds a sphere and a sphere is as tall as it is
 * wide.
 *
 * It was `100 / 41` for a spell — a full-width band — while the map was a flat mercator
 * strip. Two notes worth keeping from that, because they are the traps either way:
 *   · A square layer at 100vw reserves 100vw of HEIGHT. That is why the slot is a
 *     `clamp(300px, 63vw, 1000px)` rather than the band's `100vw`; a viewport-and-a-half of
 *     empty page under the globe is what happens if the two are changed apart.
 *   · The band's aspect was stated in three places and all three had to agree. That is
 *     still true: here, `--globe-aspect` in GlobeTravel.module.scss, and `.globeSlot` in
 *     Hero.module.scss. A mismatch shows as the sphere letterboxed inside its own canvas,
 *     or as the hero reserving the wrong height.
 */
const MAP_ASPECT = 1;

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
 * ignored under it.
 *
 * ⚠️  This number no longer has a stylesheet to agree with. It used to be pinned to a
 * `max-width: 1024px` block in WhyPartners.module.scss that stacked the bento and hid its chips
 * at the same threshold; that section is now a flat grid of figures with no pose slot at all, so
 * this is a bare constant. It only matters again if a `[data-globe-slot="why"]` is ever
 * reintroduced — there is none in the DOM today, and `slotRect("why")` returning null is a
 * handled path, which is why the pose machinery below is dormant rather than broken.
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
  /**
   * The scroll position and window width the current transform was computed for.
   *
   * The frame loop compares against these to decide whether it has anything to do at all —
   * see the guard at the top of it. `-1` so the first frame always runs.
   */
  const lastScrollRef = useRef(-1);
  const lastWidthRef = useRef(-1);

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
      // ── Nothing to do unless something actually moved ──────────────────
      //
      // This loop writes ONE transform, but it reads two `getBoundingClientRect`s to work
      // out what to write, and each of those forces layout. Left unguarded that is a
      // synchronous layout twice a frame for the life of the page — including the whole
      // time the reader is sitting still reading the hero, which is most of it.
      //
      // Three things can make the transform stale: the page scrolled, the window resized,
      // or an animation is still running (the hero entrance, or a pose easing toward its
      // target). Nothing else — the slots do not move on their own. So when none of those
      // hold, the loop keeps ticking (a rAF that returns immediately costs nothing) and
      // touches neither layout nor style.
      //
      // ⚠️  `scrollY` is the trigger rather than a `scroll` listener because this has to
      // agree with the value the maths below uses; a listener would set a flag that a later
      // frame reads against a different scroll position.
      const scrollNow = window.scrollY;
      const settling =
        !still && readyAtRef.current && Date.now() - readyAtRef.current < HOLD_MS + SETTLE_MS;
      const posing =
        Math.abs(poseNowRef.current.dx - poseTargetRef.current.dx) > 1e-4 ||
        Math.abs(poseNowRef.current.dy - poseTargetRef.current.dy) > 1e-4 ||
        Math.abs(poseNowRef.current.scale - poseTargetRef.current.scale) > 1e-4;
      const moved =
        scrollNow !== lastScrollRef.current || window.innerWidth !== lastWidthRef.current;
      // `sizeRef` guards the very first frame, which has to run to size the layer at all.
      // Before the globe reports ready the entrance offset is a CONSTANT, so that state is
      // static too and needs no exception of its own.
      if (!moved && !settling && !posing && sizeRef.current) {
        // Still hand `lastTime` the clock, or the first frame after a quiet spell would
        // see a `dt` covering the whole spell and snap the pose in one jump.
        lastTimeRef.current = Date.now();
        rafRef.current = window.requestAnimationFrame(frame);
        return;
      }
      lastScrollRef.current = scrollNow;
      lastWidthRef.current = window.innerWidth;

      const hero = slotRect("hero");
      const why = slotRect("why");

      if (hero) {
        // One size for the layer: the hero slot's width times HERO_ZOOM — the LARGEST
        // the globe is ever drawn, which is the state the page opens in. It is never
        // resized after this: resizing means reallocating Mapbox's framebuffer, and
        // everything that wants the globe smaller — the scroll shrink below, and every
        // section's pose — asks through a transform instead, which is a compositor
        // scale and always a DOWNSCALE (see the note at the top of this file).
        const size = Math.round(hero.width * HERO_ZOOM);
        if (size > 0 && size !== sizeRef.current) {
          sizeRef.current = size;
          layer.style.width = `${size}px`;
          layer.style.height = `${Math.round(size / MAP_ASPECT)}px`;
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
        // The layer's own drawn height, which is NO LONGER its width. It was, while this
        // held a square holding a sphere, and every `size / 2` below quietly meant "half
        // the height" as well as "half the width". Reshaping the layer into a band without
        // splitting the two hung the map 475px above its slot — the maths still centred it
        // as though it were 1440px tall.
        const height = size / MAP_ASPECT;
        const centreX = (r: DOMRect) => r.left + r.width / 2;
        const centreY = (r: DOMRect) => r.top + r.height / 2;
        // Horizontally centred on the WINDOW, not on the slot. The slot is full-bleed and
        // breaks out of the hero's padding with a `calc(50% - 50vw)` margin, which lands
        // a dozen pixels off centre — 100vw counts the scrollbar and the percentage does
        // not. The map is exactly the window's width, so the window is the only thing it
        // can be centred against without that arithmetic mattering.
        const cx = why
          ? centreX(hero) + (centreX(why) - centreX(hero)) * p
          : window.innerWidth / 2;
        const cy = why ? centreY(hero) + (centreY(why) - centreY(hero)) * p : centreY(hero);

        // The scroll shrink, hoisted from further down because the vertical target depends on it.
        const shrinkT = smoothstep(clamp01(window.scrollY / (vh * SCROLL_SHRINK_VH)));
        const shrink = 1 + (SCROLL_SHRINK_TO - 1) * shrinkT;

        // ── THE GLOBE'S TOP IS ANCHORED TO THE SLOT'S TOP, NOT ITS CENTRE ──
        // ⚠️  THIS IS WHAT STOPS THE SHRINK OPENING A GAP ABOVE THE GLOBE. `transform-origin` is
        // 50% 50%, so scaling by `s` pulls the visual top DOWN by `height/2 * (1 - s)` — at the 0.5
        // shrink that is 306px of empty canvas between the hero copy and the globe's crown, with
        // another 306px of it below. Centring was correct while the globe never changed size.
        //
        // Solving `target.y + height/2 * (1 - s) = hero.top` for `target.y` gives the line below, so
        // the crown sits on the slot's top edge at EVERY scale. At rest `s` is 1 and the term is
        // zero, which is why this changes nothing about how the page opens — verified: visual top
        // 392 before and after.
        //
        // The `why` branch keeps the old centre-based maths. It is dormant (there is no
        // `[data-globe-slot="why"]` in the DOM) and a pose that travels between two slots wants
        // their centres, not their tops.
        const target = {
          x: cx - size / 2,
          y: why ? cy - height / 2 : hero.top - (height / 2) * (1 - shrink),
        };

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

        // The hero zoom, unwound by scroll. `zoom` runs 1 -> 1/HERO_ZOOM, so the
        // rendered diameter runs `hero.width * HERO_ZOOM` -> `hero.width`: the globe
        // opens oversized and settles to exactly the size the slot reserves.
        //
        // Which also keeps every pose's meaning intact. A pose scale is defined against
        // the SLOT, not the canvas, and by the time any section asks for one the reader
        // has scrolled well past this window — so `zoom` is already 1/HERO_ZOOM there and
        // `pose.scale * zoom` renders `pose.scale x hero.width`, exactly as before.
        const zoomOut = smoothstep(clamp01(window.scrollY / (vh * HERO_ZOOM_VH)));
        const zoom = 1 + (1 / HERO_ZOOM - 1) * zoomOut;

        // The scroll shrink — see SCROLL_SHRINK_TO. Driven off `scrollY` rather than the hero
        // slot's position for the same reason the hero zoom is: the slot is the thing the globe
        // is anchored to and it is not what is moving.
        // (computed above the target, which now needs it — see the note there.)

        // ── STILL NO DOWNWARD OFFSET, but for a different reason now ──────
        // There was one here and it existed for a SPHERE: a globe grown about its centre
        // pushed its crown up through the CTA, so the excess diameter was spent downward
        // instead — pinning the crown and letting the limb run off the sides, which is where
        // a globe's size is read anyway.
        //
        // It came out when the map went flat, because a band pushed 213px down left the hero
        // showing the empty top of the canvas. The map is a SPHERE again — but the offset
        // still is not needed, and this is the bit worth keeping straight: it only ever
        // compensated for `HERO_ZOOM` drawing the globe LARGER than its slot, and HERO_ZOOM
        // is 1. There is no excess diameter to spend, so centring on the slot is correct.
        //
        // ⚠️  If HERO_ZOOM is ever raised above 1 again, this offset has to come back with it,
        // or the crown will grow up through the CTA exactly as it did before.

        // ONE writer, one transform. Slot position, hero entrance offset, hero zoom and
        // pose all compose here: translate first, then scale, so the scale is about the
        // sphere's own centre and not about the top-left of the page.
        layer.style.transform = `translate3d(${target.x + ox + px}px, ${
          target.y + oy + py
        }px, 0) scale(${pose.scale * zoom * shrink})`;
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
      <DemandGlobe onReady={onReady} focus={focus} zoomBoost={Math.log2(HERO_ZOOM)} />
    </div>
  );
};

export default wrapperHOC(GlobeTravel, {
  componentName: "GlobeTravel-ListWithUs",
  showForChina: true,
});
