import { useCallback, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import RolesButton from "../RolesButton/RolesButton";
import CarouselControls from "../CarouselControls/CarouselControls";
import styles from "./Benefits.module.scss";
import benefitImg from "../../assets/benefit-health.png";

interface Benefit {
  title: string;
  lead: string;
  body: string;
}

// Figma only art-directs the first slide; the remaining four reuse its layout
// with their own copy. Titles come from Figma 2665:13577.
const BENEFITS: Benefit[] = [
  {
    title: "Health & Wellbeing",
    lead: "Your wellbeing comes first.",
    body: "Comprehensive health coverage and mental wellness support, so you can bring your best self to work every day.",
  },
  {
    title: "Work With Flexibility",
    lead: "Work where you do your best work.",
    body: "Flexible hours and hybrid arrangements built on trust, so your day fits around your life rather than the reverse.",
  },
  {
    title: "Build with AI",
    lead: "AI tooling from day one.",
    body: "Every team gets the licences, budget and time to build with modern AI tools — and the freedom to ship what they learn.",
  },
  {
    title: "Learning & Growth",
    lead: "Grow faster than you expected.",
    body: "A dedicated learning budget, internal mobility, and mentorship from people who have built at scale.",
  },
  {
    title: "Grow Globally",
    lead: "A career without borders.",
    body: "With teams across 14 countries, there is room to relocate, lead new markets, and work with colleagues worldwide.",
  },
];

/**
 * Dark "Benefits of working at Amber" band (Figma 2665:13571).
 *
 * The five titles on the left double as the carousel nav — the active one is
 * white, the rest neutral/500. Clicking a title, a dot, or an arrow moves the
 * slide, which swaps the copy on the right.
 */
const Benefits = () => {
  const [active, setActive] = useState(0);

  const go = useCallback((next: number) => {
    // Wrap at both ends so the arrows never dead-end.
    setActive((prev) => {
      const total = BENEFITS.length;
      return typeof next === "number" ? (next + total) % total : prev;
    });
  }, []);

  const current = BENEFITS[active];

  return (
    <section className={styles.section}>
      <Reveal className={styles.header}>
        <h2 className={styles.title}>Benefits of working at Amber</h2>
        <p className={styles.subtitle}>
          No ping pong tables or bean bag chairs, just benefits you actually want
        </p>
      </Reveal>

      <div className={styles.body}>
        <div className={styles.grid}>
          <ul className={styles.titles}>
            {BENEFITS.map((benefit, i) => (
              <li key={benefit.title}>
                <button
                  type="button"
                  className={`${styles.titleButton} ${i === active ? styles.titleActive : ""}`}
                  onClick={() => go(i)}
                  aria-current={i === active}
                >
                  {benefit.title}
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.mediaColumn}>
            <div className={styles.media}>
              <Image
                src={benefitImg}
                alt={current.title}
                className={styles.image}
                width="100%"
                height="100%"
              />
            </div>
          </div>

          <div className={styles.copy}>
            <p className={styles.copyText}>
              <span className={styles.copyLead}>{current.lead} </span>
              {current.body}
            </p>
            <RolesButton />
          </div>
        </div>

        <CarouselControls
          count={BENEFITS.length}
          active={active}
          onSelect={go}
          onPrev={() => go(active - 1)}
          onNext={() => go(active + 1)}
          theme="dark"
          label="benefit"
        />
      </div>
    </section>
  );
};

export default wrapperHOC(Benefits, {
  componentName: "Benefits-CareerV2",
  showForChina: true,
});
