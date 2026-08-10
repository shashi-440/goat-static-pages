import Image from "@Components/Image";
import styles from "./LogoStrip.module.scss";
import university1 from "../../assets/logos/university-1.png";
import university2 from "../../assets/logos/university-2.png";
import university3 from "../../assets/logos/university-3.png";
import university4 from "../../assets/logos/university-4.png";
import partner1 from "../../assets/logos/partner-1.jpg";
import partner2 from "../../assets/logos/partner-2.jpg";
import partner3 from "../../assets/logos/partner-3.jpg";
import partner4 from "../../assets/logos/partner-4.jpg";
import partner5 from "../../assets/logos/partner-5.jpg";
import partner6 from "../../assets/logos/partner-6.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Logo strip — Figma nodes 2141:4368 (in the hero) and 2141:4066 (its own band).
 *
 * The page draws the same strip twice with different marks, so this is the one
 * component here that takes props; everything else on the page keeps its content
 * in a module-scope const the way the rest of the sandbox does. The two callers
 * below are the props-free components the page and the hero actually render.
 *
 * Each mark carries its own box from the node rather than one blanket height —
 * a round crest and a wide wordmark do not read as the same size at the same
 * height. `object-fit: contain` then letterboxes the art inside its own box.
 */
type Logo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const LogoStrip = ({ eyebrow, logos }: { eyebrow: string; logos: Logo[] }) => (
  <div className={styles.strip}>
    <p className={styles.eyebrow}>{eyebrow}</p>
    <div className={styles.logos}>
      {logos.map((logo, i) => (
        <div
          className={styles.cell}
          // The design repeats several marks, so the alt text is not unique.
          // eslint-disable-next-line react/no-array-index-key
          key={`${logo.alt}-${i}`}
          style={{ width: logo.width, height: logo.height }}
        >
          {/* isNotLazy: the shared Image otherwise fades and scales each mark in
              from opacity 0 / scale(0.9). A logo wall should read as one steady
              row, not seven things popping in. */}
          <Image
            src={logo.src}
            alt={logo.alt}
            className={styles.logo}
            width={logo.width}
            height={logo.height}
            isNotLazy
          />
        </div>
      ))}
    </div>
  </div>
);

const StyledLogoStrip = wrapperHOC(LogoStrip, {
  componentName: "LogoStrip-PartnerWithUs",
  showForChina: true,
});

/**
 * The seven tiles under the hero photo — four marks, three of them repeated, at
 * the sizes the node gives each position.
 */
const UNIVERSITY_LOGOS: Logo[] = [
  { src: university2, alt: "Liffey College", width: 56, height: 56 },
  { src: university4, alt: "James Cook University Australia", width: 80, height: 80 },
  { src: university3, alt: "Torrens University Australia", width: 80, height: 80 },
  { src: university1, alt: "Global Study Partners", width: 72, height: 72 },
  { src: university3, alt: "Torrens University Australia", width: 80, height: 80 },
  { src: university4, alt: "James Cook University Australia", width: 80, height: 80 },
  { src: university1, alt: "Global Study Partners", width: 72, height: 72 },
];

const PARTNER_LOGOS: Logo[] = [
  { src: partner1, alt: "Educred", width: 162, height: 58 },
  { src: partner2, alt: "ErasmusPlay", width: 162, height: 58 },
  { src: partner3, alt: "Study Smart", width: 162, height: 58 },
  { src: partner4, alt: "LeapScholar", width: 151, height: 54 },
  { src: partner5, alt: "iSchoolConnect", width: 162, height: 58 },
  { src: partner6, alt: "MiM-Essay", width: 140, height: 50 },
];

/** Rendered inside the hero, below the photo — Figma node 2141:4368. */
export const UniversityPartners = () => (
  <StyledLogoStrip eyebrow="University Partners" logos={UNIVERSITY_LOGOS} />
);

/** Its own band between the benefits and the testimonials — Figma node 2141:4066. */
export const Partners = () => (
  <section className={styles.section}>
    <StyledLogoStrip eyebrow="Our Partners" logos={PARTNER_LOGOS} />
  </section>
);

export default StyledLogoStrip;
