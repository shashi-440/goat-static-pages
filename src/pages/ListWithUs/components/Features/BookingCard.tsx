import Image from "@Components/Image";
import styles from "./BookingCard.module.scss";
// ⚠️  AN ILLUSTRATED AVATAR, NOT A PHOTO, and taken from Partner With Us's testimonials — the same
// set the numbers panel's testimonial draws from, so the page has one avatar style rather than two.
// Imported across pages rather than copied in.
//
// `testimonial-avatar-1` specifically: it is male-presenting, which suits the name beside it, and it
// is not the one (`-2`) already on this page in the numbers panel. Illustrations also sidestep the
// problem a photo has here — a stock face above a made-up booking reads as a real person's booking.
import student from "../../../PartnerWithUs/assets/testimonial-avatar-1.png";

/**
 * The "Fully integrated bookings" card's art — one booking, start to finish.
 *
 * ── WHY IT WAS REBUILT ─────────────────────────────────────────────────────
 * The previous version was four identical rows: a blue dot, a label, a timestamp. Every step carried
 * the same weight and the same colour, so the panel read as a list rather than as a process, and the
 * only colour on it was one blue plus grey.
 *
 * Three things changed, and none of them adds a claim:
 *   · EACH STEP HAS ITS OWN ICON AND HUE, so the four events are distinguishable at a glance instead
 *     of being four dots. The hues come from the palette the numbers panel already uses.
 *   · IT WAS THEN CUT BACK. An elapsed gap ("+6h 48m") sat under every label for a while, computed
 *     from the timestamps. It was genuinely useful and it went anyway: two time readings on one row —
 *     a duration and a clock — made four rows carry twelve pieces of text, and the card read as dense
 *     before it read as informative. The clock survived because it is the conventional one. `Sept
 *     2026` came off the footer and the open step's "Pending" became a dash for the same reason.
 *   · STATE IS CARRIED BY FILL, NOT BY COLOUR: a done step has a filled tinted tile, the open one has
 *     a dashed outline. That frees colour to mean "what kind of event" rather than "done or not".
 *
 * ⚠️  ILLUSTRATIVE MOCK-UP, as with every panel on this row. The name is initialled, the face is an
 * illustration rather than a photograph, and the property is one already used in the Tools section's
 * listing chip — so nothing here reads as a real person's real booking.
 */

interface Step {
  label: string;
  /** Minutes from Monday 00:00. Both the clock and the elapsed gaps are derived from this, so the two
   *  can never disagree — which they would if each were written out by hand. */
  at: number;
  icon: string;
  /** Key of a `.tile*` class carrying this step's two colours. */
  tone: string;
  done: boolean;
}

const DAYS = ["Mon", "Tue", "Wed"];

/** "Mon 09:14" from minutes-since-Monday. */
const clockOf = (at: number) => {
  const day = DAYS[Math.floor(at / 1440)];
  const mins = at % 1440;
  return `${day} ${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
};


/**
 * ⚠️  THE LAST STEP IS DELIBERATELY OPEN. Every step ticked would be a picture of something already
 * finished; one outstanding is what makes this a process. Its connector is dashed and it has no
 * clock, because it has not happened.
 */
const TRAIL: Step[] = [
  { label: "Enquiry received", at: 554, icon: "iconMail", tone: "toneSky", done: true },
  { label: "Viewing arranged", at: 962, icon: "iconCalendar", tone: "toneIndigo", done: true },
  { label: "Offer accepted", at: 2120, icon: "iconFile", tone: "toneTeal", done: true },
  { label: "Booking confirmed", at: -1, icon: "iconKey", tone: "tonePending", done: false },
];

const DONE = TRAIL.filter((s) => s.done).length;

const BookingCard = () => (
  <div className={styles.card}>
    <div className={styles.head}>
      <span className={styles.headL}>BOOKING</span>
      <span className={styles.headR}>#48210</span>
    </div>

    {/* The student. A booking with a face on it reads as a booking; without one this panel is a state
        machine. `isNotLazy` because the shared Image otherwise fades itself in from opacity 0 and the
        whole card already arrives as one piece. */}
    <div className={styles.who}>
      <Image src={student} alt="" className={styles.avatar} width={30} height={30} isNotLazy />
      <span className={styles.whoText}>
        <span className={styles.whoName}>Aarav S.</span>
        <span className={styles.whoMeta}>Chapter Spitalfields</span>
      </span>

      {/* ⚠️  THE COUNT IS DERIVED, not written. A chip that says "3 of 4" beside a list where anyone
          can count the ticks is the kind of thing that goes stale silently. */}
      <span className={styles.chip}>
        {DONE} of {TRAIL.length}
      </span>
    </div>

    {/* ⚠️  `flex: 1` WITH `space-between` — the steps spread over whatever height is left rather than
        stacking from the top. That is what keeps the panel full: the version before last was a fixed
        stack and left the bottom 40% of the card empty. */}
    <div className={styles.trail}>
      {TRAIL.map((step, i) => {
        const next = TRAIL[i + 1];
        return (
          <div className={styles.step} key={step.label}>
            <span className={styles.mark}>
              <span
                className={`${styles.tile} ${styles[step.tone]} ${
                  step.done ? "" : styles.tileOpen
                }`}
                aria-hidden="true"
              >
                <span className={`${styles.glyph} ${styles[step.icon]}`} />
              </span>

              {/* The connector, and the elapsed time sitting on it. No connector under the last row —
                  a line leaving the final step points at nothing. The leg into the OPEN step is
                  dashed, so the run of solid line stops where the booking actually got to. */}
              {next && (
                <span
                  className={`${styles.line} ${next.done ? "" : styles.lineOpen}`}
                  aria-hidden="true"
                />
              )}
            </span>

            <span className={`${styles.label} ${step.done ? "" : styles.labelOpen}`}>
              {step.label}
            </span>

            <span className={`${styles.time} ${step.done ? "" : styles.timeOpen}`}>
              {step.at > 0 ? clockOf(step.at) : "—"}
            </span>
          </div>
        );
      })}
    </div>

    <span className={styles.rule} aria-hidden="true" />

    <div className={styles.foot}>
      <span className={styles.footLabel}>Studio · 51 weeks</span>
      <span className={styles.footValue}>Docs signed</span>
    </div>
  </div>
);

export default BookingCard;
