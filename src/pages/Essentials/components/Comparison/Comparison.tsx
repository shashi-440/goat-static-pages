import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import { COMPARISON } from "../../content";
import { BoxIcon, SetupIcon, StoredIcon } from "./icons";
import unboxing from "../../assets/unboxing.jpg";
import styles from "./Comparison.module.scss";

const CrossIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M6 6l8 8M14 6l-8 8"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
    />
  </svg>
);

// Paired with COMPARISON.with by index — each benefit keeps its own illustration.
const WITH_ICONS = [StoredIcon, BoxIcon, SetupIcon];

/**
 * Without / with comparison.
 *
 * The mockup offered two arrangements: photo in a left column beside both
 * comparison columns, or the photo as a full-width band above them ("variation
 * A"). Variation A is used here — the three-column version pinned the photo to a
 * 392px track and only balanced at 1360px wide, whereas the band reflows cleanly
 * and gives the photo more presence, which matches how the other v2 pages treat
 * their section media.
 */
const Comparison = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      <Reveal>
        <h2 className={styles.title}>{COMPARISON.title}</h2>
        <p className={styles.subtitle}>{COMPARISON.subtitle}</p>
      </Reveal>

      <Reveal delay={80} className={styles.band}>
        <Image
          src={unboxing}
          alt="A student unpacking an amber Essentials box in an empty room"
          className={styles.bandImage}
          width="100%"
          height="100%"
          isEagerLoad
        />
        <p className={styles.caption}>{COMPARISON.caption}</p>
      </Reveal>

      <div className={styles.columns}>
        <Reveal delay={140} className={`${styles.column} ${styles.columnWithout}`}>
          <h3 className={styles.columnHead}>Without amber</h3>
          <ul className={styles.rows}>
            {COMPARISON.without.map((line) => (
              <li key={line} className={styles.row}>
                <span className={styles.cross}>
                  <CrossIcon />
                </span>
                <p className={styles.rowTextWithout}>{line}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={200} className={`${styles.column} ${styles.columnWith}`}>
          <h3 className={styles.columnHead}>With amber Essentials</h3>
          <ul className={styles.rows}>
            {COMPARISON.with.map((line, i) => {
              const Icon = WITH_ICONS[i];
              return (
                <li key={line} className={styles.row}>
                  <span className={styles.icon}>
                    <Icon />
                  </span>
                  <p className={styles.rowTextWith}>{line}</p>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </div>
  </section>
);

export default wrapperHOC(Comparison, {
  componentName: "Essentials-Comparison",
  showForChina: true,
});
