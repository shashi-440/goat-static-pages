import Image from "@Components/Image";
import Reveal from "../Reveal/Reveal";
import CountUp from "../CountUp/CountUp";
import CyclingStamp from "../CyclingStamp/CyclingStamp";
import styles from "./Mission.module.scss";
import founderSignature from "../../assets/founder-signature.png";
import wrapperHOC from "@Utils/wrapperHOC";

interface Stat {
  target: number;
  prefix?: string;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { target: 2, suffix: " Million+", label: "Beds available" },
  { target: 250, suffix: "+", label: "Cities Worldwide" },
  { target: 80, suffix: "+", label: "Countries Served" },
  { target: 800, suffix: "+", label: "Partner Universities" },
];

const Mission = () => (
  <section className={styles.section}>
    <div className={styles.container}>
      <Reveal as="p" className={styles.mission}>
        &ldquo; We&apos;re building a platform for student accommodation where every student can
        start their university journey confidently, knowing they have a home. By simplifying
        housing, we&apos;re helping millions take their first step toward a brighter future. &rdquo;
      </Reveal>

      <Reveal className={styles.founder} delay={120}>
        <div className={styles.avatar}>
          <CyclingStamp size={70} />
        </div>
        <div className={styles.signature}>
          <Image
            src={founderSignature}
            alt="Saurabh Goel"
            className={styles.signatureImage}
            width={180}
            height={41}
          />
        </div>
        <span className={styles.founderCaption}>Founder and CEO at amber</span>
      </Reveal>

      <hr className={styles.divider} />

      <ul className={styles.stats}>
        {STATS.map((stat, i) => (
          <Reveal as="li" key={stat.label} className={styles.stat} delay={200 + i * 90}>
            <CountUp
              className={styles.statValue}
              target={stat.target}
              prefix={stat.prefix}
              suffix={stat.suffix}
            />
            <span className={styles.statLabel}>{stat.label}</span>
          </Reveal>
        ))}
      </ul>
    </div>
  </section>
);

export default wrapperHOC(Mission, {
  componentName: "Mission-AboutUsV2",
  showForChina: true,
});
