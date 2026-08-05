import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Ambassadors.module.scss";
// The same four icons the dark section uses, recoloured for this light band —
// identical geometry and 1.5px stroke, just inked instead of white (white would
// be invisible on #f7f7f7). Using all four means no glyph repeats.
import iconGlobe from "../../assets/icon-globe-ink.svg";
import iconRocket from "../../assets/icon-rocket-ink.svg";
import iconCap from "../../assets/icon-cap-ink.svg";
import iconBulb from "../../assets/icon-bulb-ink.svg";
import wrapperHOC from "@Utils/wrapperHOC";

// Icon order mirrors the dark section's, so the two sets read as one family.
// `glyph` is each icon's drawn size inside the shared 32px slot — the exports
// have differing natural sizes, so a single 32px would scale each by a different
// amount and they would not read as one set. Same values as the dark section.
const PERKS = [
  {
    icon: iconGlobe,
    glyph: 24,
    title: "A clear dream",
    description: "We should be able to picture what you are chasing, in your own words.",
  },
  {
    icon: iconRocket,
    glyph: 24,
    title: "A real reason",
    description: "Why it matters to you, and what changes for you if it happens.",
  },
  {
    icon: iconCap,
    glyph: 29,
    title: "Proof you have started",
    description: "Anything that shows you are already moving — early work, small wins, first tries.",
  },
  {
    icon: iconBulb,
    glyph: 27,
    title: "How you tell it",
    description: "Whether your story lands, and makes us believe in it as much as you do.",
  },
];

/** What the panel scores an application on — Figma nodes 2118:3824 and 2118:3888. */
const Ambassadors = () => (
  <section className={styles.section}>
    {/* Edge-to-edge divider from the steps section above. */}
    <span className={styles.topRule} aria-hidden="true" />

    <div className={styles.inner}>
      <Reveal as="h2" className={styles.heading}>
        How dreams are judged.
        <br />
        <span className={styles.headingMuted}>What our panel looks for.</span>
      </Reveal>

      <Reveal className={styles.grid} delay={100}>
        {PERKS.map((perk) => (
          <div key={perk.title} className={styles.perk}>
            {/* Shared 32px slot; each glyph draws at its own size inside it. */}
            <span className={styles.iconSlot} aria-hidden="true">
              <Image
                src={perk.icon}
                alt=""
                className={styles.icon}
                width={perk.glyph}
                height={perk.glyph}
              />
            </span>
            <div className={styles.perkText}>
              <span className={styles.perkTitle}>{perk.title}</span>
              <span className={styles.perkDesc}>{perk.description}</span>
            </div>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

export default wrapperHOC(Ambassadors, {
  componentName: "Ambassadors-ScholarshipV2",
  showForChina: true,
});
