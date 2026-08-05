import wrapperHOC from "@Utils/wrapperHOC";
import CountUp from "../../../AboutUsV2/components/CountUp/CountUp";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import ScrollText from "../../../CareerV2/components/ScrollText/ScrollText";
import styles from "./Origin.module.scss";

/**
 * Section 2 — why amber exists.
 *
 * The story is split into three blocks so the turn in the middle ("That wasn't
 * bad luck") lands on its own rather than being buried mid-paragraph. Each
 * block gets the scroll-linked read-along, so the copy lights up as the reader
 * moves through it.
 *
 * The scale line is pulled out of the prose and set as two counters, because
 * "80+ countries and 2 million students" is the proof of the story and reads as
 * a claim, not a sentence.
 */
const Origin = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      <Reveal as="p" className={styles.eyebrow}>
        Why amber exists
      </Reveal>

      <div className={styles.story}>
        <ScrollText
          className={styles.paragraph}
          text={
            "The message came in at 2am — a student, four days from flying out, telling us the " +
            "apartment she’d paid for didn’t exist. No landlord, no address, just a screenshot " +
            "and a deposit gone."
          }
        />

        {/* The turn. Set larger and tighter so it reads as the thesis. */}
        <ScrollText
          className={`${styles.paragraph} ${styles.turn}`}
          text={
            "I remember thinking: she did everything right, and the system still failed her. " +
            "That wasn’t bad luck. That was the whole industry running on trust with no way to " +
            "verify it."
          }
        />

        <ScrollText
          className={styles.paragraph}
          text={
            "So we built one. Not a mission statement — just a way to make sure that message " +
            "never has to be sent again."
          }
        />
      </div>

      {/* Scale as proof, not prose. */}
      <Reveal className={styles.scale} delay={80}>
        <div className={styles.scaleFigures}>
          <span className={styles.figure}>
            <span className={styles.figureValue}>
              <CountUp target={80} suffix="+" />
            </span>
            <span className={styles.figureLabel}>countries</span>
          </span>
          <span className={styles.figureDivider} aria-hidden="true" />
          <span className={styles.figure}>
            <span className={styles.figureValue}>
              <CountUp target={2} suffix=" million" />
            </span>
            <span className={styles.figureLabel}>students</span>
          </span>
        </div>
        <p className={styles.scaleCaption}>
          &hellip;later, that&rsquo;s still the only job: get someone to the door of a place
          that&rsquo;s actually theirs.
        </p>
      </Reveal>
    </div>
  </section>
);

export default wrapperHOC(Origin, {
  componentName: "Origin-CareerV3",
  showForChina: true,
});
