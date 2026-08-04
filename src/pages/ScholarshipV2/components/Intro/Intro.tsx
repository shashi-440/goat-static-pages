import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
// Same counter About Us uses — counts up once on first scroll into view, renders
// the final value server-side so the number is never missing.
import CountUp from "../../../AboutUsV2/components/CountUp/CountUp";
import styles from "./Intro.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

const STATS = [
  { target: 33, suffix: "K+", label: "Applicants" },
  { target: 220, suffix: "+", label: "Nationalities" },
  { target: 45, prefix: "$", suffix: "k+", label: "Scholarships Granted" },
];

/** Stats row + programme intro copy — Figma node 2097:3651. */
const Intro = () => (
  <section className={styles.section}>
    <Reveal className={styles.inner}>
      <div className={styles.stats}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <CountUp
              target={stat.target}
              prefix={stat.prefix}
              suffix={stat.suffix}
              className={styles.value}
            />
            <span className={styles.label}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.copy}>
        <p className={styles.paragraph}>
          amberscholar 2026 is for students and dreamers who have the hunger in them! Because at
          amber, we don&apos;t just accommodate students, we accommodate their dreams too.
        </p>
        <p className={styles.paragraph}>
          That&apos;s why we&apos;ve created the <strong>$50,000</strong> amber Dream Fund!
        </p>
        <p className={styles.paragraph}>
          If you have a big goal, a bold idea, or a dream you truly believe in, this is your chance
          to win funding from the <strong>$50,000</strong> Dream Fund pool and take it further.
        </p>
      </div>
    </Reveal>
  </section>
);

export default wrapperHOC(Intro, {
  componentName: "Intro-ScholarshipV2",
  showForChina: true,
});
