import Image from "@Components/Image";
import Reveal from "@Pages/AboutUsV2/components/Reveal/Reveal";
import styles from "./LegalSeal.module.scss";
import sealImg from "./assets/legal-seal.png";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Closing flourish for the legal document pages — Figma node 2079:1870.
 *
 * A hairline rule broken in the middle by amber's "this document is active & up
 * to date" wax seal, tilted the same -12.17° the design sets. Decorative, so the
 * image is unlabelled and the rules are hidden from assistive tech.
 */
const LegalSeal = () => (
  <section className={styles.section}>
    <Reveal className={styles.inner}>
      <span className={styles.rule} aria-hidden="true" />

      <span className={styles.sealBox}>
        <span className={styles.tilt}>
          <Image src={sealImg} alt="" className={styles.sealImg} width={122} height={128} />
        </span>
      </span>

      <span className={styles.rule} aria-hidden="true" />
    </Reveal>
  </section>
);

export default wrapperHOC(LegalSeal, {
  componentName: "LegalSeal",
  showForChina: true,
});
