import { useEffect, useState } from "react";
import AmberCopilotLogo from "@Icons/AmberCopilotLogo";
import ChatbotArrow from "@Icons/ChatbotArrow";
import styles from "./CopilotInput.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

// Contact-page prompts, cycled by the typewriter.
const PROMPTS = [
  "Ask Copilot how to reach support…",
  "Ask Copilot about a booking or payment…",
  "Ask Copilot which channel replies fastest…",
  "Ask Copilot to connect me with the team…",
];

// Typewriter timings (ms).
const TYPE_MS = 45; // per character, typing out
const DELETE_MS = 25; // per character, deleting
const HOLD_MS = 1800; // pause on the finished phrase
const NEXT_MS = 350; // pause on empty, before the next phrase

type Phase = "typing" | "holding" | "deleting";

interface CopilotInputProps {
  /** Rotating prompts shown by the typewriter while the field is idle. */
  prompts?: string[];
}

/**
 * Pill-shaped Copilot ask field (Figma node 2047:947), docked bottom-centre of
 * the page. A soft #FEE9EF halo sits behind the white pill, which carries the
 * amber-red 200 border and the 2xl drop shadow from the design.
 *
 * The prompt is a typewriter that cycles through PROMPTS. It's rendered as a
 * ghost overlay rather than the native `placeholder` so it can carry a blinking
 * caret. SSR renders the first prompt fully typed, so there's no flash of empty
 * field before hydration and no markup mismatch. The animation pauses while the
 * field is focused or has a value, and reduced-motion users just get the first
 * prompt, static.
 */
const CopilotInput = ({ prompts = PROMPTS }: CopilotInputProps) => {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const [index, setIndex] = useState(0);
  // Start on the first prompt, fully typed — the state SSR renders.
  const [count, setCount] = useState(prompts[0].length);
  const [phase, setPhase] = useState<Phase>("holding");

  const hasValue = value.trim().length > 0;
  // Idle = nothing typed and not focused. Only then does the prompt animate.
  const idle = !focused && value.length === 0;

  useEffect(() => {
    if (!idle) return undefined;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const current = prompts[index];
    let delay = TYPE_MS;
    let step: () => void;

    if (phase === "typing") {
      if (count < current.length) {
        step = () => setCount(count + 1);
      } else {
        delay = 0;
        step = () => setPhase("holding");
      }
    } else if (phase === "holding") {
      delay = HOLD_MS;
      step = () => setPhase("deleting");
    } else if (count > 0) {
      delay = DELETE_MS;
      step = () => setCount(count - 1);
    } else {
      delay = NEXT_MS;
      step = () => {
        setIndex((prev) => (prev + 1) % prompts.length);
        setPhase("typing");
      };
    }

    const t = window.setTimeout(step, delay);
    return () => window.clearTimeout(t);
  }, [idle, phase, count, index, prompts]);

  return (
    <div className={styles.wrap}>
      {/* Soft halo — the #FEE9EF pill sitting ~6px outside the field. */}
      <span className={styles.halo} aria-hidden="true" />

      <form
        className={styles.field}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <span className={styles.mark} aria-hidden="true">
          <AmberCopilotLogo width={20} height={20} />
        </span>

        <span className={styles.inputWrap}>
          <input
            type="text"
            className={styles.input}
            aria-label="Ask Copilot"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          {/* Ghost prompt + caret. Hidden once the field is in use, so the
              real text caret is never competing with the fake one. */}
          {idle ? (
            <span className={styles.ghost} aria-hidden="true">
              {prompts[index].slice(0, count)}
              <span className={styles.caret} />
            </span>
          ) : null}
        </span>

        <button
          type="submit"
          className={`${styles.submit} ${hasValue ? styles.submitActive : ""}`}
          aria-label="Ask Copilot"
          disabled={!hasValue}
        >
          <ChatbotArrow width="16" height="16" />
        </button>
      </form>
    </div>
  );
};

export default wrapperHOC(CopilotInput, {
  componentName: "CopilotInput-ContactUsV2",
  showForChina: true,
});
