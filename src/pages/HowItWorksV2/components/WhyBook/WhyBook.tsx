import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
/**
 * Supplied icons — 24-grid monochrome line drawings, `stroke="black"` baked in.
 *
 * These replaced the live site's coloured insight illustrations (the pink heart-snap set, pulled
 * from amber-user-website's CDN). Two things changed with them, and both are deliberate:
 *
 *   · SIZE. Those were drawn on a 46 grid and rendered at 46. These are drawn on 24, so rendering
 *     them at 46 would scale a 1.5px stroke to nearly 3px — heavier than the artwork intends. 32px
 *     is close enough to their own grid to keep the weight honest.
 *   · WEIGHT. Line icons in ink rather than filled illustrations in pink, which is also more at
 *     home on this page: it is monochrome everywhere else, and the coloured set was the only
 *     colour on it.
 *
 * The file names describe what they draw, unlike the CDN set — whose names were rotated one place
 * against their contents. No mapping trap here.
 */
import iconBookings from "../../assets/icons/flash.svg";
import iconPrice from "../../assets/icons/discount-down.svg";
import iconAssistance from "../../assets/icons/hospital-phone.svg";
import iconVerified from "../../assets/icons/document-verified.svg";
import styles from "./WhyBook.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Why book with amber" — the reassurance section, between the three steps and the footer.
 *
 * ── The layout ──────────────────────────────────────────────────────────────
 * A centred two-line heading in the page's own pattern — statement, then the second line
 * dropped back to grey, exactly as `Hero` and `Steps` do it — and under it four columns
 * divided by full-height hairlines. Each column reads top to bottom: a small icon, the
 * claim, its copy. Nothing else.
 *
 * The icons are PLACEHOLDERS pending the real set — see the note on `Reason.icon` for how to
 * swap them in.
 *
 * No supporting paragraph and no "Learn more" links. The heading's grey second line is the
 * support and the columns carry their own copy; a link under each one would need a page
 * behind it, and these four are promises rather than topics.
 *
 * This is a deliberate step BACK from a version that carried plate numbers (`FIG 01`…) and
 * large generated isometric wireframes, one per column. That version was a faithful copy of
 * a different reference and it was too much furniture for what this section says: four short
 * promises. The drawings needed a 210px stage each, which set the section's height, and the
 * plate numbers implied a numbered sequence the four claims do not have.
 *
 * ── The copy ────────────────────────────────────────────────────────────────
 * These four are amber's own live promises, in amber's own words and order. One edit: each
 * line ends in a single full stop, where the source renders a double ("..book with us.."),
 * which reads as a typo rather than as an ellipsis at this size. Nothing else is changed —
 * these are commitments the business makes, so the wording is not ours to improve.
 */

interface Reason {
  title: string;
  body: string;
  /**
   * The column's icon, as an imported asset URL.
   *
   * All four are the live site's icons now. The placeholder path stays, because it is what makes
   * an unset icon obvious rather than invisible — see the note on `Icon`.
   */
  icon?: string;
}

const REASONS: Reason[] = [
  {
    title: "Instant & Easy Bookings",
    icon: iconBookings,
    body: "Time is money. Save both when you book with us.",
  },
  {
    title: "Lowest Price Guarantee",
    icon: iconPrice,
    body: "Find a lower price and we'll match it. No questions asked.",
  },
  {
    title: "24x7 Assistance",
    icon: iconAssistance,
    body: "If you have a doubt or a query, we're always a call away.",
  },
  {
    title: "100% Verified Listings",
    icon: iconVerified,
    body: "We promise to deliver what you see on the website.",
  },
];

/**
 * The column's icon, or a placeholder while there isn't one.
 *
 * Both render into the same 40px box, so the section's layout is already final — the real
 * icons will drop in without moving a single line of copy.
 *
 * The placeholder is a dashed empty square on purpose. It has to be unmistakably temporary:
 * anything that reads as a finished mark is the kind of placeholder that survives into
 * production because nobody notices it is still there.
 */
const Icon = ({ src }: { src?: string }) =>
  src ? (
    <img className={styles.icon} src={src} alt="" width="40" height="40" />
  ) : (
    <span className={styles.iconPlaceholder} aria-hidden="true" />
  );

const WhyBook = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      <Reveal className={styles.headingBlock}>
        <h2 className={styles.heading}>
          Why book with amber
          <br />
          <span className={styles.headingMuted}>What every booking comes with.</span>
        </h2>
      </Reveal>

      <ul className={styles.grid}>
        {REASONS.map((reason, i) => (
          // Staggered off the index so the columns arrive left to right rather than all at
          // once, matching how the steps above come in one at a time.
          <Reveal as="li" key={reason.title} className={styles.item} delay={i * 90}>
            <Icon src={reason.icon} />
            <h3 className={styles.itemTitle}>{reason.title}</h3>
            <p className={styles.itemText}>{reason.body}</p>
          </Reveal>
        ))}
      </ul>
    </div>
  </section>
);

export default wrapperHOC(WhyBook, {
  componentName: "WhyBook-HowItWorksV2",
  showForChina: true,
});
