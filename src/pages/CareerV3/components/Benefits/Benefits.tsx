import { useEffect, useRef, useState } from "react";
import wrapperHOC from "@Utils/wrapperHOC";
import LottieIcon, { LottieIconHandle } from "../../../CareerV2/components/LottieIcon/LottieIcon";
import styles from "./Benefits.module.scss";
// Lottie animations reused from CareerV2, already recoloured and sized to a
// common 32px box.
import rocketAnim from "../../../CareerV2/assets/lottie/rocket.json";
import globeAnim from "../../../CareerV2/assets/lottie/globe.json";
import graduationAnim from "../../../CareerV2/assets/lottie/graduation.json";
import searchAnim from "../../../CareerV2/assets/lottie/search.json";

const PROMISES = [
  {
    icon: rocketAnim,
    title: "You can count on us",
    body:
      "A salary that respects the work, real bonuses and recognition, insurance that actually " +
      "covers what matters, meals, cab support, and help settling in if the job means a new city.",
  },
  {
    icon: globeAnim,
    title: "You never miss a moment worth celebrating",
    body:
      "Every festival, every background, every reason to mark the day — alongside the small " +
      "everyday things that make work feel less like work.",
  },
  {
    icon: graduationAnim,
    title: "You get time, when life needs it",
    body:
      "Paternity, maternity, adoption, bereavement, wellness leave, period leave, and a " +
      "flexi-culture that lets you work from home when you need to — because life doesn’t pause " +
      "just because it’s a Tuesday.",
  },
  {
    icon: searchAnim,
    title: "You get room to grow, your way",
    body:
      "A flat, open team where ownership matters more than tenure, autonomy is real, and you get " +
      "to learn directly from the people leading the company — not wait your turn.",
  },
];

// Gap between each card's entrance, in ms.
const STAGGER = 160;

/**
 * Section 6 — what you get working here.
 *
 * Four promise cards on the dark band. On scroll-in the cards reveal one by one,
 * each firing its icon animation once as it appears; hovering a card replays
 * just that card's icon. Same treatment as Career v2's Core Values.
 */
const Benefits = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const iconRefs = useRef<(LottieIconHandle | null)[]>([]);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(PROMISES.length);
      return undefined;
    }

    const timers: number[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          PROMISES.forEach((_, i) => {
            timers.push(window.setTimeout(() => setRevealed(i + 1), i * STAGGER));
          });
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} data-nav-theme="dark">
      <div className={`${styles.header} ${revealed > 0 ? styles.headerShown : ""}`}>
        <p className={styles.eyebrow}>Working at amber</p>
        <h2 className={styles.title}>What you get, beyond the job</h2>
      </div>

      <div className={styles.grid}>
        {PROMISES.map((promise, i) => (
          <div
            key={promise.title}
            className={`${styles.card} ${i < revealed ? styles.cardShown : ""}`}
            // Hovering a card replays only that card's icon.
            onMouseEnter={() => iconRefs.current[i]?.replay()}
          >
            <span className={styles.iconWrap}>
              <LottieIcon
                ref={(el) => {
                  iconRefs.current[i] = el;
                }}
                animationData={promise.icon}
                size={32}
                play={i < revealed}
              />
            </span>
            <div className={styles.text}>
              <h3 className={styles.cardTitle}>{promise.title}</h3>
              <p className={styles.cardBody}>{promise.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default wrapperHOC(Benefits, {
  componentName: "Benefits-CareerV3",
  showForChina: true,
});
