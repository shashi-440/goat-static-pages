import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import { PARTNER_LOGOS } from "../LogoStrip/LogoStrip";
import styles from "./Audience.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Who we work with" — the partner types, between the benefits and the partner
 * logo wall.
 *
 * ── Why a list and not the sibling page's photo tiles ───────────────────────
 * List With Us has a section of the same name (its `Audience`) built as two large
 * photo tiles. That shape does not survive being given FIVE entries: five 360px
 * photos is a screen and a half of section, and there is no photograph that says
 * "fintech / travel / student services companies" without being decorative
 * filler. These entries are one line each, so they are set as a list and the
 * words do the work.
 *
 * ── The heading column ──────────────────────────────────────────────────────
 * 424px and static, matching this page's Benefits rail and List With Us's own
 * heading column, so the three sections share one left edge and one measure. It
 * is deliberately NOT sticky: Benefits' rail is sticky because its panels scroll
 * past it and the rail is a live index of them. Nothing here scrolls past
 * anything, so pinning it would only be motion for its own sake.
 */
/**
 * ── The five marks, drawn here rather than imported ─────────────────────────
 * Same construction as List With Us's section of this shape, and for the same reason:
 * there is no icon set in this sandbox to take a matched five from, and mixing a filled
 * isometric illustration with stroke icons shows as two weights in one column.
 *
 * One 20px grid, 1.5px stroke, round caps and joins, `currentColor` throughout — so the
 * tint lives in the CSS with everything else and these never need re-exporting when a
 * colour changes.
 *
 * The five are chosen to be told apart at 20px, which is the only thing that matters at
 * this size: a CAP, a PERSON SPEAKING, a WINDOW, a GROUP, and a CARD. Those are the
 * distinctions the five rows actually draw — an institution, an adviser, a product
 * surface, a community, and a commercial service.
 */
const IconCap = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M10 3.25 18 7l-8 3.75L2 7l8-3.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.5 8.9v4.35c0 1.24 2.01 2.25 4.5 2.25s4.5-1.01 4.5-2.25V8.9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 7.9v3.85"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconAdviser = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
    <circle
      cx="7.5"
      cy="6.75"
      r="2.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.75 16.75a4.75 4.75 0 0 1 9.5 0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.25 3.5h4v3.25h-1.5l-1.75 1.5V6.75h-0.75V3.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconWindow = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
    <rect
      x="2.75"
      y="3.75"
      width="14.5"
      height="12.5"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.75 7.75h14.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 11.25h4.5M6 13.75h2.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconGroup = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
    <circle
      cx="10"
      cy="6.25"
      r="2.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.25 16.5a3.75 3.75 0 0 1 7.5 0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="15.25"
      cy="8"
      r="1.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="4.75"
      cy="8"
      r="1.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.25 13.75a3 3 0 0 1 2.5-1.6M17.75 13.75a3 3 0 0 0-2.5-1.6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCard = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
    <rect
      x="2.25"
      y="5"
      width="15.5"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.25 8.75h15.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.5 12.25h3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PARTNER_TYPES = [
  {
    title: "Universities",
    icon: <IconCap />,
    tint: "iconViolet",
    body: "Extend student support beyond campus.",
  },
  {
    title: "Education consultants",
    icon: <IconAdviser />,
    tint: "iconBlue",
    body: "Help students solve accommodation alongside admissions.",
  },
  {
    title: "Student platforms",
    icon: <IconWindow />,
    tint: "iconPurple",
    body: "Add housing directly into your existing journey.",
  },
  {
    title: "Creators & communities",
    icon: <IconGroup />,
    tint: "iconBlue",
    body: "Recommend trusted accommodation and earn from bookings.",
  },
  {
    title: "Fintech / travel / student services companies",
    icon: <IconCard />,
    tint: "iconViolet",
    body: "Embed accommodation into a broader study-abroad offering.",
  },
];

/**
 * Twelve cells across two rows of six.
 *
 * ⚠️  THERE ARE ONLY SIX REAL PARTNER LOGOS. `PARTNER_LOGOS` holds Educred, ErasmusPlay,
 * Study Smart, LeapScholar, iSchoolConnect and MiM-Essay; twelve was asked for, so the
 * six are repeated to fill the wall. Every mark therefore appears TWICE, which is
 * visible if you look along a row.
 *
 * This is the same placeholder trick the page's university strip and its testimonial
 * carousel already use, and it is a placeholder either way: SEND SIX MORE LOGO FILES and
 * this collapses back to one honest pass over a twelve-item table. Repeating a partner's
 * mark to pad a wall is not something to ship.
 *
 * `key` is the index rather than the alt text precisely because of the repeats — two
 * cells share a name.
 */
const MARKS = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

const Audience = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      {/* Decorative, and aria-hidden for it: the break between this section and
          the benefits above is already carried by the <section> and its <h2>, so
          an <hr> here would announce a thematic break a reader is told about
          twice. Drawn as a span for the same reason the mock-ups' rules are. */}
      <span className={styles.rule} aria-hidden="true" />

      <div className={styles.row}>
        <Reveal className={styles.heading}>
          <h2 className={styles.title}>Built for partners like you</h2>
          <p className={styles.subtitle}>Built for every student ecosystem partner.</p>

        </Reveal>

        {/* A real list: five sibling entries with no order to them. The rules
          between them are the <li> borders rather than separate elements, so
          there is no stray rule above the first or below the last. */}
        <ul className={styles.list}>
          {PARTNER_TYPES.map((type, i) => (
            <Reveal as="li" className={styles.item} key={type.title} delay={i * 60}>
              {/* The mark and the label share the row's fixed left column, so every
                  body copy still starts on one edge down the list — the icon is INSIDE
                  the measure rather than added in front of it. Put it outside and every
                  row's body would start 50px right of the heading column above, and the
                  two would stop sharing an edge. */}
              <div className={styles.itemLead}>
                <span className={`${styles.itemIcon} ${styles[type.tint]}`}>
                  {type.icon}
                </span>
                <h3 className={styles.itemTitle}>{type.title}</h3>
              </div>
              <p className={styles.itemBody}>{type.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>

      {/* A full-width strip at the FOOT of the section, not a band after it and not
          a block in the heading column.
          · In the heading column it was cramped into 424px and read as a footnote to
            the copy rather than as the partners the section is about.
          · As its own <section> underneath it read as detached — a strip floating
            between two bands, belonging to neither.
          Here it is the last row of this section: it inherits the same 1280px measure
          and the section's own rhythm, so it sits directly under the list while still
          being part of the thing it illustrates. */}
      {/* No "Our Partners" label. The section's own heading already says what these
          are, and a second, smaller heading directly under the list read as the start
          of a new section rather than as the end of this one. */}
      <div className={styles.marks}>
        <div className={styles.marksGrid}>
          {MARKS.map((logo, i) => (
            <div
              className={styles.mark}
              // The design repeats marks, so alt text is not unique.
              // eslint-disable-next-line react/no-array-index-key
              key={`${logo.alt}-${i}`}
              style={{ width: logo.width, height: logo.height }}
            >
              {/* isNotLazy: a logo wall should read as one steady row, not six
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
  componentName: "Audience-PartnerWithUs",
  showForChina: true,
});
