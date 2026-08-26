import styles from "./Receipt.module.scss";

/**
 * The "Zero listing fees" card's art, as a till receipt.
 *
 * ── WHY A RECEIPT AND NOT A TABLE ──────────────────────────────────────────
 * This replaced three rows of label-and-value in a bordered box. The content was right and it
 * read as a spreadsheet fragment: three lines of type and then half a card of nothing, because
 * three rows cannot fill a 318px media window however they are spaced.
 *
 * A receipt fixes both problems at once. It is a form the eye already knows, so "$0" against every
 * line lands as a joke the reader gets rather than a value they have to interpret; and a receipt has
 * furniture — a torn edge, a total, a barcode, a footer — which fills the frame honestly instead of
 * padding it out.
 *
 * ⚠️  EVERY LINE ITEM HERE IS A CLAIM. The four zeroes are the ones the FAQ makes in words ("no
 * upfront cost, no onboarding fee and no charge for being on the platform", and a named account
 * manager with no fee attached). Do not add a line just because the receipt has room — the format
 * makes anything on it look audited.
 *
 * ⚠️  COMMISSION CARRIES NO NUMBER, and sits BELOW the total rather than in the list. It is not a
 * zero, so putting it among them would either need a rate this page does not publish anywhere, or
 * imply it is also free. Below the total it reads as the one thing that is chargeable, which is the
 * truth.
 */

/** The four things that cost nothing. Aligned right in mono, so the column of zeroes lines up. */
const LINES = [
  { label: "Listing fee", value: "0.00" },
  { label: "Onboarding", value: "0.00" },
  { label: "Platform access", value: "0.00" },
  { label: "Account manager", value: "0.00" },
];

/**
 * Barcode bar widths in px, as a fixed pattern.
 *
 * ⚠️  A LITERAL ARRAY, not `Math.random()` and not a repeating gradient. Random would give a
 * different barcode on the server than on the client and hydration would throw; a single repeating
 * gradient can only produce one bar width, which reads as a hatch pattern rather than a code. This
 * is 34 bars of four widths, arranged so no run of three is identical.
 */
const BARS = [
  1, 3, 1, 2, 1, 1, 3, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2,
  1, 1, 3, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3, 2, 1, 3, 1,
];

const Receipt = () => (
  /* ⚠️  TWO ELEMENTS, AND THE SPLIT IS NOT COSMETIC. The lift lives on this outer wrapper and the
     torn edge on the inner sheet, because CSS applies `clip-path` AFTER `filter` — put both on one
     element and the clip cuts away the very shadow the filter just drew. Measured that way: two
     levels of darkening and zero reach, i.e. no shadow at all. Filtering the PARENT of a clipped
     child shadows the clipped silhouette instead, so the teeth cast shadow and nothing removes it.
     Do not merge these back together. */
  <div className={styles.lift}>
    <div className={styles.receipt}>
    {/* The torn edge is CUT OUT of the paper now — a `clip-path` on `.receipt` rather than an
        overlay element, so there is nothing to render here. See the note on that rule. */}
    <div className={styles.head}>
      <span className={styles.headL}>
        <span className={styles.brand}>AMBER</span> · LIST WITH US
      </span>
      <span className={styles.headR}>NO. 0000</span>
    </div>

    <span className={styles.ruleDashed} aria-hidden="true" />

    <div className={styles.lines}>
      {LINES.map((line) => (
        <div className={styles.line} key={line.label}>
          <span className={styles.lineLabel}>{line.label}</span>
          {/* The dotted leader. A flexible span with a dotted bottom border, which is what makes
              the amounts a column instead of four separately-positioned numbers. */}
          <span className={styles.leader} aria-hidden="true" />
          <span className={styles.lineValue}>{line.value}</span>
        </div>
      ))}
    </div>

    {/* The total. A TINTED BAND bled to the paper's edges rather than another ruled row: it is the
        one number on the receipt that matters, and on a sheet of mono grey the only ways to say so
        are size or colour. Size alone had it reading as a slightly bigger row. */}
    <div className={styles.total}>
      <span className={styles.totalLabel}>TOTAL TO LIST</span>
      <span className={styles.totalValue}>$0.00</span>
    </div>

    <span className={styles.ruleDashed} aria-hidden="true" />

    <div className={styles.note}>
      <span className={styles.noteLabel}>Commission</span>
      <span className={styles.noteValue}>On confirmed bookings</span>
    </div>

    {/* ⚠️  THE STAMP IS GONE, and so are the barcode's digits. Both were added to fill what looked
        like dead paper, and both made it worse: the receipt fills its window to the pixel, so once
        the spacer's floor came down to fit, the rotated stamp landed ON the commission line and the
        barcode. Two overlapping marks plus a line of digits turned a tidy receipt into a cluttered
        one.
        
        The lesson worth keeping: this panel has room for about eight rows and no more. Anything new
        has to replace something, not join it. The message the stamp carried is already made twice
        over — by the column of zeroes and by the footer. */}
    <span className={styles.spacer} aria-hidden="true" />

    <div className={styles.foot}>
      {/* `space-between` on the container, so the bars keep their own widths while the GAPS stretch
          to fill the paper exactly. The bars were left-aligned and stopped 60% across, which read
          as a truncated image rather than a code. Uneven gaps are also what a real code looks
          like. */}
      <div className={styles.barcode} aria-hidden="true">
        {BARS.map((w, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={styles.bar} style={{ width: w }} />
        ))}
      </div>

      <span className={styles.footer}>NOTHING TO PAY TO GO LIVE</span>
      </div>
    </div>
  </div>
);

export default Receipt;
