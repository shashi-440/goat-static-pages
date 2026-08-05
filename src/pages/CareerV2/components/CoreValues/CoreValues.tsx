import { useEffect, useRef, useState } from "react";
import wrapperHOC from "@Utils/wrapperHOC";
import LottieIcon, { LottieIconHandle } from "../LottieIcon/LottieIcon";
import styles from "./CoreValues.module.scss";
// Lottie animations, recoloured to $neutral7 (#374151) to match one another and
// sized to the same 32px box.
import globeAnim from "../../assets/lottie/globe.json";
import rocketAnim from "../../assets/lottie/rocket.json";
import graduationAnim from "../../assets/lottie/graduation.json";
import searchAnim from "../../assets/lottie/search.json";

const VALUES = [
  {
    icon: globeAnim,
    title: "Think Beyond Borders",
    body: "Every decision we make impacts students moving across countries, cultures, and time zones. We build for a global community—not just one market.",
  },
  {
    icon: rocketAnim,
    title: "Build Like an Owner",
    body: "Great ideas can come from anywhere. We trust people to take ownership, move quickly, and create meaningful impact regardless of their role.",
  },
  {
    icon: graduationAnim,
    title: "Start With Students",
    body: "Every feature starts by asking, “Does this make a student’s life easier?”",
  },
  {
    icon: searchAnim,
    title: "Stay Curious",
    body: "The world of education, travel, and technology never stands still. We learn constantly, challenge assumptions, and keep improving every student journey.",
  },
];

// Gap between each card's entrance, in ms.
const STAGGER = 160;

/**
 * Four core-value cards divided by hairline rules (Figma 2665:13603).
 *
 * On scroll-in the cards reveal one by one, each firing its icon animation once
 * as it appears; the animations then hold their final frame. Hovering an
 * individual card replays just that card's icon.
 */
const CoreValues = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const iconRefs = useRef<(LottieIconHandle | null)[]>([]);
  // How many cards have been revealed so far — drives both the CSS entrance and
  // each icon's one-shot play.
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const revealAll = () => setRevealed(VALUES.length);

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealAll();
      return undefined;
    }

    const timers: number[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          // Reveal one card at a time.
          VALUES.forEach((_, i) => {
            timers.push(window.setTimeout(() => setRevealed(i + 1), i * STAGGER));
          });
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <h2 className={`${styles.heading} ${revealed > 0 ? styles.headingShown : ""}`}>Core Values</h2>

      <div className={styles.grid}>
        {VALUES.map((value, i) => (
          <div
            key={value.title}
            className={`${styles.card} ${i < revealed ? styles.cardShown : ""}`}
            // Hovering a card replays only that card's icon.
            onMouseEnter={() => iconRefs.current[i]?.replay()}
          >
            <LottieIcon
              ref={(el) => {
                iconRefs.current[i] = el;
              }}
              animationData={value.icon}
              size={32}
              play={i < revealed}
            />
            <div className={styles.text}>
              <h3 className={styles.cardTitle}>{value.title}</h3>
              <p className={styles.cardBody}>{value.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default wrapperHOC(CoreValues, {
  componentName: "CoreValues-CareerV2",
  showForChina: true,
});
