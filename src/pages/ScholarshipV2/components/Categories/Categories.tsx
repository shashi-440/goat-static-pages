import { Fragment } from "react";
import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Categories.module.scss";
import featureImg from "../../assets/feature.jpg";
import iconGlobe from "../../assets/icon-globe.svg";
import iconRocket from "../../assets/icon-rocket.svg";
import iconCap from "../../assets/icon-cap.svg";
import iconBulb from "../../assets/icon-bulb.svg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * `glyph` is the icon's drawn size inside the shared 32px slot.
 *
 * The exported SVGs are bare vectors at differing natural sizes (25.9, 25.5, 32
 * and 28.2), so rendering them all at 32px scales each by a different amount and
 * they end up visually mismatched.
 *
 * Sizes started from Figma's per-frame insets, then were corrected against each
 * icon's measured ink: globe, rocket and bulb fill their viewBox, but the cap's
 * artwork carries its own padding (ink is 232x180 of a 256 box, sitting below
 * centre), so at 32px it rendered wider than the rest. 29px balances it.
 */
const CATEGORIES = [
  {
    icon: iconGlobe,
    glyph: 24,
    title: "Academic Wizards",
    description: "For sharp minds who love solving problems.",
  },
  {
    icon: iconRocket,
    glyph: 24,
    title: "All-Star Sports",
    description: "For those driven by sports, discipline and performance",
  },
  {
    icon: iconCap,
    glyph: 29,
    title: "Creative Geniuses",
    description: "For those who think differently and bring ideas to life.",
  },
  {
    icon: iconBulb,
    glyph: 27,
    title: "Founders & Innovators",
    description: "For those who want to create, build, and shape the future",
  },
];

/**
 * Dark categories section — Figma node 2097:3652.
 *
 * Marked data-nav-theme="dark" so the shared Navbar swaps to its light logo
 * while this section is behind it (the same hook About Us uses).
 */
const Categories = () => (
  <section className={styles.section} data-nav-theme="dark">
    <div className={styles.inner}>
      {/* Three grid cells: heading top-left, then video and list side by side on
          the row below — which is what lines the list up with the video. */}
      <Reveal className={styles.top}>
        <h2 className={styles.heading}>
          Supporting ambitious
          <br />
          <span className={styles.headingMuted}>students from around the world.</span>
        </h2>

        <div className={styles.feature}>
          <Image
            src={featureImg}
            alt="An amberscholar recipient talking about their scholarship"
            className={styles.featureImage}
            width="100%"
            height="100%"
          />

          <div className={styles.caption}>
            <div className={styles.captionText}>
              <span className={styles.captionTitle}>
                Amberscholar Scholarship Programme 2026-27 is HERE
              </span>
              <span className={styles.captionMeta}>
                <span>amber | Student Accomodation</span>
                <span className={styles.captionDot}>·</span>
                <span>3 min</span>
              </span>
            </div>

            {/* Figma leaves the 16px icon slot inside this circle empty. */}
            <span className={styles.captionAction} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.list}>
          <span className={styles.listLabel}>Who all can apply</span>

          {CATEGORIES.map((category, i) => (
            <Fragment key={category.title}>
              {i > 0 ? <span className={styles.hRule} aria-hidden="true" /> : null}
              <div className={styles.row}>
                {/* Shared 32px slot; the glyph is centred in it at its own size. */}
                <span className={styles.iconSlot} aria-hidden="true">
                  <Image
                    src={category.icon}
                    alt=""
                    className={styles.icon}
                    width={category.glyph}
                    height={category.glyph}
                  />
                </span>
                <div className={styles.rowText}>
                  <span className={styles.rowTitle}>{category.title}</span>
                  <span className={styles.rowDesc}>{category.description}</span>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

export default wrapperHOC(Categories, {
  componentName: "Categories-ScholarshipV2",
  showForChina: true,
});
