import CustomLink from "@Components/CustomLink";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
// The navbar's gradient pill IS this page's CTA — same class, not a copy of its
// rules, so the two can't drift apart. It also carries the `color: #fff
// !important` guard the site's global `a:hover` rule needs.
import navStyles from "../../../AboutUsV2/components/Navbar/Navbar.module.scss";
import styles from "./Hero.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Scholarship hero — Figma node 2096:5361.
 *
 * Structure and metrics follow the other v2 heroes (About Us / Contact Us / How
 * It Works) rather than the design's own values, so all four pages share one
 * hero rhythm: 56px top padding, a centred 880px header block, 52px/56px title
 * and an 18px/1.5 subtitle 20px below it.
 */
const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.header}>
      <Reveal as="h1" className={styles.title}>
        Because every big dream
        <br />
        deserves <strong className={styles.amount}>$50,000</strong>
      </Reveal>
      <Reveal as="p" className={styles.subtitle} delay={120}>
        For dreamers with the hunger to chase something big.
      </Reveal>
    </div>

    <Reveal className={styles.ctaRow} delay={200}>
      <CustomLink href="/" className={navStyles.tryButton} dataTestId="scholarship-v2-apply">
        Apply Now
      </CustomLink>
    </Reveal>

    {/* Deadline notice, sitting quietly under the button. */}
    <Reveal as="p" className={styles.note} delay={260}>
      <span className={styles.noteLabel}>Applications open</span>
      <span className={styles.noteDot} aria-hidden="true" />
      Deadline Aug 31, 2026
    </Reveal>
  </section>
);

export default wrapperHOC(Hero, {
  componentName: "Hero-ScholarshipV2",
  showForChina: true,
});
