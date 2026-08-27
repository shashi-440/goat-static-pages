import Image from "@Components/Image";
import CustomLink from "@Components/CustomLink";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Cta.module.scss";
import ctaImg from "../../assets/cta-city.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Closing CTA card — Figma node 2456:6713.
 *
 * Three stacked layers over the photo, all from the node: a flat tint, a
 * left-to-right scrim that holds the copy side dark, and a bottom-up scrim over
 * the lower 190px. The copy block is bottom-left aligned inside 56px padding.
 */
const Cta = () => (
  <section className={styles.section}>
    <div className={styles.card}>
      <Image src={ctaImg} alt="" className={styles.image} width="100%" height="100%" />

      <span className={styles.tint} aria-hidden="true" />
      <span className={styles.scrim} aria-hidden="true" />
      <span className={styles.scrimBottom} aria-hidden="true" />

      <div className={styles.content}>
        <Reveal className={styles.block}>
          <div className={styles.text}>
            {/* ONE LINE now, and the `<br />` that split the old two-line heading is gone with
                it — a manual break under a single short line would just add an empty row.

                It replaced "Fill the form in minutes. / amber takes it from there.", which had
                gone stale: the Steps section above no longer has a "fill the form" step at all
                (it reads Signup with us / We set you up / You get booked), so this was the last
                place on the page still describing a form. */}
            <h2 className={styles.heading}>Sign Up now with amber</h2>
            <p className={styles.sub}>A dedicated team. Student demand from 160+ countries.</p>
          </div>

          <CustomLink href="/" className={styles.button} dataTestId="list-with-us-cta">
            List on amber
          </CustomLink>
        </Reveal>
      </div>
    </div>
  </section>
);

export default wrapperHOC(Cta, {
  componentName: "Cta-ListWithUs",
  showForChina: true,
});
