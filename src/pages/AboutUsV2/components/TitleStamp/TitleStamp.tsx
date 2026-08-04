import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import styles from "./TitleStamp.module.scss";
import stampFrame from "../../assets/stamp-frame.svg";
import city1 from "../../assets/city-1.jpg";
import city2 from "../../assets/city-2.jpg";
import city3 from "../../assets/city-3.jpg";
import city4 from "../../assets/city-4.jpg";
import city5 from "../../assets/city-5.jpg";
import city6 from "../../assets/city-6.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

const CITIES = [city1, city2, city3, city4, city5, city6];

// While hovered, the card flips to the next city, holds briefly, flips again.
// Keep this a little longer than the flip animation so each city rests a moment.
const CYCLE_MS = 900;

/**
 * A postage-stamp graphic (frame from the Figma SVG) inline in the hero
 * headline. At rest it shows one city photo. On hover it enlarges and the photo
 * page-flips through the cities (flip → new city → brief hold → flip again).
 * Clicking while hovering flips to the next city immediately.
 */
const TitleStamp = () => {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextCity = () => setIndex((prev) => (prev + 1) % CITIES.length);

  // While hovered, keep flipping to the next city on a timer.
  useEffect(() => {
    if (!hovered) return undefined;
    timerRef.current = setInterval(nextCity, CYCLE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hovered]);

  // Click while hovering → change the city instantly (and reset the timer so the
  // next auto-flip is a full interval away).
  const handleClick = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    nextCity();
    if (hovered) timerRef.current = setInterval(nextCity, CYCLE_MS);
  };

  return (
    <span
      className={`${styles.stamp} ${hovered ? styles.isHovered : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <span className={styles.inner}>
        {/* The whole stamp (frame + photo) page-flips as one unit. Keyed so it
            re-mounts and replays the flip each time the city changes. */}
        <span key={index} className={styles.card}>
          {/* Perforated white backing sits BEHIND the photo, so its scalloped
              edge shows around the photo (which fills the window). */}
          <Image
            src={stampFrame}
            alt=""
            className={styles.frame}
            width={120}
            height={118}
            isEagerLoad
          />
          <span className={styles.window}>
            <Image
              src={CITIES[index]}
              alt=""
              className={styles.photo}
              width={120}
              height={120}
              isEagerLoad
            />
          </span>
        </span>
      </span>

      {/* Preload the rest so flips are instant (hidden, no layout). */}
      <span className={styles.preload} aria-hidden="true">
        {CITIES.map((city, i) => (
          <Image
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            src={city}
            alt=""
            width={1}
            height={1}
            isEagerLoad
          />
        ))}
      </span>
    </span>
  );
};

export default wrapperHOC(TitleStamp, {
  componentName: "TitleStamp-AboutUsV2",
  showForChina: true,
});
