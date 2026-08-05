import wrapperHOC from "@Utils/wrapperHOC";
import styles from "./CarouselControls.module.scss";

interface CarouselControlsProps {
  count: number;
  active: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  /** `dark` sits on the #151515 band, `light` on the white→black gradient. */
  theme?: "dark" | "light";
  /** Noun used in the aria-labels, e.g. "benefit" → "Go to benefit 2". */
  label: string;
}

/**
 * Dot pill + prev/next arrows shared by the Benefits and Team carousels
 * (Figma 2665:13589 and 2675:16199). The active dot widens into a pill.
 */
const CarouselControls = ({
  count,
  active,
  onSelect,
  onPrev,
  onNext,
  theme = "dark",
  label,
}: CarouselControlsProps) => (
  <div className={`${styles.controls} ${styles[theme]}`}>
    <div className={styles.dots}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
          onClick={() => onSelect(i)}
          aria-label={`Go to ${label} ${i + 1}`}
          aria-current={i === active}
        />
      ))}
    </div>

    <button
      type="button"
      className={styles.arrow}
      onClick={onPrev}
      aria-label={`Previous ${label}`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M10 3L5 8L10 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>

    <button type="button" className={styles.arrow} onClick={onNext} aria-label={`Next ${label}`}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M6 3L11 8L6 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  </div>
);

export default wrapperHOC(CarouselControls, {
  componentName: "CarouselControls-CareerV2",
  showForChina: true,
});
