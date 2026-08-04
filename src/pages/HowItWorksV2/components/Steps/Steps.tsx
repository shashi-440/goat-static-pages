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
  },
  {
    title: "Accommodation Booked!",
    description:
      "Relax, pack your bags, and unravel a new life chapter — your room is confirmed, your move-in date is set, and our team stays a message away.",
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

            <div className={styles.media}>
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
