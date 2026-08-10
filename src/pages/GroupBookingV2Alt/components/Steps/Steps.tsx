import { useEffect, useRef } from "react";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Steps.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Everything the section renders comes from here, so a copy change is a one-place
 * edit and adding or dropping a step needs no other changes — the numbers are
 * derived from the index and the rail from the chips' measured positions.
 *
 * Curly quotes and a true em dash rather than the straight `"` and `-` of the
 * source doc — the heading already sets ’, and mixing the two on one page reads as
 * an oversight.
 */
const HEADING = "It’s easy to book with group";

const STEPS = [
  {
    title: "Fill in your details",
    body: "Click on the “Claim Now” & fill out our group booking form.",
  },
  {
    title: "Choose your stay",
    body: "Our dedicated team will help your squad find a comfy student home!",
  },
  {
    title: "Your squad’s new home is booked!",
    body: "Tell your friends to pack their bags — your exciting new journey awaits!",
  },
];

// Where down the viewport the fill edge sits, as a fraction of viewport height.
// Same value as HowItWorksV2's rail.
const FILL_LINE = 0.55;

/**
 * Sums an element's layout offset up to an ancestor.
 *
 * Deliberately uses offsetTop rather than getBoundingClientRect: every row is
 * wrapped in Reveal, which holds a translateY until the row scrolls into view.
 * Rects include that transform, so measuring them would place the rail against
 * wherever the rows happen to be mid-animation. offsetTop is pure layout, so the
 * rail lands on the chips' settled positions from the start.
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
 * How it works — HowItWorksV2's vertical stepper, on this page's dark band.
 *
 * A rail connects the numbered chips: a faint track with a bright fill that grows
 * as you scroll, so the line doubles as a progress indicator and each chip lights
 * as the fill reaches it. The rail spans chip-1-centre to chip-3-centre, measured
 * from layout, and the chips paint over it so it reads as passing behind them.
 *
 * Inverted for the dark ground rather than reused as-is: on the light page the
 * fill is near-black on grey, here it's white on a low-opacity white track, and a
 * reached chip fills white with dark type instead of the other way round.
 *
 * Media sits left of the stepper in a reserved slot. HowItWorksV2 pairs a clip
 * with every row; this is one slot for the whole section, held empty until there's
 * art for it — the space is what keeps the stepper where it will finally sit.
 *
 * Without JS the track still connects the chips; only the fill needs script.
 * Reduced-motion users get the rail filled solid, no scroll tracking.
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
    let chipCentres: number[] = [];
    let railTop = 0;
    let railHeight = 0;
    // How many chips are currently lit. The lit set is always a prefix of the rail,
    // so this one number identifies it — used to skip redundant class writes on
    // every scroll frame.
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

    const paintChips = (count: number) => {
      if (count === lit) return;
      lit = count;
      chips.forEach((chip, i) => {
        chip.classList.toggle(styles.markerActive, i < count);
      });
    };

    const update = () => {
      if (railHeight <= 0) return;
      // The fill edge tracks a fixed line down the viewport, so the bright part
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

  // data-nav-theme="dark" is how the shared Navbar knows to swap to its light logo
  // and white links while this band is behind it — without it the header keeps its
  // dark type and disappears against the section. Same opt-in the other dark
  // sections use (AboutUsV2's WhyAmberExists, CareerV2's CrewCTA, ScholarshipV2's
  // Categories).
  return (
    <section className={styles.section} data-nav-theme="dark">
      <Reveal as="h2" className={styles.heading}>
        {HEADING}
      </Reveal>

      <div className={styles.layout}>
        {/* PLACEHOLDER — reserved for the section's media. Left deliberately empty
            rather than filled with stand-in art: the slot holds the layout so the
            stepper sits where it will finally sit, and dropping a <video> or <img>
            in here needs no other change. */}
        <div className={styles.mediaSlot} aria-hidden="true" />

        <ul ref={rowsRef} className={styles.rows}>
          {/* Connector rail. Sits behind the chips; geometry set by the effect. */}
          <span ref={railRef} className={styles.rail} aria-hidden="true">
            <span ref={fillRef} className={styles.railFill} />
          </span>

          {STEPS.map((step, index) => (
            <Reveal as="li" key={step.title} className={styles.row} delay={index * 70}>
              {/* Derived, not written down, so reordering or inserting a step can't
                  leave the numbering stale. */}
              <span className={styles.marker} data-step-chip>
                {index + 1}
              </span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.body}>{step.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default wrapperHOC(Steps, {
  componentName: "Steps-GroupBookingV2",
  showForChina: true,
});
