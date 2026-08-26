import styles from "./Diagram.module.scss";
// The exported fragments, straight from the Figma node (5985:12536) and unmodified. Each diagram is
// assembled from several of these rather than shipping as one file, because that is how the design
// exports: every leaf group in the Figma icon is its own SVG.
//
// The colour split, for anyone changing these: `fill="black"` (18 across the set) is a solid
// marker, `stroke="black"` (45) draws the dashed runs and the hollow markers' outlines, and
// `fill="white"` (17) is those hollow markers' interiors. A retint that only wants the solid
// markers touches the first group and leaves the other two alone.
import group0 from "../../assets/icons/connect/group-0.svg";
import group1 from "../../assets/icons/connect/group-1.svg";
import group2 from "../../assets/icons/connect/group-2.svg";
import group3 from "../../assets/icons/connect/group-3.svg";
import group4 from "../../assets/icons/connect/group-4.svg";
import group5 from "../../assets/icons/connect/group-5.svg";
import group6 from "../../assets/icons/connect/group-6.svg";
import group7 from "../../assets/icons/connect/group-7.svg";
import group8 from "../../assets/icons/connect/group-8.svg";
import group9 from "../../assets/icons/connect/group-9.svg";
import group10 from "../../assets/icons/connect/group-10.svg";
import group11 from "../../assets/icons/connect/group-11.svg";
import group12 from "../../assets/icons/connect/group-12.svg";
import group13 from "../../assets/icons/connect/group-13.svg";
import group14 from "../../assets/icons/connect/group-14.svg";
import group15 from "../../assets/icons/connect/group-15.svg";
import vector0 from "../../assets/icons/connect/vector-0.svg";
import vector1 from "../../assets/icons/connect/vector-1.svg";
import iconSolo from "../../assets/icons/connect/icon-solo.svg";

/**
 * One of the four line diagrams from the Figma node, drawn at its designed 108px.
 *
 * ── WHY THIS IS A POSITIONING TABLE AND NOT A DRAWING ──────────────────────
 * Every piece here is an EXPORTED ASSET. Nothing is redrawn, re-pathed or approximated: the Figma
 * icons are groups of tiny primitives (a 6.3px filled square, a dashed run, a ring) and the export
 * gives one SVG per group. So the component's whole job is to place those files back at the
 * fractions the design places them at.
 *
 * ⚠️  TWO NESTED BOXES PER FRAGMENT, and both are load-bearing:
 *   · `outer` is the fragment's box as a share of the 108px icon — straight from the design.
 *   · `inner` is a small NEGATIVE inset that bleeds the artwork slightly outside that box. That is
 *     the design's own stroke compensation: a 0.7px stroke centred on the path edge overhangs the
 *     geometric bounds, and the export bakes that overhang into the file's viewBox. Drop the inner
 *     box and every stroked fragment renders a fraction small and slightly clipped.
 *
 * Values are `inset` shorthand — top right bottom left — copied from the design's own percentages.
 *
 * ⚠️  The wrapper groups in the reference carry `display: contents`, so their insets are inert and
 * fragment positions resolve against the 108px icon box itself. That is why this is one flat list
 * per diagram rather than a tree: reintroducing the wrappers as real boxes would re-base every
 * child and scramble the layout.
 */

interface Fragment {
  src: string;
  outer: string;
  /** Omitted where the design puts the image directly at inset 0 of its own box. */
  inner?: string;
}

/** The nodes-and-links diagram. */
const NETWORK: Fragment[] = [
  { src: group0, outer: "10.23% 19.18% 19.47% 10.38%", inner: "-0.21% -0.41% -0.33% -0.33%" },
  { src: group1, outer: "7.78% 87.02% 87.02% 7.78%", inner: "-6.25%" },
  { src: group2, outer: "7.78% 51.95% 87.02% 42.86%", inner: "-6.25%" },
  { src: group3, outer: "7.78% 16.87% 87.02% 77.93%", inner: "-6.25%" },
  { src: group2, outer: "42.86% 87.02% 51.95% 7.78%", inner: "-6.25%" },
  { src: group2, outer: "42.86% 51.95% 51.95% 42.86%", inner: "-6.25%" },
  { src: group4, outer: "42.86% 16.87% 51.95% 77.93%", inner: "-6.25%" },
  { src: group5, outer: "77.93% 87.02% 16.87% 7.78%", inner: "-6.25%" },
  { src: group6, outer: "68.84% 7.78% 7.78% 68.84%", inner: "-1.39%" },
];

/** The radiating square. */
const RADIATE: Fragment[] = [
  { src: group7, outer: "7.14% 50% 7.14% 7.14%", inner: "-0.25% -0.49% -0.24% -0.49%" },
  { src: group8, outer: "7.14% 7.14% 7.14% 50%", inner: "-0.25% -0.49% -0.24% -0.49%" },
  // No inner box: the design places this one's image at inset 0 of its own frame.
  { src: group9, outer: "7.14% -26.19% -26.19% 7.14%" },
  { src: group10, outer: "35.71%", inner: "-1.04%" },
];

/** The dashed diamond. */
const DIAMOND: Fragment[] = [
  { src: group11, outer: "7.35% 4.91% 4.91% 7.35%", inner: "-0.35%" },
  { src: vector0, outer: "28.35% 25.91% 25.91% 28.35%", inner: "-0.94%" },
  { src: group12, outer: "48.78% 69.21% 46.34% 25.91%", inner: "-6.25%" },
  { src: group13, outer: "25.91% 46.34% 69.21% 48.78%", inner: "-6.25%" },
  { src: group14, outer: "48.78% 23.48% 46.34% 71.65%", inner: "-6.25%" },
  { src: group15, outer: "71.65% 46.34% 23.48% 48.78%", inner: "-6.25%" },
  { src: vector1, outer: "48.78% 46.34% 46.34% 48.78%" },
];

/** The thirds-ring. A single exported file in the design, not a group. */
const DIAL: Fragment[] = [{ src: iconSolo, outer: "0" }];

export const DIAGRAMS = { NETWORK, RADIATE, DIAMOND, DIAL };

export type DiagramName = keyof typeof DIAGRAMS;

interface DiagramProps {
  name: DiagramName;
}

const Diagram = ({ name }: DiagramProps) => (
  // Decorative: the figure and its caption beside it carry the meaning, and forty announced
  // fragments would be unusable. `overflow: hidden` is the design's own clip — `RADIATE` reaches
  // past the box on two sides and is meant to be cut there.
  <div className={styles.icon} aria-hidden="true">
    {DIAGRAMS[name].map((f, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <span key={i} className={styles.outer} style={{ inset: f.outer }}>
        {f.inner ? (
          <span className={styles.inner} style={{ inset: f.inner }}>
            <img src={f.src} alt="" className={styles.art} />
          </span>
        ) : (
          <img src={f.src} alt="" className={styles.art} />
        )}
      </span>
    ))}
  </div>
);

export default Diagram;
