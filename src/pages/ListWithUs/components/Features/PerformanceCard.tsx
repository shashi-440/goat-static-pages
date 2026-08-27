import styles from "./PerformanceCard.module.scss";

/**
 * The "Track performance" card's art — a month of a property's numbers.
 *
 * ── WHY THIS REPLACED THREE BARS ───────────────────────────────────────────
 * It was a header and three label/value/bar rows, and it filled about 40% of a 318px window; the
 * rest was blank white. Three rows cannot fill that frame however they are spaced — the same failure
 * the fee panel and the booking panel had.
 *
 * What fills it is the thing an analytics panel is actually FOR: a trend. A bar says how big a
 * number is; a line says which way it is going, which is the question a partner is asking. So the
 * headline metric gets a chart and the supporting two keep their bars, which also gives the panel a
 * hierarchy it did not have when all three rows were identical.
 *
 * ⚠️  NO NEW FIGURES WERE INVENTED. The three numbers are the ones this panel already showed —
 * 1,284 enquiries, 612 viewings, 31% conversion, with the same deltas. The chart is a SHAPE for the
 * enquiries figure, not a fourth metric. Adding one would have meant inventing a number, and this
 * page's figures are illustrative enough already.
 */

/**
 * The trend line, as an SVG path on a 0-100 x-axis and a 2-32 y-axis.
 *
 * ⚠️  GENERATED FROM A 30-POINT SERIES, not drawn by hand. The first attempt at writing this literal
 * by eye put the tail at y=-24, which is outside the viewBox — the line simply left the top of the
 * chart. Points are `x = i * 100 / 29` and `y` is the value normalised into the box, so the shape is
 * a real series rather than an approximation of one, and it cannot drift out of frame.
 */
const SPARK_LINE =
  "M 0.0 32.0 L 3.45 30.29 L 6.9 31.14 L 10.34 28.57 L 13.79 29.43 L 17.24 26.43 L 20.69 27.71 L " +
  "24.14 25.14 L 27.59 25.57 L 31.03 23.0 L 34.48 23.86 L 37.93 20.86 L 41.38 22.14 L " +
  "44.83 19.14 L 48.28 20.0 L 51.72 17.0 L 55.17 18.29 L 58.62 15.29 L 62.07 16.14 L " +
  "65.52 13.14 L 68.97 14.43 L 72.41 11.43 L 75.86 12.29 L 79.31 9.29 L 82.76 10.14 L " +
  "86.21 7.14 L 89.66 8.0 L 93.1 4.57 L 96.55 5.86 L 100.0 2.0";

/** The head of the line, for placing the tip dot in CSS. */
const SPARK_END = { x: 100.0, y: 2.0 };

interface Metric {
  label: string;
  value: string;
  delta: string;
  /** Bar fill as a share of the track. */
  width: string;
  /** Key of a `.bar*` class. Each metric gets its own hue. */
  tone: string;
  down?: boolean;
}

/**
 * ⚠️  ONE HUE PER METRIC, which is the fix for the panel reading as two-tone. Both bars were the same
 * blue as the chart above them, so the three measures looked like one measure repeated. The hues come
 * from the palette the numbers panel already uses.
 *
 * ⚠️  NO NEW FIGURES. These are the two numbers the panel already showed, with the same deltas. The
 * chart is a SHAPE for the headline enquiries figure, not a third metric — adding one would have meant
 * inventing it.
 */
const METRICS: Metric[] = [
  { label: "Viewings", value: "612", delta: "9%", width: "48%", tone: "barTeal" },
  { label: "Conversion", value: "31%", delta: "2%", width: "31%", tone: "barIndigo", down: true },
];

const PerformanceCard = () => (
  <div className={styles.card}>
    <div className={styles.head}>
      <span className={styles.headL}>PERFORMANCE</span>
      <span className={styles.headR}>LAST 30 DAYS</span>
    </div>

    {/* The headline metric, with its trend. */}
    <div className={styles.hero}>
      <span className={styles.heroLabel}>Enquiries</span>
      <div className={styles.heroRow}>
        <span className={styles.heroValue}>1,284</span>
        {/* A tinted pill rather than bare green text, and it names what it is measured against. A
            delta with no baseline is a number the reader cannot check. */}
        <span className={styles.heroDelta}>
          <span className={styles.heroArrow} aria-hidden="true" />
          18%
        </span>
        <span className={styles.heroVs}>vs prev 30d</span>
      </div>
    </div>

    {/* ⚠️  `preserveAspectRatio="none"` WITH A viewBox IN PERCENT-LIKE UNITS. The chart has to
        stretch to whatever width the card ends up at, and the path is authored on a 0-100 x-axis for
        exactly that reason. Without `none` the browser letterboxes it and the line stops short of
        the right edge.

        The path is GENERATED from a 30-point series, not drawn by hand — see the note in the
        component's header. `vectorEffect="non-scaling-stroke"` keeps the line 1.5px after the
        non-uniform stretch, which would otherwise squash the stroke horizontally. */}
    <div className={styles.chart}>
      <svg
        className={styles.svg}
        viewBox="0 0 100 34"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lwuPerfArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c64f2" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1c64f2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${SPARK_LINE} L 100 34 L 0 34 Z`} fill="url(#lwuPerfArea)" />
        <path
          d={SPARK_LINE}
          fill="none"
          stroke="#1c64f2"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* The head of the line, as a ringed dot, plus a guide dropping from it to the axis. Both are
          positioned in CSS rather than drawn in the SVG: a circle would be squashed into an ellipse
          and a 1px line into a sliver by the non-uniform stretch above. */}
      <span
        className={styles.guide}
        style={{ left: `${SPARK_END.x}%`, top: `${(SPARK_END.y / 34) * 100}%` }}
        aria-hidden="true"
      />
      <span
        className={styles.tip}
        style={{ left: `${SPARK_END.x}%`, top: `${(SPARK_END.y / 34) * 100}%` }}
        aria-hidden="true"
      />
    </div>

    <span className={styles.rule} aria-hidden="true" />

    <div className={styles.metrics}>
      {METRICS.map((m) => (
        <div className={styles.metric} key={m.label}>
          <div className={styles.metricHead}>
            <span className={styles.metricLabel}>{m.label}</span>
            <span className={styles.metricValue}>{m.value}</span>
            <span className={`${styles.metricDelta} ${m.down ? styles.metricDown : ""}`}>
              {m.down ? "▼" : "▲"} {m.delta}
            </span>
          </div>
          <span className={styles.track}>
            <span
              className={`${styles.fill} ${styles[m.tone]}`}
              style={{ width: m.width }}
            />
          </span>
        </div>
      ))}
    </div>

    {/* Three points rather than two: with only the ends labelled the axis reads as a caption, and a
        midpoint is what makes it read as a scale. Derived from the range, not a new figure. */}
    <div className={styles.axis}>
      <span>1 AUG</span>
      <span>15 AUG</span>
      <span>30 AUG</span>
    </div>
  </div>
);

export default PerformanceCard;
