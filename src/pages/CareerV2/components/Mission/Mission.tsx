import wrapperHOC from "@Utils/wrapperHOC";
import CountUp from "../../../AboutUsV2/components/CountUp/CountUp";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import ScrollText from "../ScrollText/ScrollText";
import styles from "./Mission.module.scss";
// The portrait WITHOUT sunglasses, plus the shades as a separate layer, so the
// shades can animate over a face that stays still.
import founderPlain from "../../assets/founder-plain.png";
import founderShades from "../../assets/founder-shades.png";
import signatureImg from "../../assets/signature-mask.png";

const STATS = [
  { target: 2, suffix: " Million+", label: "Beds available" },
  { target: 250, suffix: "+", label: "Cities Worldwide" },
  { target: 80, suffix: "+", label: "Countries Served" },
  { target: 800, suffix: "+", label: "Partner Universities" },
];

/**
 * Founder quote and the four headline stats (Figma 2665:13560).
 *
 * The signature is a Figma mask-group: a #d9004c fill showing through the
 * signature artwork. Reproduced with a CSS mask so the ink stays the brand
 * pink rather than baking the colour into the PNG.
 */
const Mission = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      {/* Read-along: words darken as the block scrolls up through the viewport. */}
      <blockquote className={styles.quoteWrap}>
        <ScrollText
          className={styles.quote}
          text={
            "“We learn best through osmosis. The more time we spend in each other’s presence, " +
            "the more we grow. And the closer we are to our customers, the better work we can do. " +
            "That’s why being in person is so important to who we are, and who we want to become.”"
          }
        />
      </blockquote>

      <Reveal className={styles.attribution} delay={120}>
        {/* Two stacked layers: the portrait never moves, only the shades drop in
            on hover. That is why the face art has to be the shades-less version
            — founder.png has them baked on and cannot animate. */}
        <span
          className={styles.avatar}
          style={{
            backgroundImage: `url(${founderPlain})`,
            ["--av-shades" as any]: `url(${founderShades})`,
          }}
          role="img"
          aria-label="Saurabh Goel, Founder and CEO at amber"
        >
          <span className={styles.shades} aria-hidden="true" />
        </span>
        <span
          className={styles.signature}
          style={{ maskImage: `url(${signatureImg})`, WebkitMaskImage: `url(${signatureImg})` }}
          aria-hidden="true"
        />
        <p className={styles.role}>Founder and CEO at amber</p>
      </Reveal>

      <hr className={styles.divider} />

      <div className={styles.stats}>
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} className={styles.stat} delay={i * 80}>
            <span className={styles.statValue}>
              <CountUp target={stat.target} suffix={stat.suffix} />
            </span>
            <span className={styles.statLabel}>{stat.label}</span>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default wrapperHOC(Mission, {
  componentName: "Mission-CareerV2",
  showForChina: true,
});
