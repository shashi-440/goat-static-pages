import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import mock from "../mock/mock.module.scss";
import styles from "./Steps.module.scss";
import room1 from "../../assets/thumbs/room-1.jpg";
import room2 from "../../assets/thumbs/room-2.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "How Does It Work" — Figma node 2141:3913.
 *
 * The rail plays itself. Each segment fills left to right, and the mock-up above
 * it plays its own beat while it does: the form types itself in under a caret,
 * the onboarding steps tick over, the portfolio rows arrive. Steps waiting their
 * turn sit dimmed, so attention follows the rail.
 *
 * The rail walks the three steps once and then stays full — it is a progress
 * indicator, and one that empties and refills forever stops meaning anything.
 * The mock-ups go on cycling underneath, which is what keeps the section alive.
 * Only a reload sends the rail back to the start.
 */

/** ONBOARDING panel — the checklist under the "amber Partnerships" row. */
const ONBOARDING = [
  { label: "Details received", badge: "DONE", dot: mock.dotDone, tone: mock.badgeGrey },
  { label: "Intro call", badge: "TODAY 4:30 PM", dot: mock.dotActive, tone: mock.badgeBlue },
  { label: "Commission & agreement", badge: "NEXT", dot: "", tone: mock.badgeGrey },
];

/** YOUR PORTFOLIO panel — the listings the partner has added. */
const PORTFOLIO = [
  { thumb: room1, tag: "LONDON · 42 BEDS", title: "Studio & en-suite rooms" },
  { thumb: room2, tag: "MANCHESTER · 18 BEDS", title: "Shared apartments" },
];

const STEP_LABELS = ["Step 1", "Step 2", "Step 3"];

/** How long one rail segment takes to fill. */
const SEGMENT_MS = 1400;
/** Beat between one segment finishing and the next starting. */
const HANDOVER_MS = 260;
/** How long the completed rail holds before the loop restarts. */
const HOLD_MS = 5000;
/**
 * One frame with the rail transition suppressed, so restarting snaps back to
 * zero instead of visibly draining right to left.
 */
const SNAP_MS = 40;
/** -1 is the resting state; 0-2 mean that step is currently filling. */
const AT_REST = -1;

/** Per-field typing duration and the beat between the two fields. */
const TYPE_MS = 560;
const GAP_MS = 140;

/**
 * "Properties listed" counts up from a running total rather than from zero —
 * partners are joining a live portfolio, not starting one.
 */
const COUNT_MS = 1250;
const PROPERTIES_FROM = 12000;
const PROPERTIES_TO = 16000;

/** Onboarding rows from this index on are the ones that arrive. */
const ARRIVES_FROM = 1;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Counts from → to over COUNT_MS whenever `run` flips true. */
const useCountFrom = (from: number, to: number, run: boolean) => {
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!run) return undefined;

    let raf = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / COUNT_MS);
      setValue(Math.round(from + (to - from) * easeOutCubic(progress)));
      if (progress < 1) raf = window.requestAnimationFrame(step);
    };

    setValue(from);
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [run, from, to]);

  return value;
};

/**
 * One field of the form, revealed a character at a time under a caret.
 *
 * The caret exists only while this field is being typed: it is not rendered at
 * rest, and the second delay in the pair hides it the moment the last character
 * lands, so nothing blinks once the writing is done.
 */
const TypedValue = ({ text, playing, delay }: { text: string; playing: boolean; delay: number }) => (
  <span
    className={styles.typed}
    style={{ "--type-dur": `${TYPE_MS}ms`, "--type-steps": text.length } as React.CSSProperties}
  >
    <span
      className={playing ? styles.typedText : ""}
      style={playing ? { animationDelay: `${delay}ms` } : undefined}
    >
      {text}
    </span>
    {playing ? (
      <span
        className={`${styles.caret} ${styles.caretTyping}`}
        // Travel starts at `delay`; the hide fires one field-duration later.
        style={{ animationDelay: `${delay}ms, ${delay + TYPE_MS}ms` }}
        aria-hidden="true"
      />
    ) : null}
  </span>
);

const Steps = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(AT_REST);
  const [snap, setSnap] = useState(false);
  /** Latched once the rail has filled all three segments; only a reload clears it. */
  const [railDone, setRailDone] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return undefined;
    }

    // Kept connected: the loop is endless, so it should stop costing anything
    // once the section is scrolled past.
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setInView(entry.isIntersecting)),
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const looping = inView && !reduced;

  useEffect(() => {
    if (!looping) return undefined;

    let timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    const runCycle = () => {
      timers.forEach(window.clearTimeout);
      timers = [];

      // Back to empty with transitions off, then start the first segment.
      setSnap(true);
      setActive(AT_REST);
      at(SNAP_MS, () => {
        setSnap(false);
        setActive(0);
      });

      let t = SNAP_MS;
      for (let i = 1; i < STEP_LABELS.length; i += 1) {
        t += SEGMENT_MS + HANDOVER_MS;
        at(t, () => setActive(i));
      }

      // The last segment lands here. From this point the rail is finished for
      // good: it has said what it had to say, and watching it drain and refill
      // on a loop turns a progress indicator into wallpaper. The mock-ups keep
      // cycling underneath — that is what reads as live — but the rail holds
      // full until the page is reloaded.
      at(t + SEGMENT_MS, () => setRailDone(true));

      t += SEGMENT_MS + HOLD_MS;
      at(t, runCycle);
    };

    runCycle();
    return () => timers.forEach(window.clearTimeout);
  }, [looping]);

  /** Step 1 reads as reached even at rest, which is what the frame draws. */
  const reached = active === AT_REST ? 0 : active;
  const isPlaying = (i: number) => active === i;
  const isPending = (i: number) => active !== AT_REST && i > active;

  const properties = useCountFrom(PROPERTIES_FROM, PROPERTIES_TO, isPlaying(2));

  const cardClass = (i: number) => `${styles.card} ${isPending(i) ? styles.cardDimmed : ""}`;

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <Reveal as="h2" className={styles.heading}>
          How Does It Work
        </Reveal>

        <div className={styles.body}>
          <div className={styles.rail}>
            {STEP_LABELS.map((label, i) => (
              <div className={styles.railCell} key={label}>
                <span
                  className={`${styles.railLabel} ${
                    railDone || i <= reached ? styles.railLabelReached : ""
                  }`}
                >
                  {label}
                </span>
                <span className={styles.railTrack} aria-hidden="true">
                  <span
                    className={styles.railFill}
                    style={
                      {
                        // Every rail starts empty and fills; nothing rests
                        // part-done. Once the walk is complete every segment is
                        // pinned full, so the cycles that keep the mock-ups
                        // moving no longer drag the rail back with them.
                        "--p": railDone ? 1 : Number(active !== AT_REST && i <= active),
                        "--d": snap && !railDone ? "0ms" : `${SEGMENT_MS}ms`,
                      } as React.CSSProperties
                    }
                  />
                </span>
              </div>
            ))}
          </div>

          <div className={styles.cols}>
            {/* Step 1 — the contact form, typing itself in. */}
            <div className={styles.col}>
              <div className={styles.frame}>
                <div className={mock.bezel}>
                  <div className={cardClass(0)}>
                    <div className={mock.crumb}>
                      <span className={mock.crumbL}>CONTACT FORM</span>
                      <span className={mock.crumbR}>STEP 1 OF 3</span>
                    </div>
                    <span className={`${mock.rule} ${styles.ruleA}`} />

                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Organisation</span>
                      <span className={styles.input}>
                        <TypedValue text="Acme Education" playing={isPlaying(0)} delay={0} />
                      </span>
                    </div>
                    <div className={`${styles.field} ${styles.fieldSpaced}`}>
                      <span className={styles.fieldLabel}>Work email</span>
                      <span className={styles.input}>
                        <TypedValue
                          text="partners@acme.edu"
                          playing={isPlaying(0)}
                          delay={TYPE_MS + GAP_MS}
                        />
                      </span>
                    </div>

                    <span className={styles.submit}>Get started</span>
                  </div>
                </div>
              </div>

              <div className={styles.copy}>
                {/* Figma labels this step "Affiliate Link", which belongs to the
                    benefits section — the mock-up and the body copy are both
                    about the contact form. Named for what it shows. */}
                <h3 className={styles.stepTitle}>Fill the form</h3>
                <p className={styles.stepBody}>
                  Fill out a simple contact form and get started instantly.
                </p>
              </div>
            </div>

            {/* Step 2 — the onboarding checklist ticking over. */}
            <div className={styles.col}>
              <div className={styles.frame}>
                <div className={mock.bezel}>
                  <div className={`${cardClass(1)} ${styles.cardFixed}`}>
                    <div className={mock.crumb}>
                      <span className={mock.crumbL}>ONBOARDING</span>
                      <span className={mock.crumbR}>STEP 2 OF 3</span>
                    </div>
                    <span className={`${mock.rule} ${styles.ruleB}`} />

                    <div className={styles.brandRow}>
                      <div className={mock.entry}>
                        <span className={mock.entryTitle}>amber Partnerships</span>
                        <span className={mock.entryNote}>Reaching out within 24 hours</span>
                      </div>
                      <span className={`${mock.badge} ${mock.badgeGreen}`}>CONTACTED</span>
                    </div>

                    {ONBOARDING.map((item, i) => {
                      const arrives = i >= ARRIVES_FROM && isPlaying(1);
                      return (
                        <div className={styles.statusGroup} key={item.label}>
                          <span className={mock.rule} />
                          <div
                            className={`${styles.statusRow} ${arrives ? styles.arrives : ""}`}
                            style={
                              arrives
                                ? { animationDelay: `${(i - ARRIVES_FROM) * 220 + 260}ms` }
                                : undefined
                            }
                          >
                            <span className={styles.statusLeft}>
                              <span className={`${mock.dot} ${item.dot}`} />
                              <span className={mock.name}>{item.label}</span>
                            </span>
                            <span className={`${mock.badge} ${item.tone}`}>{item.badge}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.copy}>
                <h3 className={styles.stepTitle}>Get Contacted</h3>
                <p className={styles.stepBody}>
                  Finalise your onboarding and become an official partner of amber.
                </p>
              </div>
            </div>

            {/* Step 3 — the portfolio filling up. */}
            <div className={styles.col}>
              <div className={styles.frame}>
                <div className={mock.bezel}>
                  <div className={`${cardClass(2)} ${styles.cardFixed}`}>
                    <div className={mock.crumb}>
                      <span className={mock.crumbL}>YOUR PORTFOLIO</span>
                      <span className={mock.crumbR}>+3 ADDED</span>
                    </div>
                    <span className={`${mock.rule} ${styles.ruleB}`} />

                    <div className={styles.stats}>
                      <div className={mock.stat}>
                        <span className={mock.label}>Properties listed</span>
                        <span className={mock.statValue}>
                          {properties.toLocaleString("en-US")}+
                        </span>
                        <span className={`${mock.bar} ${mock.barViolet} ${styles.fullBar}`} />
                      </div>
                      <div className={mock.stat}>
                        <span className={mock.label}>Beds available</span>
                        <span className={mock.statValue}>1M+</span>
                        <span className={`${mock.bar} ${mock.barTeal} ${styles.fullBar}`} />
                      </div>
                    </div>

                    <span className={`${mock.rule} ${styles.ruleC}`} />

                    {PORTFOLIO.map((item, i) => (
                      <div className={styles.portfolioGroup} key={item.tag}>
                        {i > 0 ? <span className={mock.rule} /> : null}
                        <div
                          className={`${styles.portfolioRow} ${isPlaying(2) ? styles.arrives : ""}`}
                          style={isPlaying(2) ? { animationDelay: `${520 + i * 220}ms` } : undefined}
                        >
                          <div className={styles.portfolioLeft}>
                            <Image
                              src={item.thumb}
                              alt=""
                              className={`${mock.thumb} ${mock.thumbMd}`}
                              width={30}
                              height={30}
                              isNotLazy
                            />
                            <div className={mock.entry}>
                              <span className={mock.entryTag}>{item.tag}</span>
                              <span className={mock.name}>{item.title}</span>
                            </div>
                          </div>
                          <span className={`${mock.badge} ${mock.badgeGreen}`}>ADDED</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.copy}>
                <h3 className={styles.stepTitle}>Enhance your student offerings</h3>
                <p className={styles.stepBody}>
                  Add accommodation to your portfolio and help students find homes easily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default wrapperHOC(Steps, {
  componentName: "Steps-PartnerWithUs",
  showForChina: true,
});
