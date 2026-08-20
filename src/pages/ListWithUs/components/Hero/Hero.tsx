import { useCallback, useEffect, useRef, useState } from "react";
import CustomLink from "@Components/CustomLink";
// Partner logo wall — temporarily off, see the note where it was rendered.
// import Ticker from "../Ticker/Ticker";
import { GLOBE_READY_EVENT } from "../GlobeTravel/GlobeTravel";
// Shared with About Us / Scholarship rather than copied, so every v2 page uses
// one scroll-reveal.
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Hero.module.scss";
import avatar1 from "../../assets/avatar-1.png";
import avatar2 from "../../assets/avatar-2.png";
import avatar3 from "../../assets/avatar-3.png";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Hero — Figma node 2483:9807.
 *
 * A centred stack on white: a large headline with the avatar cluster inline in it, the lede
 * and pill CTA under it, and the globe below — sized so it leaves through the bottom of the
 * viewport rather than sitting politely inside the section.
 *
 * This replaced a two-column arrangement (copy left, globe right). Only the ARRANGEMENT
 * changed: the ground is still white and the copy, the CTA's colour and the CTA's size are
 * all as they were. A blue gradient with white type and a black pill was tried here from a
 * reference and reverted — see the notes in the stylesheet for what it took and why it
 * went.
 *
 * The design positions the avatar cluster absolutely into a run of spaces in the
 * headline; here it is a real inline element between "front of" and "millions",
 * so the gap stays correct when the headline rewraps.
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
const AVATARS = [
  // Each avatar carries its own crop from the node — the source photos are not
  // framed identically, so one shared object-position would misalign the faces.
  { src: avatar1, alt: "", left: "-7.5%", top: "-7.5%", size: "115%" },
  { src: avatar2, alt: "", left: "-17%", top: "-19.74%", size: "134%" },
  { src: avatar3, alt: "", left: "0.18%", top: "2.56%", size: "100%" },
];

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
        <Reveal as="h1" className={styles.title} hold={!copyIn}>
          List your property in
          <br />
          front of{" "}
          <span className={styles.avatars} aria-hidden="true">
            {AVATARS.map((avatar, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <span className={styles.avatar} key={i}>
                <img
                  src={avatar.src}
                  alt=""
                  className={styles.avatarImage}
                  style={{
                    left: avatar.left,
                    top: avatar.top,
                    width: avatar.size,
                    height: avatar.size,
                  }}
                />
              </span>
            ))}
          </span>{" "}
          millions of students
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
