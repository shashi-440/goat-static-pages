import { useEffect, useRef, useState } from "react";
import CustomLink from "@Components/CustomLink";
import wrapperHOC from "@Utils/wrapperHOC";
import styles from "./Journey.module.scss";
// Founder portrait: the shades-less face plus the shades as a separate layer, so
// the shades can drop in over a face that stays still. Reused from CareerV2.
import founderPlain from "../../../CareerV2/assets/founder-plain.png";
import founderShades from "../../../CareerV2/assets/founder-shades.png";
import signatureImg from "../../../CareerV2/assets/signature-mask.png";

// The four consequences, revealed one at a time after the headline lands.
const BODY_LINES = [
  "A safe room means students can focus on university.",
  "A faster booking means parents worry less.",
  "A smoother arrival means the first week starts with excitement.",
  "Every product built, every partnership created, every conversation had, moves that journey ahead.",
];

// The headline animates word by word; the body only starts arriving once the
// headline has finished, which is the sequencing the copy asks for.
const HEADLINE = "A single booking shapes an entire journey";
const WORD_STEP = 90; // ms between headline words
const BODY_STEP = 220; // ms between body lines
const BODY_GAP = 320; // ms pause after the headline before the body starts

/**
 * Section 3 — the founder's framing of the work.
 *
 * Sequenced on scroll-in: the headline assembles word by word, pauses, then the
 * four body lines arrive one at a time. Everything is rendered in the DOM from
 * the first paint (only opacity/transform animate), so the copy is present for
 * crawlers and for anyone with JS or motion disabled.
 */
const Journey = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const words = HEADLINE.split(" ");
  // How many headline words / body lines have arrived so far.
  const [wordsIn, setWordsIn] = useState(0);
  const [linesIn, setLinesIn] = useState(0);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const showAll = () => {
      setWordsIn(words.length);
      setLinesIn(BODY_LINES.length);
    };

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showAll();
      return undefined;
    }

    const timers: number[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();

          words.forEach((_, i) => {
            timers.push(window.setTimeout(() => setWordsIn(i + 1), i * WORD_STEP));
          });

          // Body copy arrives only after the headline has fully landed.
          const bodyStart = words.length * WORD_STEP + BODY_GAP;
          BODY_LINES.forEach((_, i) => {
            timers.push(window.setTimeout(() => setLinesIn(i + 1), bodyStart + i * BODY_STEP));
          });
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
    // words is derived from a module-level constant, so this runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} data-nav-theme="dark">
      <div className={styles.inner}>
        {/* Attribution sits above the headline so the reader knows whose voice
            this is before they read it. */}
        <div className={styles.attribution}>
          <span
            className={styles.avatar}
            style={{
              backgroundImage: `url(${founderPlain})`,
              ["--av-shades" as any]: `url(${founderShades})`,
            }}
            role="img"
            aria-label="Saurabh Goel, Co-founder and CEO at amber"
          >
            <span className={styles.shades} aria-hidden="true" />
          </span>
          <div className={styles.attributionText}>
            <span
              className={styles.signature}
              style={{ maskImage: `url(${signatureImg})`, WebkitMaskImage: `url(${signatureImg})` }}
              aria-hidden="true"
            />
            <p className={styles.role}>Co-founder &amp; CEO, amber</p>
          </div>
        </div>

        <h2 className={styles.headline}>
          {words.map((word, i) => (
            <span
              // Words repeat across the headline, so the index has to be part of the key.
              key={`${word}-${i}`}
              className={`${styles.word} ${i < wordsIn ? styles.wordIn : ""}`}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h2>

        <div className={styles.body}>
          {BODY_LINES.map((line, i) => (
            <p key={line} className={`${styles.line} ${i < linesIn ? styles.lineIn : ""}`}>
              {line}
            </p>
          ))}
        </div>

        {/* Links to the scale-of-work section (the map + figures) below, per the
            copy note. Revealed with the final body line rather than after it, so
            it is on screen by the time the reader reaches the bottom. */}
        <p
          className={`${styles.workLink} ${
            linesIn >= BODY_LINES.length - 1 ? styles.workLinkIn : ""
          }`}
        >
          <CustomLink to="#our-scale" className={styles.link}>
            That&rsquo;s the work
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3.5 8h9M8.5 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </CustomLink>
        </p>
      </div>
    </section>
  );
};

export default wrapperHOC(Journey, {
  componentName: "Journey-CareerV3",
  showForChina: true,
});
