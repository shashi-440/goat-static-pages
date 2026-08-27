import { useEffect, useRef } from "react";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Steps.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

// Where down the viewport the fill edge sits, as a fraction of viewport height.
const FILL_LINE = 0.55;

/**
 * Placeholder clip for every step's media slot.
 *
 * Referenced by URL rather than imported: the webpack asset rule only covers
 * images (`png|svg|jpe?g|gif`) here and upstream, so a video import would not
 * build. CopyRspackPlugin's existing `src/pages/**\/assets/*.*` pattern emits
 * co-located page assets to this path, so no build config had to change.
 */
const PLACEHOLDER_VIDEO = "/assets/images/pages/HowItWorksV2/assets/step-placeholder.mp4";

interface Step {
  /** Card heading. */
  title: string;
  /** Supporting copy under the heading. */
  description: string;
  /** Clip for the media slot. Falls back to the shared placeholder. */
  video?: string;
  /** Optional poster frame shown before the clip can play. */
  poster?: string;
  /**
   * Tints the media container instead of leaving it on the default #f7f7f7.
   *
   * ⚠️  Needed because the step-two asset has a TRANSPARENT background — verified, 53% of it is
   * fully transparent alpha. On a white-ish container the phone mock-up floats with no ground; the
   * container's own colour becomes the artwork's background, so it has to be stated per step.
   */
  tint?: string;
}

const STEPS: Step[] = [
  {
    title: "Discover and Finalise",
    description:
      "Choose from a plethora of verified student home listings near your university, compare them side by side, and finalise the one that fits you best.",
  },
  {
    title: "Get your paperwork done",
    description:
      "Paperwork’s on us, no need to fuss — we handle the contracts, the deposit and every form in between, and keep you posted at every step.",
    // ⚠️  THE #F2F2F2 GROUND IS BAKED INTO THE CLIP, not just set on the container, and that is the
    // interesting part. The source (hgesjsdjklsdkjhdsjdskghkdgh.mov) is Apple HEVC WITH AN ALPHA
    // CHANNEL — 53% of every frame is fully transparent, which ffprobe under-reports as plain
    // `yuv420p`. Two facts follow and they box you in:
    //   · H.264 cannot carry alpha at all;
    //   · HEVC-with-alpha plays in Safari and NOT in Chrome.
    // The usual way out is two sources (VP9/WebM for Chrome, HEVC/MP4 for Safari). Not needed here:
    // the design puts this clip on a flat #F2F2F2 panel, so compositing that colour underneath gives
    // a pixel-identical result from one universally playable H.264 file. Verified — every corner of
    // the transcoded frame reads #F2F2F2.
    //
    // The trade, stated so nobody is surprised: this clip is no longer reusable on any other
    // background. Re-flatten from the source if the panel colour ever changes.
    //
    // 4.2MB HEVC -> 365KB H.264 at 1280x720, which is a real reduction and not a compression
    // artefact of the codec swap: the source was 1920x1080 and the media box is 712x475.
    video: "/assets/images/pages/HowItWorksV2/assets/step-processing.mp4",
    tint: "#f2f2f2",
  },
  {
    title: "Accommodation Booked!",
    description:
      "Relax, pack your bags, and unravel a new life chapter — your room is confirmed, your move-in date is set, and our team stays a message away.",
    // The first step to carry its own clip; the other two still fall back to the placeholder.
    //
    // ⚠️  REFERENCED BY URL, NOT IMPORTED, for the same reason as the placeholder above: the asset
    // rule only matches images, so `import` on an .mp4 does not build. CopyRspackPlugin's existing
    // `src/pages/**\/assets/*.*` pattern emits it to this path.
    //
    // Same treatment as step two, and for the same reason — see the long note there. The source
    // (hgshjssjhjhss.mov) is Apple HEVC WITH ALPHA, 61% of each frame transparent, so it cannot be
    // H.264 without losing the transparency and cannot stay HEVC without losing Chrome. #F2F2F2 is
    // composited underneath and the container is tinted to match, which makes the seam invisible.
    //
    // 4.8MB HEVC -> 380KB H.264 at 1280x720. This replaced an earlier 6.4MB stream copy of a
    // different source that was kept at 1080p; the weight problem went away with it.
    video: "/assets/images/pages/HowItWorksV2/assets/step-booked.mp4",
    // ⚠️  MUST MATCH THE COLOUR BAKED INTO THE CLIP ABOVE. The clip's own ground is #F2F2F2; leaving
    // the container on the stylesheet's #F7F7F7 default puts a five-level step right at the video's
    // edge, which reads as a visible rectangle around the artwork.
    tint: "#f2f2f2",
  },
];

/**
 * Sums an element's layout offset up to an ancestor.
 *
 * Deliberately uses offsetTop rather than getBoundingClientRect: every row is
 * wrapped in Reveal, which holds `translateY(32px)` until the row scrolls into
 * view. Rects include that transform, so measuring them would place the rail
 * against wherever the rows happen to be mid-animation. offsetTop is pure
 * layout, so the rail lands on the chips' settled positions from the start.
 */
const offsetTopWithin = (el: HTMLElement, ancestor: HTMLElement): number => {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
};

/**
 * Vertically stacked steps. Each row is a two-column grid: the numbered copy
 * block on the left, vertically centred against a large 3:2 media slot on the
 * right. Rows fade-and-rise in as they scroll into view.
 *
 * A rail in the left gutter connects the numbered chips: a grey track with a
 * dark fill that grows as you scroll, so the line doubles as a progress
 * indicator. The rail spans chip-1-centre to chip-3-centre, measured from
 * layout, and the chips paint over it so it reads as passing behind them.
 *
 * Without JS the grey track still connects the chips; only the fill needs
 * script. Reduced-motion users get the rail filled solid, no scroll tracking.
 */
const Steps = () => {
  const rowsRef = useRef<HTMLUListElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rows = rowsRef.current;
    const rail = railRef.current;
    const fill = fillRef.current;
    if (!rows || !rail || !fill) return undefined;

    const reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Rail geometry, in px from the top of the rows container.
    let chips: HTMLElement[] = [];
    // Each chip's centre, same coordinate space as railTop.
    let chipCentres: number[] = [];
    let railTop = 0;
    let railHeight = 0;
    // How many chips are currently lit. The lit set is always a prefix of the
    // rail, so this one number identifies it — used to skip redundant class
    // writes on every scroll frame.
    let lit = -1;

    const measure = () => {
      chips = Array.from(rows.querySelectorAll<HTMLElement>("[data-step-chip]"));
      if (chips.length < 2) {
        railHeight = 0;
        return;
      }
      chipCentres = chips.map((chip) => offsetTopWithin(chip, rows) + chip.offsetHeight / 2);
      railTop = chipCentres[0];
      railHeight = chipCentres[chipCentres.length - 1] - railTop;

      rail.style.top = `${railTop}px`;
      rail.style.bottom = "auto";
      rail.style.height = `${Math.max(0, railHeight)}px`;
    };

    // Light every chip the fill has already reached.
    const paintChips = (count: number) => {
      if (count === lit) return;
      lit = count;
      chips.forEach((chip, i) => {
        chip.classList.toggle(styles.markerActive, i < count);
      });
    };

    const update = () => {
      if (railHeight <= 0) return;
      // The fill edge tracks a fixed line down the viewport, so the dark part
      // covers every chip already scrolled past it.
      const railTopInViewport = rows.getBoundingClientRect().top + railTop;
      const line = window.innerHeight * FILL_LINE;
      const progress = Math.min(1, Math.max(0, (line - railTopInViewport) / railHeight));
      fill.style.transform = `scaleY(${progress.toFixed(4)})`;

      // Nothing is lit until the fill actually starts, otherwise chip 1 — whose
      // centre IS the rail's top — would read as reached before you get there.
      const edge = railTop + progress * railHeight;
      paintChips(progress > 0 ? chipCentres.filter((c) => c <= edge + 0.5).length : 0);
    };

    measure();

    if (reduced) {
      // No scroll tracking: show the journey complete.
      fill.style.transform = "scaleY(1)";
      paintChips(chips.length);
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    let raf = 0;
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    const onResize = () => {
      measure();
      update();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className={styles.section}>
      <Reveal className={styles.headingBlock}>
        <h2 className={styles.heading}>
          From search to keys
          <br />
          <span className={styles.headingMuted}>Three steps, no surprises.</span>
        </h2>
      </Reveal>

      <ul ref={rowsRef} className={styles.rows}>
        {/* Connector rail. Sits behind the chips; geometry set by the effect. */}
        <span ref={railRef} className={styles.rail} aria-hidden="true">
          <span ref={fillRef} className={styles.railFill} />
        </span>

        {STEPS.map((step, i) => (
          <Reveal as="li" key={step.title} className={styles.row}>
            <div className={styles.copy}>
              <span className={styles.marker} data-step-chip>
                {i + 1}
              </span>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardText}>{step.description}</p>
            </div>

            {/* The tint is inline because it is per-step data; the class carries everything else.
                Undefined leaves the stylesheet's own #f7f7f7 in place rather than overriding it
                with a literal, so the default lives in one file. */}
            <div
              className={styles.media}
              style={step.tint ? { background: step.tint } : undefined}
            >
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                className={styles.video}
                src={step.video ?? PLACEHOLDER_VIDEO}
                poster={step.poster}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
};

export default wrapperHOC(Steps, {
  componentName: "Steps-HowItWorksV2",
  showForChina: true,
});
