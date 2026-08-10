import { Fragment, useState } from "react";
import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
// The same lightbox the winners' stories use up the page, so there is one video
// popup on this page rather than two that behave slightly differently.
import StoryModal from "../StoryModal/StoryModal";
import styles from "./Categories.module.scss";
import featureImg from "../../assets/feature.jpg";
import iconGlobe from "../../assets/icon-globe.svg";
import iconRocket from "../../assets/icon-rocket.svg";
import iconCap from "../../assets/icon-cap.svg";
import iconBulb from "../../assets/icon-bulb.svg";
// The same triangle CreatorMarquee plays with, so the two video affordances on this
// page are one shape rather than two near-identical ones.
import playIcon from "../../assets/play.svg";
import wrapperHOC from "@Utils/wrapperHOC";

// The programme film behind the feature card's play button.
// https://www.youtube.com/watch?v=UK-cAqUHllc&t=2s — the `t=2s` is carried through
// as the embed's start offset.
const FEATURE_VIDEO_ID = "UK-cAqUHllc";
const FEATURE_VIDEO_START = 2;
const FEATURE_TITLE = "amberscholar Scholarship Programme 2026-27 is HERE";

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
 * Categories section — Figma node 2097:3652.
 *
 * No data-nav-theme="dark": this band was black and marked itself so the shared
 * Navbar swapped to its light logo behind it. It is light grey now, so the header
 * has to keep its dark logo and links — marking it would put a white logo on a
 * near-white ground.
 */
const Categories = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <section className={styles.section}>
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
              alt="A student studying on their bed in sunlit accommodation"
              className={styles.featureImage}
              width="100%"
              height="100%"
            />

            <div className={styles.caption}>
              <div className={styles.captionText}>
                <span className={styles.captionTitle}>
                  amberscholar Scholarship Programme 2026-27 is HERE
                </span>
                <span className={styles.captionMeta}>
                  <span>amber | Student Accomodation</span>
                  <span className={styles.captionDot}>·</span>
                  <span>3 min</span>
                </span>
              </div>

              {/* Figma leaves this circle's icon slot empty; it carries a play
                  triangle so the card reads as a video rather than a plain dot.
                  A real button rather than the decorative span it was, since it now
                  opens the film — so it is focusable and answers the keyboard. */}
              <button
                type="button"
                className={styles.captionAction}
                onClick={() => setPlaying(true)}
                aria-label={`Play: ${FEATURE_TITLE}`}
                data-testid="scholarship-v2-feature-play"
              >
                {/* The rotation lives on this slot, not on the Image — Image's own
                    `.animateOpacity.show { transform: none }` cancels a transform set
                    on the img itself. Same reason CreatorMarquee wraps its copy. */}
                <span className={styles.captionPlaySlot} aria-hidden="true">
                  <Image
                    src={playIcon}
                    alt=""
                    className={styles.captionPlay}
                    width={13}
                    height={12}
                    isEagerLoad
                  />
                </span>
              </button>
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

      <StoryModal
        open={playing}
        title={FEATURE_TITLE}
        videoId={FEATURE_VIDEO_ID}
        start={FEATURE_VIDEO_START}
        onClose={() => setPlaying(false)}
      />
    </section>
  );
};

export default wrapperHOC(Categories, {
  componentName: "Categories-ScholarshipV2",
  showForChina: true,
});
