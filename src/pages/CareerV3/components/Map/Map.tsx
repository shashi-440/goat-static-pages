import { useEffect, useRef, useState } from "react";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Map.module.scss";
import WorldOutline from "./WorldOutline";

/**
 * Markets plotted on the map. `x`/`y` are percentages of the map box, derived
 * from each city's real latitude/longitude on the SAME equirectangular window
 * WorldOutline uses (-168°→190° lon, 78°N→-56°S lat) — that is what puts the
 * dot on the right piece of land. They are not eyeballed, and they cannot be
 * adjusted independently of that window.
 *
 * `hub` marks the offices amber staffs; the rest are markets served.
 */
interface Market {
  city: string;
  country: string;
  x: number;
  y: number;
  hub?: boolean;
}

const MARKETS: Market[] = [
  { city: "London", country: "United Kingdom", x: 46.9, y: 19.8, hub: true },
  { city: "Dublin", country: "Ireland", x: 45.2, y: 18.4 },
  { city: "Berlin", country: "Germany", x: 50.7, y: 19.0 },
  { city: "Barcelona", country: "Spain", x: 47.5, y: 27.3 },
  { city: "Pune", country: "India", x: 67.6, y: 44.4, hub: true },
  { city: "Dubai", country: "UAE", x: 62.4, y: 39.4 },
  { city: "New York", country: "United States", x: 26.3, y: 27.8, hub: true },
  { city: "Toronto", country: "Canada", x: 24.8, y: 25.6 },
  { city: "Austin", country: "United States", x: 19.6, y: 35.6 },
  { city: "Sydney", country: "Australia", x: 89.2, y: 83.5, hub: true },
  { city: "Melbourne", country: "Australia", x: 87.4, y: 86.4 },
  { city: "Auckland", country: "New Zealand", x: 95.7, y: 85.7 },
  { city: "Singapore", country: "Singapore", x: 75.9, y: 57.2 },
  { city: "Hong Kong", country: "Hong Kong", x: 78.8, y: 41.6 },
];

const STATS = [
  { value: "80+", label: "Countries served" },
  { value: "250+", label: "Cities worldwide" },
  { value: "800+", label: "Partner universities" },
  { value: "2M+", label: "Beds available" },
];

// Gap between each dot landing, in ms.
const DOT_STEP = 110;

/**
 * Section 4 — where amber operates.
 *
 * Dots drop onto the map one after another when the section scrolls in, each
 * with a pulse ring on the offices. Hovering a dot names the city.
 */
const Map = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [dotsIn, setDotsIn] = useState(0);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDotsIn(MARKETS.length);
      return undefined;
    }

    const timers: number[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          MARKETS.forEach((_, i) => {
            timers.push(window.setTimeout(() => setDotsIn(i + 1), i * DOT_STEP));
          });
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="our-scale">
      <Reveal className={styles.header}>
        <p className={styles.eyebrow}>Where we operate</p>
        <h2 className={styles.title}>One team, wherever the students are going</h2>
        <p className={styles.subtitle}>
          From London to Sydney, amber runs in the markets students actually move to &mdash; and the
          people building it sit in those same places.
        </p>
      </Reveal>

      <Reveal className={styles.mapWrap} delay={120}>
        <div className={styles.map}>
          <WorldOutline className={styles.outline} />

          {/* Dots are absolutely positioned over the map so each one can carry
              its own label and pulse without complicating the SVG. */}
          {MARKETS.map((market, i) => (
            <span
              key={market.city}
              className={`${styles.pin} ${market.hub ? styles.pinHub : ""} ${
                i < dotsIn ? styles.pinIn : ""
              }`}
              style={{ left: `${market.x}%`, top: `${market.y}%` }}
              tabIndex={0}
              role="button"
              aria-label={`${market.city}, ${market.country}`}
            >
              {market.hub ? <span className={styles.pulse} aria-hidden="true" /> : null}
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.tooltip} aria-hidden="true">
                <span className={styles.tooltipCity}>{market.city}</span>
                <span className={styles.tooltipCountry}>{market.country}</span>
              </span>
            </span>
          ))}
        </div>

        <p className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendHub}`} aria-hidden="true" />
            amber offices
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} aria-hidden="true" />
            Markets served
          </span>
        </p>
      </Reveal>

      <div className={styles.stats}>
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} className={styles.stat} delay={i * 80}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default wrapperHOC(Map, {
  componentName: "Map-CareerV3",
  showForChina: true,
});
