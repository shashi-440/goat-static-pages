import Image from "@Components/Image";
import Reveal from "@Pages/AboutUsV2/components/Reveal/Reveal";
import styles from "./LegalHero.module.scss";
import lockImg from "./assets/legal-lock.png";
import wrapperHOC from "@Utils/wrapperHOC";

interface LegalHeroProps {
  title: string;
  subtitle: string;
}

/**
 * Hero for the legal document pages — Figma node 2068:2080, plus the padlock
 * still (2079:1876).
 *
 * Unlike the other v2 heroes this one is left-aligned and sits on the document's
 * own 700px measure rather than the 1280px marketing grid — it's the head of a
 * legal document, so it shares the reading column with the body below it. The
 * vertical rhythm (56px top padding, 52/56 title, 18px/1.5 subtitle 20px under
 * it) is the same as About Us / Contact Us / How It Works / amberscholar.
 */
const LegalHero = ({ title, subtitle }: LegalHeroProps) => (
  <section className={styles.hero}>
    <div className={styles.inner}>
      {/* Decorative — the h1 carries the meaning. */}
      <Reveal className={styles.lock}>
        <Image
          src={lockImg}
          alt=""
          className={styles.lockImg}
          width={112}
          height={140}
          isEagerLoad
        />
      </Reveal>

      <Reveal as="h1" className={styles.title} delay={80}>
        {title}
      </Reveal>
      <Reveal as="p" className={styles.subtitle} delay={140}>
        {subtitle}
      </Reveal>
    </div>
  </section>
);

export default wrapperHOC(LegalHero, {
  componentName: "LegalHero",
  showForChina: true,
});
