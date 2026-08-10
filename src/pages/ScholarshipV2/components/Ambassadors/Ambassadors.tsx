import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Ambassadors.module.scss";
// Line icons, borrowed wholesale from the Categories section rather than given
// their own set — these are placeholders, and reusing that section's exact four
// glyphs keeps the two bands reading as one family.
//
// They are the same files Categories imports, now inked #202020 at the source (they
// used to be near-white for the black band Categories was). The duotone set these
// replaced is still in ../../assets (icon-*-duo.svg) if that direction is wanted
// back.
import iconGlobe from "../../assets/icon-globe.svg";
import iconRocket from "../../assets/icon-rocket.svg";
import iconCap from "../../assets/icon-cap.svg";
import iconBulb from "../../assets/icon-bulb.svg";
import wrapperHOC from "@Utils/wrapperHOC";

// Icon order mirrors the Categories section's, so the two bands read as one family.
// `glyph` is each icon's drawn size inside the shared 44px slot.
//
// A flat 32 across all four. Note the exports have differing natural sizes (25.9,
// 25.5, 32, 28.2) and differing ink-to-box ratios — the cap's artwork is only
// 232x180 of its 256 box — so a single value renders slightly less ink for the cap
// and bulb than for the globe and rocket. 32/32/39/36 would be the optically
// matched equivalent at this base if they ever look uneven.
const PERKS = [
  {
    icon: iconGlobe,
    glyph: 32,
    title: "A clear dream",
    description: "We should be able to picture what you are chasing, in your own words.",
  },
  {
    icon: iconRocket,
    glyph: 32,
    title: "A real reason",
    description: "Why it matters to you, and what changes for you if it happens.",
  },
  {
    icon: iconCap,
    glyph: 32,
    title: "Proof you have started",
    description: "Anything that shows you are already moving — early work, small wins, first tries.",
  },
  {
    icon: iconBulb,
    glyph: 32,
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
