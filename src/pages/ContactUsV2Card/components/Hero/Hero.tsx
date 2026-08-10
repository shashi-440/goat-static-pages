import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
// Moved in from the original Contact page when the other two cuts were removed —
// this page was the only thing still using it.
import AvatarCluster from "../AvatarCluster/AvatarCluster";
import heroImg from "../../assets/hero.jpg";
import styles from "./Hero.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

const SUBTITLE = "Helping students find a place to call home before they even arrive";

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

    <Reveal className={styles.media} delay={200}>
      <img className={styles.image} src={heroImg} alt="" />
    </Reveal>
  </section>
);

export default wrapperHOC(Hero, {
  componentName: "Hero-ContactUsV2Card",
  showForChina: true,
});
