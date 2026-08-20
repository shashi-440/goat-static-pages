import { useEffect, useRef, useState } from "react";
import styles from "./CopilotDock.module.scss";
// Same mark the Live chat row uses. See the note on that import for why it is an asset and not
// the JSX component amber-user-website keeps it as.
import copilotMark from "../../assets/amber-copilot.svg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * The amber Copilot input, docked on the hero photo.
 *
 * ── Ported, not invented ────────────────────────────────────────────────────
 * Structure and metrics are amber-user-website's `CopilotContextualInput`: a 1px gradient ring
 * (#ffab00 → #ff5771 → #ff33b1 at 135°) around a 48px white pill, the Copilot mark at 20px on the
 * left, the field, and a 34px round send button that fills to #1f2a37 once there is something to
 * send. Everything here that looks like a specific number is from that component.
 *
 * ── What it does NOT do ─────────────────────────────────────────────────────
 * ⚠️ THIS IS NOT WIRED TO COPILOT. There is no chat service in this sandbox, so submitting does
 * nothing at all — no navigation, no request, no console noise. It is a docked input that looks and
 * behaves exactly like the real one right up to the point of sending.
 *
 * The real component hands its query to the chatbot's open-with-message flow. When this page gets a
 * live Copilot, `onSubmit` is the one place to change, and `SUGGESTIONS` should follow whatever the
 * live prompts become.
 */

/**
 * The rotating placeholder, typed out a character at a time.
 *
 * Contact-page questions rather than the search-page ones the original cycles — a reader who has
 * arrived here is asking about their own booking, not browsing.
 */
const SUGGESTIONS = [
  "Can I change my move-in date?",
  "When is my deposit refunded?",
  "What documents do I need?",
  "Is my booking confirmed?",
];

/** Milliseconds per character while typing, and while deleting. */
const TYPE_MS = 55;
const DELETE_MS = 28;
/** How long a finished suggestion sits before it starts deleting. */
const HOLD_MS = 1800;

const CopilotDock = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  /** The suggestion text as typed so far. */
  const [typed, setTyped] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * The typing loop.
   *
   * A chain of one-shot timeouts rather than an interval, because the delay changes between
   * phases — typing is slower than deleting, and the hold at the end of a phrase is neither. An
   * interval would need its own state machine to vary that and would drift against it.
   *
   * It stops entirely while the field is focused or has content: the animation is a placeholder,
   * and a placeholder that keeps typing under someone's cursor is just noise competing with them.
   */
  useEffect(() => {
    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isFocused || query || still) {
      if (timer.current) clearTimeout(timer.current);
      // Reduced motion still gets a prompt, just a stationary one.
      if (still && !query) setTyped(SUGGESTIONS[0]);
      return undefined;
    }

    let phrase = 0;
    let chars = 0;
    let deleting = false;
    let cancelled = false;

    const step = () => {
      if (cancelled) return;
      const full = SUGGESTIONS[phrase];

      if (!deleting) {
        chars += 1;
        setTyped(full.slice(0, chars));
        if (chars === full.length) {
          deleting = true;
          timer.current = setTimeout(step, HOLD_MS);
          return;
        }
        timer.current = setTimeout(step, TYPE_MS);
        return;
      }

      chars -= 1;
      setTyped(full.slice(0, chars));
      if (chars === 0) {
        deleting = false;
        phrase = (phrase + 1) % SUGGESTIONS.length;
      }
      timer.current = setTimeout(step, DELETE_MS);
    };

    timer.current = setTimeout(step, TYPE_MS);
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [isFocused, query]);

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        // Nothing to submit to — see the warning at the top. Prevented rather than left alone so
        // the page does not reload and silently throw the query away.
        e.preventDefault();
      }}
    >
      <div className={styles.ring}>
        <div className={styles.inner}>
          <span className={styles.icon}>
            <img src={copilotMark} alt="" width="20" height="20" />
          </span>

          <div className={styles.field}>
            <input
              type="text"
              className={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              aria-label="Ask amber Copilot"
            />
            {/* Rendered as our own element rather than the input's `placeholder` attribute, which
                cannot hold a blinking caret — and which would announce the whole rotating string
                to a screen reader as if it were the field's label. The real label is on the input;
                this is decorative. */}
            {!query ? (
              <span className={styles.placeholder} aria-hidden="true">
                {isFocused ? (
                  "Ask anything..."
                ) : (
                  <>
                    {typed}
                    <span className={styles.caret} />
                  </>
                )}
              </span>
            ) : null}
          </div>

          <button
            type="submit"
            className={`${styles.send} ${query.trim() ? styles.sendActive : ""}`}
            aria-label="Ask amber Copilot"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 11h12.17l-5.59-5.59L12 4l8 8-8 8-1.41-1.41L16.17 13H4z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
};

export default wrapperHOC(CopilotDock, {
  componentName: "CopilotDock-ContactUsV2Card",
  showForChina: true,
});
