import Image from "@Components/Image";
import CustomLink from "@Components/CustomLink";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Cta.module.scss";
import ctaImg from "../../assets/cta.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Closing CTA card — Figma node 2134:9078.
 *
 * Three stacked layers over the photo, all from the node: a flat tint, a
 * left-to-right scrim that holds the copy side dark, and a bottom-up scrim over
 * the lower 190px. The copy block is bottom-left aligned inside 56px padding.
 */
const Cta = () => (
  <section className={styles.section}>
    <Reveal className={styles.card}>
      <Image
        src={ctaImg}
        alt=""
        className={styles.image}
        width="100%"
        height="100%"
      />

      <span className={styles.tint} aria-hidden="true" />
      <span className={styles.scrim} aria-hidden="true" />
      <span className={styles.scrimBottom} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.block}>
          <div className={styles.text}>
            <h2 className={styles.heading}>
              Fill the form in minutes.
              <br />
              amber takes it from there.
            </h2>
            <p className={styles.sub}>
              Free to apply. Dreamers backed across 220+ nationalities.
            </p>
          </div>

          <CustomLink href="/" className={styles.button} dataTestId="scholarship-v2-cta-apply">
            Apply Now
          </CustomLink>
        </div>
      </div>
    </Reveal>
  </section>
);

export default wrapperHOC(Cta, {
  componentName: "Cta-ScholarshipV2",
  showForChina: true,
});
