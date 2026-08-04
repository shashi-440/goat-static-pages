import { useEffect, useRef } from "react";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Steps.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

const STEPS = [
  {
    title: "Fill In Details",
    description: "Tell us who you are and where you study — it takes about three minutes.",
  },
  {
    title: "Tell us your dream",
    description: "Share the goal you want funded, in your own words. No essay format required.",
  },
  {
    title: "Get funded",
    description: "Shortlisted dreamers are announced each edition and paid directly.",
  },
];

// The fill runs 0 → 1 as the rail travels between these two points down the
// viewport, expressed as a fraction of viewport height.
//
// The span between them is the whole animation's scroll budget: 1.05 → 0.2 is
// 0.85 of a viewport, so the progression reads at a normal scrolling pace. An
// earlier 0.85 → 0.35 gave it only half a viewport and the three steps lit in a
// flick. Starting just past 1.0 means it begins the moment the rail appears from
// below, and it still completes on step 3 well before the section leaves — no
// pinning, the reader keeps control of the scroll.
const START = 1.05;
const END = 0.2;

/** Sums an element's layout offset left up to an ancestor. */
const offsetLeftWithin = (el: HTMLElement, ancestor: HTMLElement): number => {
  let x = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    node = node.offsetParent as HTMLElement | null;
  }
  return x;
};

/**
 * How to apply — three steps on a horizontal timeline whose rule fills as you
 * scroll, lighting each numbered chip as the fill passes it.
 *
 * Nothing is pinned: the progress is mapped to the section's own travel down the
 * viewport, so it finishes on step 3 and the page keeps scrolling normally.
 *
 * Degrades to a plain grey rule without JS, and shows the timeline complete for
 * reduced-motion users.
 */
const Steps = () => {
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const fill = fillRef.current;
    if (!rail || !fill) return undefined;

    const reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let chips: HTMLElement[] = [];
    let centres: number[] = [];
    let railW = 0;
    let lit = -1;

    const measure = () => {
      chips = Array.from(rail.querySelectorAll<HTMLElement>("[data-step-chip]"));
      railW = rail.clientWidth;
      // offsetLeft rather than rects: layout-based, so it is unaffected by the
      // Reveal transform on the heading block or any in-flight animation.
      centres = chips.map((c) => offsetLeftWithin(c, rail) + c.offsetWidth / 2);
    };

    const paint = (count: number) => {
      if (count === lit) return;
      lit = count;
      chips.forEach((chip, i) => {
        chip.classList.toggle(styles.chipActive, i < count);
      });
    };

    const update = () => {
      if (!railW) return;
      const top = rail.getBoundingClientRect().top;
      const start = window.innerHeight * START;
      const end = window.innerHeight * END;
      const progress = Math.min(1, Math.max(0, (start - top) / (start - end)));

      fill.style.transform = `scaleX(${progress.toFixed(4)})`;

      // Step 1's chip sits at the rail's very start, so it needs progress to have
      // actually begun before it counts as reached.
      const edge = progress * railW;
      paint(progress > 0 ? centres.filter((c) => c <= edge + 0.5).length : 0);
    };

    measure();

    if (reduced) {
      fill.style.transform = "scaleX(1)";
      paint(chips.length);
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    let raf = 0;
    const onScroll = () => {
      if (!raf) {
        raf = window.requestAnimationFrame(() => {
          raf = 0;
          update();
        });
      }
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
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <h2 className={styles.heading}>
            Get started in three easy steps.
            <br />
            <span className={styles.headingMuted}>Applying takes minutes.</span>
          </h2>
        </Reveal>

        <div ref={railRef} className={styles.rail}>
          {/* Track, with the dark progress fill scaling out of its left edge. */}
          <span className={styles.rule} aria-hidden="true">
            <span ref={fillRef} className={styles.ruleFill} />
          </span>

          <div className={styles.cols}>
            {STEPS.map((step, i) => (
              <div key={step.title} className={styles.col}>
                <span className={styles.chip} data-step-chip>
                  {i + 1}
                </span>
                <span className={styles.colTitle}>{step.title}</span>
                <span className={styles.colText}>{step.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default wrapperHOC(Steps, {
  componentName: "Steps-ScholarshipV2",
  showForChina: true,
});
