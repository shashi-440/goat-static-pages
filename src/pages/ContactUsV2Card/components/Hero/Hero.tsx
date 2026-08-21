import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
// Moved in from the original Contact page when the other two cuts were removed —
// this page was the only thing still using it.
import AvatarCluster from "../AvatarCluster/AvatarCluster";
import CopilotDock from "../CopilotDock/CopilotDock";
import heroImg from "../../assets/hero.jpg";
import styles from "./Hero.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * The subtitle.
 *
 * Two lines have been retired here, and both failed the same way — saying something true that the
 * page was already saying:
 *
 *   · "Helping students find a place to call home before they even arrive" — the line About Us and
 *     How It Works both open with. A mission statement standing where a contact page should say
 *     what happens next.
 *   · "Pick whichever way is easiest — someone on the team answers all of them." That instructed
 *     the reader to choose, which the list of five channels below already does more clearly than a
 *     sentence can, and then filled the rest of its length restating it.
 *   · "However you'd rather reach us, a real person answers." Same trap, one level up: it made a
 *     promise about who replies, which is not this line's job and is not something the page can
 *     back.
 *
 * So this one says what the page is FOR — the span of things worth writing in about — which is the
 * one thing neither the headline nor the channel list covers. Deliberately not the help centre
 * row's vocabulary ("booking, payments, documents and moving in"), so the two do not read as the
 * same sentence twice.
 */
const SUBTITLE = "Before you book, after you've moved in, or anywhere in between.";

/**
 * Contact hero, photo cut.
 *
 * The original Contact page's headline — avatar cluster inline and all — over a
 * contained photo. Nothing sits on the picture: the channels are their own section
 * below, so neither has to make room for the other.
 */
const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.header}>
      <Reveal as="h1" className={styles.title}>
        Get in touch with
        <br />
        the
        <AvatarCluster />
        team amber
      </Reveal>
      <Reveal as="p" className={styles.subtitle} delay={120}>
        {SUBTITLE}
      </Reveal>
    </div>

    {/* The Copilot input is docked INSIDE the media box, not placed after it — it is positioned
        against the photo's own bottom edge, so it has to share that box's coordinate space. See
        `.media` for the `position: relative` that makes that work. */}
    <Reveal className={styles.media} delay={200}>
      <img className={styles.image} src={heroImg} alt="" />
      <CopilotDock />
    </Reveal>
  </section>
);

export default wrapperHOC(Hero, {
  componentName: "Hero-ContactUsV2Card",
  showForChina: true,
});
