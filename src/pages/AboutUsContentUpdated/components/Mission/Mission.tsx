import Image from "@Components/Image";
import Reveal from "../Reveal/Reveal";
import CountUp from "../CountUp/CountUp";
import CyclingStamp from "../CyclingStamp/CyclingStamp";
// Shared with the Career page rather than copied — the component is page-agnostic
// and takes its ramp colours from the consuming class (see `.mission`).
import ScrollText from "../../../CareerFinal/components/ScrollText/ScrollText";
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
      {/* Read-along: words darken from grey to near-black as the quote scrolls up
          through the viewport. Same treatment as the Career page's founder quote —
          ScrollText is page-agnostic, so it's reused rather than duplicated. */}
      <ScrollText
        className={styles.mission}
        text={
          "“ I nearly got scammed finding housing abroad in 2016. I got lucky. Most students " +
          "don’t. We built amber so that finding a home is the easiest part of leaving one and " +
          "not the most dangerous one. ”"
        }
      />

      <Reveal className={styles.founder} delay={120}>
        <div className={styles.avatar}>
          <CyclingStamp size={96} />
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

      {/* The lead-in sentence repeating the four figures is dropped — the stats
          row directly above already states them, so the paragraph opens on the
          point it is actually making. */}
      <Reveal as="p" className={styles.outro} delay={560}>
        But beyond the numbers, what matters most is peace of mind. The feeling of a student who is
        miles from home, but yet somehow has never left it.
      </Reveal>
    </div>
  </section>
);

export default wrapperHOC(Mission, {
  componentName: "Mission-AboutUsContentUpdated",
  showForChina: true,
});
