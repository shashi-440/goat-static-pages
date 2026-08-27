import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import { OPERATOR_LOGOS } from "../Ticker/Ticker";
import styles from "./Audience.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Who we work with" — Figma node 2456:6580, rebuilt as a list.
 *
 * ── Why the two photo tiles went ────────────────────────────────────────────
 * This section was a 424px heading column beside two large photo tiles, one for
 * "For PBSA & operators" and one "For private landlords". Two problems, and the
 * second is the one that decided it:
 *
 *   · It only named TWO audiences, and the section has to name three — multifamily,
 *     BTR and managed housing were not in it at all, so a whole category of operator
 *     read the page and did not find themselves on it.
 *   · The shape does not extend. A third 360px photo makes the section a screen and
 *     a half, and there is no photograph that says "build-to-rent operator" as
 *     distinct from "PBSA operator" — they are the same room. The tiles were
 *     illustrating the audiences with pictures that could not tell them apart.
 *
 * So this is the same list pattern as Partner With Us's "Built for partners like
 * you" (see that component — the reasoning there is the same, at five entries), and
 * the words do the work the photographs could not. `room-pbsa.jpg` and
 * `room-landlord.jpg` are still in `assets/` if the tiles are ever wanted back.
 *
 * ── The logo strip at the foot ──────────────────────────────────────────────
 * The operator marks were on this page once, as `Ticker`, a two-row wall inside the
 * hero — and they are commented out there, so they had disappeared from the page
 * entirely. They belong here rather than back in the hero: this is the section that
 * makes a claim about who amber works with, and the marks are the evidence for it.
 * Naming the operators next to the categories is what turns "we work with PBSA
 * operators" into something checkable.
 *
 * They sit as the last ROW OF THIS SECTION rather than a band after it — a strip
 * between two bands belongs to neither. Same call as Partner With Us.
 */
/**
 * ── The three marks, drawn here rather than imported ────────────────────────
 * `assets/icons/` has two building glyphs — `building-office.svg` and
 * `corporate-building.svg` — and this row needs three. Taking two from the folder and
 * drawing the third would show: they are a filled isometric illustration and a stroke icon
 * respectively, so the set would have had two weights and two projections in one row of
 * three. A matched set beats a closer match on any one of them.
 *
 * One 20px grid, 1.5px stroke, round caps and joins, and `currentColor` throughout — so the
 * tint lives in the CSS with everything else and these do not have to be re-exported if the
 * colour changes. The scale is deliberate: a TALL block, TWO blocks, and a HOUSE, which is
 * the actual distinction the three rows are drawing.
 */
const IconTower = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M4.75 17.25V4A1.25 1.25 0 0 1 6 2.75h8A1.25 1.25 0 0 1 15.25 4v13.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.75 17.25h14.5M8 6h1M11 6h1M8 9h1M11 9h1M8 12h1M11 12h1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 17.25v-2.5h3v2.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconBlocks = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M2.75 17.25V9a1 1 0 0 1 1-1h3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.25 17.25V4a1.25 1.25 0 0 1 1.25-1.25h5A1.25 1.25 0 0 1 14.75 4v13.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.75 17.25h16.5M10 6h1.5M10 9h1.5M10 12h1.5M4.5 11.5h1M4.5 14.25h1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconHouse = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M3 8.25 10 2.75l7 5.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 7.5v8.75a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 17.25v-4a2 2 0 0 1 4 0v4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AUDIENCES = [
  {
    title: "Student housing operators (PBSA)",
    body: "Fill voids across every asset in your portfolio.",
    icon: <IconTower />,
    tint: "iconViolet",
  },
  {
    title: "Multifamily, BTR and managed housing operators",
    body: "Bring student demand into build-to-rent and managed stock.",
    icon: <IconBlocks />,
    tint: "iconBlue",
  },
  {
    title: "Private landlords",
    body: "List a single room or an entire building, for free.",
    icon: <IconHouse />,
    tint: "iconPurple",
  },
];

const Audience = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      {/* Decorative, and `aria-hidden` for it: the break between this section and the one
          above is already carried by the <section> and its <h2>, so an <hr> here would
          announce a thematic break a reader is told about twice. Drawn as a span for the
          same reason the mock-ups' rules on this page are. */}
      <span className={styles.rule} aria-hidden="true" />

      <div className={styles.row}>
        <Reveal className={styles.heading}>
          <h2 className={styles.title}>Who we work with</h2>
          <p className={styles.subtitle}>
            From a single room to a national portfolio.
          </p>
        </Reveal>

        {/* A real list: three sibling entries with no order to them. The rules
            between them are the <li> borders rather than separate elements, so
            there is no stray rule above the first or below the last. */}
        <ul className={styles.list}>
          {AUDIENCES.map((audience, i) => (
            <Reveal
              as="li"
              className={styles.item}
              key={audience.title}
              delay={i * 60}
            >
              {/* The mark and the label share the row's fixed left column, so every body
                  copy still starts on one edge down the list — the icon is inside the
                  measure rather than added in front of it. */}
              <div className={styles.itemLead}>
                <span className={`${styles.itemIcon} ${styles[audience.tint]}`}>
                  {audience.icon}
                </span>
                <h3 className={styles.itemTitle}>{audience.title}</h3>
              </div>
              <p className={styles.itemBody}>{audience.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>

      {/* The one place this diverges from Partner With Us, which deliberately drops the
          label over its marks because its section heading already says what they are.
          Here the heading says who amber works WITH, and the marks are a different
          statement about the same thing — that the reader would be in known company —
          so the strip is given its own line. It is a <p>, not a heading: it introduces
          eight logos, not a subsection, and an <h3> here would sit in the outline as a
          peer of the three audience entries above it. */}
      <div className={styles.marks}>
        <p className={styles.marksLabel}>You are in good company</p>
        <div className={styles.marksGrid}>
          {OPERATOR_LOGOS.map((logo) => (
            <div
              className={styles.mark}
              key={logo.alt}
              style={{ width: logo.width, height: logo.height }}
            >
              {/* isNotLazy: a logo wall should read as one steady row, not eight
                  things popping in. */}
              <Image
                src={logo.src}
                alt={logo.alt}
                className={styles.markImage}
                width={logo.width}
                height={logo.height}
                isNotLazy
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default wrapperHOC(Audience, {
  componentName: "Audience-ListWithUs",
  showForChina: true,
});
