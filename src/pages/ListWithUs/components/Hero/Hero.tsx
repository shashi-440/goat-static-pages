import { useCallback, useEffect, useRef, useState } from "react";
import CustomLink from "@Components/CustomLink";
// Partner logo wall — temporarily off, see the note where it was rendered.
// import Ticker from "../Ticker/Ticker";
import { GLOBE_READY_EVENT } from "../GlobeTravel/GlobeTravel";
// Shared with About Us / Scholarship rather than copied, so every v2 page uses
// one scroll-reveal.
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
/**
 * The headline's animated mark.
 *
 * Shared from Scholarship rather than rebuilt, and NOT CareerV2's `LottieIcon`, which is
 * otherwise the same idea: that one hosts the animation in a `<div>`, and a `<div>` inside an
 * `<h1>` is invalid — a heading takes phrasing content only. `InlineLottie` hosts it in a
 * `<span>` so it can sit in the line legitimately, and it dynamically imports lottie-web
 * (~250KB, client-only) so it stays out of both the page chunk and the server bundle.
 */
import InlineLottie from "../../../ScholarshipV2/components/InlineLottie/InlineLottie";
import hotelRoom from "../../assets/lottie/hotel-room.json";
import styles from "./Hero.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Hero — Figma node 2483:9807.
 *
 * A centred stack on white: a large two-line headline, the lede and pill CTA under it, and
 * the globe below — sized so it leaves through the bottom of the viewport rather than
 * sitting politely inside the section.
 *
 * This replaced a two-column arrangement (copy left, globe right). Only the ARRANGEMENT
 * changed: the ground is still white and the copy, the CTA's colour and the CTA's size are
 * all as they were. A blue gradient with white type and a black pill was tried here from a
 * reference and reverted — see the notes in the stylesheet for what it took and why it
 * went.
 *
 * The globe is `DemandGlobe`, a Mapbox 3D globe of the demand arriving into amber-listed
 * cities, and it does NOT live in this component — it is a single fixed layer owned by
 * `GlobeTravel` that parks over the empty slot below and later glides into "Why partners".
 * `hero-bg.jpg` survives as that component's fallback.
 *
 * `DemandMap` is the flat-projection version of the same network, still wired, though its
 * hand-authored label layout is stale for the current city list.
 *
 * ── The entrance ────────────────────────────────────────────────────────────
 * On landing, the globe holds the centre of the viewport on its own; then it settles
 * down into its place in the layout; then the headline and CTA rise in above it.
 *
 * The sequence is driven from the globe's `onReady`, NOT from a fixed CSS delay.
 * Mapbox takes a variable 1–3s to fetch its style and first tiles and the stage stays
 * transparent until then, so a timed animation would have played the whole entrance to
 * an empty box. There is also a hard fallback timer, because a hero whose copy is
 * gated on a third-party CDN is a hero that can fail to have any copy.
 *
 * The lift is a TRANSFORM, never a layout change: the copy keeps its space in the
 * document the whole time (hidden by opacity, as `Reveal` already does), so nothing
 * reflows and the entrance costs no layout shift.
 */
// ── THE AVATAR CLUSTER LIVED HERE ───────────────────────────────────────────
// Three cropped faces, sized in `em` so they tracked the headline's `clamp()`, sitting
// inline between "front of" and "millions of students". Removed with the headline they were
// set into: they were a device for making "millions of students" concrete, and the copy no
// longer makes a claim about students that wants illustrating. `avatar-1/2/3.png` are still
// in `assets/`, and the `.avatars` / `.avatar` / `.avatarImage` rules went from the
// stylesheet with this.

// The header watches for the `data-lwu-hero` attribute to know when the hero is
// half past, which is when its CTA appears in the bar. Same trick as the About Us
// navbar's data-nav-theme sections.
/**
 * How long the globe holds the centre before it starts moving down, measured from
 * `onReady`.
 *
 * 900ms rather than 650 because `onReady` fires when Mapbox's style loads, not when the
 * globe is actually on screen: the stage then fades in, and on a cold load the main
 * thread is busy enough decoding first tiles that the fade lags. Measured at 650ms, the
 * globe was visible for 62ms before it began to move — the pause at centre, which is the
 * whole first beat, had effectively disappeared.
 */
const HOLD_MS = 900;
/** How long the copy waits after the globe starts moving, so they overlap slightly. */
const COPY_AFTER_MS = 450;
/**
 * Longest the globe's own entrance will wait on Mapbox before starting anyway. Only
 * matters if `onReady` never arrives at all; a blocked CDN or refused token calls it
 * immediately via the failure path.
 */
const FALLBACK_MS = 2600;

/**
 * Hard cap on how long the HEADLINE will wait, measured from mount and independent of
 * the globe.
 *
 * This exists because the choreography and the page's job disagree. Measured cold,
 * Mapbox needed ~2.5s to fetch its style and first tiles; hanging the copy off that put
 * the H1 — the entire value proposition — at opacity 0 for 3.3 seconds. The globe still
 * gets its centre-hold-and-settle beat whenever it loads, but the copy stops waiting
 * eventually regardless, so a broken CDN cannot leave the hero wordless.
 *
 * 3.2s, not the 1.9s tried first: at 1.9s the cap was firing BEFORE the globe was
 * drawable on a cold load, which inverted the whole sequence — copy first, globe
 * afterwards. Paired with the `preconnect` in DemandGlobe, which cuts the real wait,
 * this is high enough that the designed order holds unless something is actually wrong.
 */
const COPY_CAP_MS = 3400;

const Hero = () => {
  /** Set once the globe is drawable (or has fallen back to the photo). */
  const [ready, setReady] = useState(false);
  /** Copy may appear. */
  const [copyIn, setCopyIn] = useState(false);
  const startedRef = useRef(false);
  /** The absolute safety timer, so the real sequence can cancel it. */
  const capRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const begin = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setReady(true);
  }, []);

  // Reduced motion skips the entrance outright: everything is simply present.
  useEffect(() => {
    const still =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      startedRef.current = true;
      setReady(true);
      setCopyIn(true);
      return undefined;
    }
    // The globe is no longer a child of this component, so readiness arrives as an
    // event from GlobeTravel rather than a callback.
    window.addEventListener(GLOBE_READY_EVENT, begin);
    const fallback = setTimeout(begin, FALLBACK_MS);
    capRef.current = setTimeout(() => setCopyIn(true), COPY_CAP_MS);
    return () => {
      window.removeEventListener(GLOBE_READY_EVENT, begin);
      clearTimeout(fallback);
      if (capRef.current) clearTimeout(capRef.current);
    };
  }, [begin]);

  useEffect(() => {
    if (!ready || copyIn) return undefined;
    // The globe made it in time, so the real sequence owns the copy from here. Without
    // cancelling the cap it could still fire mid-entrance and show the copy BEFORE the
    // globe had started moving, inverting the whole thing.
    if (capRef.current) {
      clearTimeout(capRef.current);
      capRef.current = null;
    }
    const copy = setTimeout(() => setCopyIn(true), HOLD_MS + COPY_AFTER_MS);
    return () => clearTimeout(copy);
  }, [ready, copyIn]);

  return (
    <section className={styles.hero} data-lwu-hero>
      <div className={styles.copy}>
        {/* Broken at the comma, which is the only place it can break: the two halves are
            the setup and the turn, and "not your / inbox" would split the phrase that
            carries the whole line. Kept as two lines rather than one because the section
            is built around a two-line headline — one long line at the top of the `clamp()`
            range runs most of the way across a wide display and stops reading as a
            centred stack. */}
        <Reveal as="h1" className={styles.title} hold={!copyIn}>
          {/* ⚠️  The explicit `{" "}` on both sides are REAL SPACE CHARACTERS and they are not
              decorative. JSX strips the whitespace around an element that sits on its own
              line, so without them `h1.textContent` reads "Fill yourrooms," — the visual gap
              would be `.mark`'s margin, which exists only in layout. A screen reader, a
              crawler and a copy-paste all get the joined string. Measured before adding them. */}
          Fill your{" "}
          <span className={styles.mark}>
            {/* A 0.9em layout box with the art scaled up inside it, so the mark tracks the
                headline's `clamp()` instead of being pinned to one viewport — this h1 runs
                34px to 56px, and a fixed px box would be half the cap height at one end and
                over it at the other.

                `scale` does the visible work: the comp is a 1080 square whose ink sits well
                inside it, so at 1x the room renders far smaller than its box implies. Scaling
                the host costs no layout, where growing `size` would stretch the line box.

                `delay` waits for the copy: the headline itself is gated on the globe being
                ready (`hold={!copyIn}`), so a mark that played on mount would have run while
                the line was still hidden. */}
            <InlineLottie data={hotelRoom} size={50} scale={1.9} delay={620} />
          </span>{" "}
          rooms,
          <br />
          not your inbox.
        </Reveal>

        <Reveal className={styles.lede} delay={120} hold={!copyIn}>
          <p className={styles.subtitle}>
            Make the most out of this partnership and avail the benefits
          </p>
          <CustomLink
            href="/"
            className={styles.cta}
            dataTestId="list-with-us-hero-cta"
          >
            List on amber
          </CustomLink>
        </Reveal>
      </div>

      {/* Reserves the globe's space. The globe itself lives in `GlobeTravel`, a single
          fixed layer that parks over this slot and later glides into the "Why partners"
          section — see the note at the top of that component. This box therefore holds
          layout only and is deliberately empty.

          It sits in a wrapper rather than being the flex child directly so the slot keeps
          its own width against `align-items: center` on the section. */}
      <div className={styles.stage}>
        <div className={styles.globeSlot} data-globe-slot="hero" />
      </div>

      {/* Partner logo wall, turned off for now. The component and its assets are
          untouched — restore by uncommenting this and the import at the top. */}
      {/* <Ticker /> */}
    </section>
  );
};

export default wrapperHOC(Hero, {
  componentName: "Hero-ListWithUs",
  showForChina: true,
});
