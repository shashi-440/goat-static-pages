import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import ScrollText from "../ScrollText/ScrollText";
import styles from "./Mission.module.scss";
// The portrait WITHOUT sunglasses, plus the shades as a separate layer, so the
// shades can animate over a face that stays still.
import founderPlain from "../../assets/founder-plain.png";
import founderShades from "../../assets/founder-shades.png";
import signatureImg from "../../assets/signature-mask.png";

/**
 * Founder quote (Figma 2665:13560).
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
            "“The message came in at 2am — a student, four days from flying out, telling us the " +
            "apartment she’d paid for didn’t exist. No landlord, no address, just a screenshot and " +
            "a deposit gone. I remember thinking: she did everything right, and the system still " +
            "failed her. That wasn’t bad luck. That was the whole industry running on trust with " +
            "no way to verify it. So we built one. Not a mission statement — just a way to make " +
            "sure that message never has to be sent again.”"
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

    </div>
  </section>
);

export default wrapperHOC(Mission, {
  componentName: "Mission-CareerV2",
  showForChina: true,
});
