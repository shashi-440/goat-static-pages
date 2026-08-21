import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./WhyPartners.module.scss";
import { GLOBE_FOCUS_EVENT, GLOBE_POSE_EVENT } from "../GlobeTravel/GlobeTravel";
import type { GlobePose } from "../GlobeTravel/GlobeTravel";
import type { GlobeFocus } from "../DemandGlobe/DemandGlobe";
// The backdrop this section already owned: it was behind the bento's chart card before
// the bento became this panel. Swap the import to change the picture — nothing else in
// the layout depends on which photo it is.
import panelBg from "../../assets/bento-bg.jpg";
// The three faces the hero already uses in its headline. Reused rather than a new set: the
// support line is about amber's people and these are amber's people everywhere else on the page.
import avatar1 from "../../assets/avatar-1.png";
import avatar2 from "../../assets/avatar-2.png";
import avatar3 from "../../assets/avatar-3.png";
// The busiest listed cities, read off the same array the sphere flies its pins from — so the
// coverage card and the globe beside it can never disagree about which cities those are.
import { PROPERTIES } from "../DemandMap/network";

/**
 * "Your place is made for amber".
 *
 * A bordered panel: a stepped rail down the left where the active step opens to show
 * its detail, and the section's visual on the right. The visual is the SAME globe the
 * hero uses — it flies in from there on scroll and settles into the slot below. See
 * `GlobeTravel`, which owns the only instance; the `[data-globe-slot="why"]` box here
 * holds its space and nothing else.
 *
 * This replaced a bento of stat cards (a tall device mock plus a 2x2 grid). Every
 * figure that bento carried is still here, moved into the rail — the numbers were the
 * point of that section, the card chrome was not.
 */

interface Step {
  /** Rail label, always visible. */
  title: string;
  /**
   * Shown only while this step is the active one. ONE SENTENCE.
   *
   * These were two and three sentences each and were cut to one. The rail is read while the
   * reader is also watching the sphere move and a card open beside it; a paragraph here is
   * competing with both, and the card now carries the substance.
   */
  body: string;
  /** What the globe emphasises while this step is open. */
  focus: GlobeFocus;
  /**
   * Where the sphere sits and how big it is while this step is open — see `GlobePose`.
   *
   * The offsets are what FREE the space the card opens into: the sphere shrinks and slides away
   * from the side the card arrives on, rather than the card being laid over a sphere that has not
   * moved. Which is why every step has a non-zero `dx`, opposite to its card's side.
   */
  pose: GlobePose;
  /** The card that opens beside the sphere. Every step has one. */
  card: StepCard;
}

/**
 * The card that slides in next to the sphere.
 *
 * FOUR BESPOKE CARDS, not four instances of one card. Each `kind` has its own renderer and its
 * own shape, and that is the point rather than an accident of growth.
 *
 * Two generic systems were tried here and both failed the same way. First a single large figure
 * per step, then a label over a body — either a grid of numbers or a list of ticks. Both were
 * legible and both made the four steps interchangeable: same plate, same caps label, same block
 * underneath, so scrolling the rail changed the words and nothing else. A reader cannot tell four
 * claims apart if the section shows them the same object four times.
 *
 * So each step now shows the ARTEFACT its claim is about:
 *
 *   · `demand`      — an analytics panel. A traffic chart, because the claim is about traffic.
 *   · `coverage`    — a table of real cities with flags and counts, because the claim is a map.
 *   · `costs`       — a fee statement that totals to zero, because the claim is a bill.
 *   · `performance` — a per-property table, because the claim is per-property reporting.
 *
 * What they DO share is the plate: the glass, the border, the label, the arrival. That is
 * deliberate — the family resemblance is what keeps them one component and stops the section
 * looking like four unrelated widgets that happen to appear in the same slot.
 */
type StepCard = {
  /** Small caps header. */
  label: string;
  /** Which side of the panel the card opens on. */
  side: "left" | "right";
} & (
  | { kind: "demand" }
  | { kind: "coverage" }
  | { kind: "costs" }
  | { kind: "performance" }
);

/**
 * Twelve months of traffic for the demand card's chart, as relative heights.
 *
 * Shape over values: it is read as "up and to the right, with the wobble a real month has", so
 * the dips matter as much as the rise. A monotonic ramp reads as a decoration; this reads as data.
 *
 * ⚠️ ILLUSTRATIVE, like every figure in this section.
 */
const TRAFFIC = [34, 39, 36, 45, 49, 46, 56, 62, 59, 70, 79, 88];

/** The three busiest listed cities, for the coverage card. Derived — see the import. */
const TOP_CITIES = [...PROPERTIES].sort((a, b) => b.enquiries - a.enquiries).slice(0, 3);

/**
 * Per-property performance for the last card.
 *
 * ⚠️ ILLUSTRATIVE, and the NAMES ARE INVENTED — deliberately generic ones. This card is the one
 * place in the section where a row is shaped like a specific building, and naming a real
 * operator's property beside an invented occupancy figure would be a fabricated claim about
 * someone else's business. The same rule the partner logos follow — see `PARTNERS` in
 * `DemandMap/network.ts`.
 */
const PERFORMANCE = [
  { name: "Maple House", filled: 96, trend: "up" as const },
  { name: "City Studios", filled: 92, trend: "up" as const },
  { name: "Riverside Hall", filled: 89, trend: "flat" as const },
];

/**
 * The four claims, in the order a partner would ask them: is there demand, what am I joining,
 * what does it cost, and how will I know it is working.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  EVERY FIGURE IN THIS SECTION IS ILLUSTRATIVE. NONE OF IT IS MEASURED.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * They are written to be INTERNALLY CONSISTENT, which matters more than any single one being
 * impressive — a partner who divides two of them and gets nonsense stops believing all of them:
 *
 *   · 600k bookings x $1.7k average = ~$1.02Bn, which is the "$1Bn+ delivered" figure.
 *   · 600k bookings against 9.2M monthly visits is ~0.5% of annual traffic, which is the right
 *     order for a marketplace rather than the 10% a made-up number tends to imply.
 *   · 2M+ beds across 12k+ properties is ~165 beds per property, which is what a purpose-built
 *     student block actually holds.
 *   · 14 countries is not invented: it is the number of country-level pages amber publishes,
 *     counted from its sitemap — see the header of `DemandMap/network.ts`.
 */
const STEPS: Step[] = [
  {
    title: "Demand that finds you",
    body: "Students at the point of booking, not passive traffic.",
    focus: "origins",
    // ⚠️ ALL FOUR POSES ARE FRACTIONS OF THE HERO SLOT, not of this section's. GlobeTravel sizes
    // its one canvas from the hero slot — 720px at the widest — so a scale of 1 would draw the
    // sphere at 720 here, and 0.62 is what fits the band left over beside a 260px card.
    //
    // Which means the hero slot's width is an input to this file. If it moves, re-derive these
    // from the rendered sizes: the symptom of forgetting is a card sitting under the sphere.
    //
    // `dx` is derived, not tuned. The card occupies 34 + 260 of one side, so the sphere's usable
    // band is ~514px and its centre has to move ~157px off the panel's centre to sit in the
    // middle of it: 157 / 720 = 0.218. The coverage card is 20px wider and pays for it with 0.232.
    pose: { dx: -0.218, dy: 0, scale: 0.62 },
    card: { kind: "demand", label: "Demand", side: "right" },
  },
  {
    title: "The network you join",
    body: "One listing reaches every market amber already covers.",
    focus: "destinations",
    pose: { dx: 0.232, dy: 0, scale: 0.62 },
    card: { kind: "coverage", label: "Where you'd be listed", side: "left" },
  },
  {
    title: "Listing costs nothing",
    body: "No upfront fee, and every enquiry handled in one place.",
    focus: "arcs",
    pose: { dx: -0.218, dy: 0, scale: 0.62 },
    card: { kind: "costs", label: "What it costs", side: "right" },
  },
  {
    title: "See how it performs",
    body: "Demand, conversion and per-property numbers, live.",
    focus: "reach",
    pose: { dx: 0.218, dy: 0, scale: 0.62 },
    card: { kind: "performance", label: "After you list", side: "left" },
  },
];

/* ─────────────────────────────────────────────────────── the four card bodies ── */

/**
 * Demand: an analytics panel.
 *
 * The chart is inline SVG rather than divs or a library. Twelve bars is twelve elements either
 * way, but an SVG gives a `viewBox` — the bars are authored in a 0-100 space and the browser
 * scales them, so the card can change width without every bar needing a percentage.
 */
const DemandBody = () => (
  <>
    <span className={styles.headline}>
      <b>9.2M+</b>
      <em>monthly visits</em>
      {/* Direction of travel, which is what a chart is for. The pill repeats what the bars
          already show, on purpose: the bars are read at a glance and the number is read second. */}
      <i className={styles.trend}>+18%</i>
    </span>
    <svg className={styles.chart} viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true">
      {TRAFFIC.map((v, i) => (
        <rect
          key={i}
          // 12 bars across 100 units: 6.2 wide on an 8.33 pitch leaves a 2.1 gutter, and the
          // last bar ends flush with the right edge rather than a gutter short of it.
          x={i * 8.33}
          y={34 - (v / 100) * 34}
          width={6.2}
          height={(v / 100) * 34}
          rx={1}
          // The newest month is the one the eye should land on.
          opacity={i === TRAFFIC.length - 1 ? 1 : 0.42 + (i / TRAFFIC.length) * 0.3}
        />
      ))}
    </svg>
    <span className={styles.foot}>
      <span>
        <b>600k+</b> bookings a year
      </span>
      <span>
        <b>2x</b> booking rate
      </span>
    </span>
  </>
);

/**
 * Coverage: a table of real cities.
 *
 * Rows come from `TOP_CITIES`, which is `PROPERTIES` sorted — the same array the sphere flies its
 * pins from — so the three cities named here are the three the globe labels, and the flags are the
 * same files. Nothing here is typed twice.
 */
const CoverageBody = () => (
  <>
    <span className={styles.rows}>
      {TOP_CITIES.map((city) => (
        <span key={city.label} className={styles.row}>
          <img className={styles.rowFlag} src={city.flag} alt="" />
          <span className={styles.rowName}>{city.label}</span>
          <span className={styles.rowValue}>
            {city.enquiries.toLocaleString("en-GB")}
          </span>
        </span>
      ))}
    </span>
    {/* The three rows are a sample, and saying so is what stops them reading as the whole list. */}
    <span className={styles.more}>+257 more cities</span>
    <span className={styles.foot}>
      <span>
        <b>2M+</b> beds
      </span>
      <span>
        <b>12k+</b> properties
      </span>
    </span>
  </>
);

/**
 * Costs: a fee statement.
 *
 * Shaped like a bill because the claim is about a bill — three charges, a rule, then what you
 * actually pay. The zeros do the talking, so they are the only thing on the card at figure
 * weight.
 */
const CostsBody = () => (
  <>
    <span className={styles.rows}>
      {["Listing fee", "Monthly fee", "Setup fee"].map((fee) => (
        <span key={fee} className={styles.feeRow}>
          <span className={styles.rowName}>{fee}</span>
          <span className={styles.zero}>$0</span>
        </span>
      ))}
    </span>
    {/* The total line of a statement: ruled off, and the one row that is not a number. */}
    <span className={styles.total}>
      <span className={styles.rowName}>You pay</span>
      <span className={styles.totalValue}>on confirmed bookings</span>
    </span>
  </>
);

/**
 * Performance: a per-property table.
 *
 * The bar behind each row is drawn with a `width` percentage rather than an SVG, because here it
 * IS the number — a 96% bar is 96% of the row. Reading the chart and reading the figure are the
 * same act, which is the whole idea of the row.
 */
const PerformanceBody = () => (
  <>
    <span className={styles.rows}>
      {PERFORMANCE.map((prop) => (
        <span key={prop.name} className={styles.meterRow}>
          <span className={styles.meterHead}>
            <span className={styles.rowName}>{prop.name}</span>
            <span className={styles.rowValue}>{prop.filled}%</span>
          </span>
          <span className={styles.meter}>
            <span
              className={styles.meterFill}
              style={{ width: `${prop.filled}%` }}
            />
          </span>
        </span>
      ))}
    </span>
    <span className={styles.support}>
      <span className={styles.faces}>
        {[avatar1, avatar2, avatar3].map((src) => (
          <img key={src} className={styles.face} src={src} alt="" />
        ))}
      </span>
      24/7 partner support
    </span>
  </>
);

const CARD_BODIES = {
  demand: DemandBody,
  coverage: CoverageBody,
  costs: CostsBody,
  performance: PerformanceBody,
};

/**
 * Scroll distance, in pixels, allotted to each step.
 *
 * The panel pins while the reader scrolls through this, and progress through it selects
 * the step — so nobody is moved off a step they are still reading, which is what a timer
 * does. Measured on the reference this pattern comes from, its equivalent window is a
 * few hundred pixels per step; 300 is close and leaves the section from feeling like a
 * scroll trap.
 */
const STEP_SCROLL_PX = 300;

/**
 * Where the pinned panel parks, clearing the fixed header and its announcement rail.
 * Must match `top` on `.sticky` in the stylesheet.
 */
const STICKY_TOP = 96;

const WhyPartners = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [active, setActive] = useState(0);
  /** 0 → 1 through the pinned window; drives the rail's progress bar. */
  const [progress, setProgress] = useState(0);
  /** Only run the scroll maths while the section is anywhere near the viewport. */
  const [inView, setInView] = useState(false);

  /**
   * Clicking a step scrolls to where that step is selected, rather than setting state
   * directly. Setting state would immediately be overwritten by the next scroll frame,
   * so the only way a click can stick is to move the scroll position that owns it.
   */
  const pick = useCallback((i: number) => {
    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!track || !sticky) return;
    const total = track.offsetHeight - sticky.offsetHeight;
    if (total <= 0) return;
    const trackTop = track.getBoundingClientRect().top + window.scrollY;
    // Aim at the middle of the step's band so it is unambiguously selected.
    const target = trackTop - STICKY_TOP + ((i + 0.5) / STEPS.length) * total;
    window.scrollTo({ top: Math.round(target), behavior: "smooth" });
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      {
        rootMargin: "200px 0px",
      },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return undefined;

    // Reduced motion: no pinning, no scroll-driven stepping. The first step stays open
    // and the rail is navigable by click, which the stylesheet mirrors by dropping the
    // sticky positioning and the tall track.
    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) return undefined;

    const frame = () => {
      const track = trackRef.current;
      const sticky = stickyRef.current;
      if (track && sticky) {
        const total = track.offsetHeight - sticky.offsetHeight;
        if (total > 0) {
          const top = track.getBoundingClientRect().top;
          const p = Math.min(1, Math.max(0, (STICKY_TOP - top) / total));
          setProgress(p);
          // `p * length` and not `p * (length - 1)`: each step owns an equal band of the
          // window, so the last one gets a band too instead of only the final pixel.
          setActive(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length)));
        }
      }
      rafRef.current = window.requestAnimationFrame(frame);
    };
    frame();
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [inView]);

  // Tell the globe what to emphasise for the open step, and where to sit while it is
  // open — or hand it back to its default when the section is off screen, or it would stay
  // dimmed and shrunk for whatever section follows, the hero included on the way back up.
  //
  // ONE effect keyed on BOTH, deliberately. These were two effects, one per direction, and
  // the leaving one dispatched the default while the entering one only fired when `active`
  // changed. Coming back to a section sitting on step 0 therefore changed nothing: the
  // globe kept the default it was handed on the way out, so the first step lost its pose
  // entirely and the sphere stayed at full size until you scrolled far enough to reach
  // step 1. Deriving both signals from `(active, inView)` in one place cannot drift like
  // that.
  //
  // Two events rather than one: the emphasis is a prop the globe re-renders on, the pose is
  // read by its frame loop and re-renders nothing, so keeping them separate stops a pure
  // movement from repainting the map.
  useEffect(() => {
    const focus: GlobeFocus = inView ? STEPS[active].focus : "all";
    // Scale 1, not this section's baseline, when the globe is not ours: the hero's slot is
    // the layer's own size, so 1 is what the hero wants.
    const pose: GlobePose = inView
      ? STEPS[active].pose
      : { dx: 0, dy: 0, scale: 1 };
    window.dispatchEvent(new CustomEvent<GlobeFocus>(GLOBE_FOCUS_EVENT, { detail: focus }));
    window.dispatchEvent(new CustomEvent<GlobePose>(GLOBE_POSE_EVENT, { detail: pose }));
  }, [active, inView]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        {/* No standfirst under this heading, deliberately. The rail below already opens
            each claim into a paragraph of its own, so a line here was a third layer of
            introduction before the reader reached anything to read. */}
        <Reveal as="h2" className={styles.heading}>
          Your place is made for amber
        </Reveal>

        {/* The track is taller than the panel; the panel pins inside it, so scrolling
            that extra height is what walks the steps.
 
            The extra height is a SPACER SIBLING, not padding on the track. A sticky
            element is constrained within its containing block's CONTENT box, and
            padding sits outside that box — so `padding-bottom: 1200px` added 1200px of
            page height and exactly zero travel, and the panel never pinned at all. A
            real sibling grows the content box, which is what the constraint reads. */}
        <div ref={trackRef} className={styles.track}>
          <div ref={stickyRef} className={styles.sticky}>
            <div className={styles.panel}>
              <div className={styles.rail}>
                {/* One continuous bar behind the steps, growing downward with scroll —
                    the rail doubles as the section's progress indicator. */}
                <span
                  className={styles.railProgress}
                  style={{ transform: `scaleY(${progress})` }}
                  aria-hidden="true"
                />
                {STEPS.map((step, i) => {
                  const on = i === active;
                  return (
                    <button
                      key={step.title}
                      type="button"
                      className={`${styles.step} ${on ? styles.stepOn : ""}`}
                      onClick={() => pick(i)}
                      onFocus={() => pick(i)}
                      aria-current={on}
                    >
                      {/* The accent bar marks the active step and is the only coloured thing
                      in the rail, so the eye lands on it before reading. */}
                      <span className={styles.stepBar} aria-hidden="true" />
                      <span className={styles.stepMain}>
                        <span className={styles.stepTitle}>{step.title}</span>
                        {/* Kept in the DOM at all times rather than mounted per step: it is
                        real copy that should be readable by a crawler and a screen reader
                        whichever step happens to be open, and animating a height from a
                        mounted node cannot be done without measuring it. */}
                        <span className={styles.stepBodyWrap}>
                          <span className={styles.stepBody}>{step.body}</span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.visual}>
                {/* The backdrop.
 
                    No wash or overlay over it, and nothing glowing behind the sphere
                    either — the photo is shown at full strength and the globe sits
                    straight on it. Both were tried and both were wrong: a white wash left
                    the picture invisible, and a soft white disc behind the sphere (plus
                    Mapbox's own atmosphere rim, now also off — see DemandGlobe) read as a
                    hard halo drawn around the planet. The sphere's limb is ocean, so it
                    reads against the picture without help.
 
                    `isNotLazy`: it is the backdrop of the element the reader is looking at
                    by the time this section pins, so there is nothing to gain by deferring
                    it and a visible pop to lose. */}
                <Image
                  src={panelBg}
                  alt=""
                  className={styles.visualBg}
                  width="100%"
                  height="100%"
                  isNotLazy
                />

                {/* Holds the globe's space. The globe is a single fixed layer that flies
                    in from the hero — see GlobeTravel. Deliberately empty. */}
                <div className={styles.globeSlot} data-globe-slot="why" />

                {/* Every card stays MOUNTED and only its visibility changes.
                    Unmounting the outgoing one would cut its exit off mid-fade — there is
                    nothing left to animate once the node is gone — and it would re-run the
                    whole stagger on the way back to a step already seen. They occupy the
                    same absolute position, invisible at rest.

                    They also sit BEHIND the globe: the sphere is a fixed layer above this
                    one, its canvas corners are transparent, so a card may overlap the
                    globe's square box by a couple of dozen pixels with nothing hidden —
                    only the sphere itself covers anything. The steps' `pose` offsets are
                    sized against that. */}
                {STEPS.map((step, i) => {
                  const on = i === active;
                  return (
                    <div
                      key={step.title}
                      className={[
                        styles.card,
                        step.card.side === "left" ? styles.cardLeft : styles.cardRight,
                        step.card.kind === "coverage" ? styles.cardWide : "",
                        on ? styles.cardOn : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      // Decorative: every line here is either already in the step's copy
                      // or on the sphere's own labels, and a screen reader walking four
                      // hidden cards would hear the section four times over.
                      aria-hidden="true"
                      // The stagger is only on the way IN. Going out, the whole card
                      // leaves at once: a staggered exit reads as the card being reluctant
                      // to go, and it collides with the next one arriving.
                      style={{ transitionDelay: on ? "60ms" : "0ms" }}
                    >
                      <div className={styles.cardInner}>
                        <span className={styles.cardLabel}>{step.card.label}</span>

                        {/* One body per kind — see `StepCard`. The stagger stays on the card
                            rather than inside each body: the four bodies have different numbers
                            of children, so a per-child delay would have to be re-derived four
                            times to arrive at the same speed. */}
                        <span
                          className={styles.body}
                          style={{ transitionDelay: on ? "150ms" : "0ms" }}
                        >
                          {CARD_BODIES[step.card.kind]()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div
            className={styles.spacer}
            style={{ height: STEPS.length * STEP_SCROLL_PX }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
};

export default wrapperHOC(WhyPartners, {
  componentName: "WhyPartners-ListWithUs",
  showForChina: true,
});
