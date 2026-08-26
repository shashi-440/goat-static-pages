import { useEffect, useRef, useState } from "react";
import styles from "./IntegrationRows.module.scss";

/**
 * The art for "Flexible integrations": the four ways in, connecting one at a time.
 *
 * The card's copy is "start with a simple referral link or integrate deeper through
 * widgets, APIs or white-label solutions" — a sentence about a LADDER. A static list
 * of four names does not show a ladder; lighting them in order does, shallowest
 * first, so the panel reads bottom-rung-upward on its own.
 *
 * ── Three states per row, not two ──────────────────────────────────────────
 * idle -> connecting -> connected. The middle one is what makes the flip read as
 * something HAPPENING rather than a label swapping: a spinner holds for 420ms and
 * then resolves. Without it, four rows change word in four unexplained beats.
 *
 * ── Why the pill cross-fades two layers instead of animating its colours ───
 * ⚠️  The pill used to be one element transitioning `background-color` from #1f2937
 * to a translucent blue. Interpolating between those two runs the pill through
 * MUDDY GREY for 350ms on every flip, four times a cycle — which is exactly what
 * made the panel feel broken. Now the two looks are separate stacked layers and only
 * their opacity animates, so the dark never becomes the blue: one leaves as the
 * other arrives, and no in-between colour is ever painted.
 *
 * Both layers stay mounted and the pill is sized by the WIDER of them, so flipping
 * cannot change its width — "Connect" and "Connected" differ by four characters and
 * a resizing pill drags its whole row sideways.
 *
 * ── The loop restarts by fading, not by un-connecting ──────────────────────
 * Reaching four-of-four and then snapping every row back to "Connect" reads as the
 * panel breaking. The finished state holds, the whole list dips its opacity for a
 * beat, and the rows are reset while they are down.
 *
 * Glyphs are drawn here — generic UI marks (a link, a frame, braces, a shield), not
 * brand logos, the same call the page makes for its chevrons. There is no icon set
 * in this sandbox to take them from.
 */

const ROWS = [
  {
    id: "referral",
    name: "Referral link",
    note: "Live in minutes",
    idle: "Connect",
    done: "Connected",
    glyph: (
      <path
        d="M8.2 11.8a2.6 2.6 0 0 1 0-3.6l1.4-1.4a2.6 2.6 0 0 1 3.6 3.6l-.5.5M11.8 8.2a2.6 2.6 0 0 1 0 3.6l-1.4 1.4a2.6 2.6 0 0 1-3.6-3.6l.5-.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    ),
  },
  {
    id: "widget",
    name: "Widget",
    note: "Drop-in search",
    idle: "Embed",
    done: "Embedded",
    glyph: (
      <>
        <rect
          x="4.2"
          y="5.2"
          width="11.6"
          height="9.6"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path d="M4.2 8.4h11.6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6.4" cy="6.8" r="0.6" fill="currentColor" />
      </>
    ),
  },
  {
    id: "api",
    name: "API",
    note: "Full control",
    idle: "Connect",
    done: "Connected",
    glyph: (
      <path
        d="M7.8 6.4 4.6 10l3.2 3.6M12.2 6.4 15.4 10l-3.2 3.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    id: "white-label",
    name: "White-label",
    note: "Your brand, your domain",
    idle: "Enable",
    done: "Enabled",
    glyph: (
      <path
        d="M10 4.4 15.4 6.7v3.4c0 2.8-2.2 4.6-5.4 5.5-3.2-.9-5.4-2.7-5.4-5.5V6.7L10 4.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
];

/** The beats. Unequal, which is why the loop is a chained timeout not an interval. */
const CONNECTING_MS = 420;
const SETTLE_MS = 300;
const HOLD_MS = 2000;
const DIP_MS = 340;

const Spinner = () => (
  <svg viewBox="0 0 12 12" className={styles.spinner} aria-hidden="true" focusable="false">
    <circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.6" opacity="0.25" fill="none" />
    <path
      d="M6 1.8A4.2 4.2 0 0 1 10.2 6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 12 12" className={styles.check} aria-hidden="true" focusable="false">
    <path
      d="M2.4 6.3 4.7 8.6 9.6 3.6"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

type Phase = "idle" | "connecting" | "connected";

const allIdle = (): Phase[] => ROWS.map(() => "idle");
const allDone = (): Phase[] => ROWS.map(() => "connected");

const IntegrationRows = () => {
  const still =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reduced motion gets the finished panel, not a faster animation of reaching it.
  const [phases, setPhases] = useState<Phase[]>(() => (still ? allDone() : allIdle()));
  const [dipped, setDipped] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (still) return undefined;

    let alive = true;
    const after = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(() => alive && fn(), ms));
    };

    /** One row: spinner, then resolve, then hand on to the next. */
    const step = (i: number) => {
      if (!alive) return;
      if (i >= ROWS.length) {
        after(HOLD_MS, () => {
          setDipped(true);
          after(DIP_MS, () => {
            setPhases(allIdle());
            setDipped(false);
            after(DIP_MS, () => step(0));
          });
        });
        return;
      }
      setPhases((prev) => prev.map((p, j) => (j === i ? "connecting" : p)));
      after(CONNECTING_MS, () => {
        setPhases((prev) => prev.map((p, j) => (j === i ? "connected" : p)));
        after(SETTLE_MS, () => step(i + 1));
      });
    };

    step(0);
    return () => {
      alive = false;
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [still]);

  const done = phases.filter((p) => p === "connected").length;

  return (
    <div className={`${styles.panel} ${dipped ? styles.dipped : ""}`}>
      <div className={styles.head}>
        <span className={styles.headLabel}>Integrations</span>
        <span className={styles.headCount}>
          <span className={styles.headCountNum}>{done}</span> of {ROWS.length} live
        </span>
      </div>

      <ul className={styles.rows}>
        {ROWS.map((row, i) => {
          const phase = phases[i];
          return (
            <li
              className={`${styles.row} ${phase === "connected" ? styles.rowDone : ""} ${
                phase === "connecting" ? styles.rowBusy : ""
              }`}
              key={row.id}
            >
              <span className={styles.icon} aria-hidden="true">
                <svg viewBox="0 0 20 20" focusable="false">
                  {row.glyph}
                </svg>
              </span>

              <span className={styles.text}>
                <span className={styles.name}>{row.name}</span>
                <span className={styles.note}>{row.note}</span>
              </span>

              {/* Two stacked layers, opacity only — see the note at the top of this
                  file for why this is not one pill changing colour. */}
              <span className={styles.pill}>
                <span className={`${styles.face} ${styles.faceIdle}`}>
                  <span className={styles.slot}>
                    <Spinner />
                  </span>
                  {row.idle}
                </span>
                <span className={`${styles.face} ${styles.faceDone}`}>
                  <span className={styles.slot}>
                    <Check />
                  </span>
                  {row.done}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default IntegrationRows;
