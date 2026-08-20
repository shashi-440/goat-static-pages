import Image from "@Components/Image";
import Reveal from "@Pages/AboutUsV2/components/Reveal/Reveal";
import styles from "./LegalHero.module.scss";
/**
 * The document mark both these pages open on. Vector now, and neutral.
 *
 * What it replaced was a raster of a glossy chrome document — a 60KB PNG with metallic
 * gradients and a bevel, which is a 2010 file icon rather than anything on this site. This is
 * line art at 1.7KB, and being an SVG it is exact at any density instead of a 2x bitmap.
 *
 * Recoloured on the way in. The source came in brand colours that belong to nothing here —
 * #36f blue, #321c6c purple, a peach title bar — and is now three tones and no hue: the page's
 * own #111928 for the document and every stroke, #e5e7eb for the sheet behind it, #d1d5db for
 * the redacted title bar.
 *
 * The tonal order is the part worth not breaking: the sheet BEHIND has to be the lightest of
 * the three. An earlier pass had it at #9ca3af, darker than the white front page it sits under,
 * and the stack stopped reading as depth — a page further away that is darker just looks like a
 * different object.
 */
import docImg from "./assets/legal-doc.svg";
import wrapperHOC from "@Utils/wrapperHOC";

interface LegalHeroProps {
  title: string;
  subtitle: string;
}

/**
 * Hero for the legal document pages — Figma node 2068:2080.
 *
 * The mark above the title was a padlock still (2079:1876) and is now a document. Shared by
 * /privacy-v2 and /terms-v2, so this is the only place it is set.
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
      <Reveal className={styles.mark}>
        <Image
          src={docImg}
          alt=""
          className={styles.markImg}
          width={112}
          height={112}
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
