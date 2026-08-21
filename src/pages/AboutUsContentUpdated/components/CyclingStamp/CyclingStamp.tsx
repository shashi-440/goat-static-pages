import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import styles from "./CyclingStamp.module.scss";
import HERO_STAMPS from "../../assets/heroStamps";
import wrapperHOC from "@Utils/wrapperHOC";

const STAMPS = HERO_STAMPS;

// While hovered, advance through the stamps on a timer (loops forever).
const CYCLE_MS = 900;

interface CyclingStampProps {
  /** rendered stamp height in px; width is derived from the stamps' average ratio */
  size?: number;
}

// Mean aspect ratio across the 22 stamp SVGs (~1.05). Making the box slightly
// wider than tall means both the widest (1.34) and tallest (0.74) artwork land
// closer to filling it, instead of one axis always being letterboxed.
const BOX_RATIO = 1.05;

/**
 * The original travel-stamp interaction: shows one stamp at rest (Rome), and
 * while hovered it rotate-flips through the rest of the stamps, one after
 * another, returning to rest when the pointer leaves.
 */
const CyclingStamp = ({ size = 72 }: CyclingStampProps) => {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hovered) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % STAMPS.length);
    }, CYCLE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hovered]);

  return (
    <span
      className={`${styles.stamp} ${hovered ? styles.isHovered : ""}`}
      style={{ width: Math.round(size * BOX_RATIO), height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* keyed so each stamp replays the rotate-flip animation on change */}
      <span key={index} className={styles.inner}>
        <Image
          src={STAMPS[index]}
          alt=""
          className={styles.img}
          width={Math.round(size * BOX_RATIO)}
          height={size}
          isEagerLoad
        />
      </span>
    </span>
  );
};

export default wrapperHOC(CyclingStamp, {
  componentName: "CyclingStamp-AboutUsContentUpdated",
  showForChina: true,
});
