import { useEffect, useRef, useState } from "react";
import wrapperHOC from "@Utils/wrapperHOC";
import styles from "./ScrollText.module.scss";

interface ScrollTextProps {
  /** The passage to reveal. Split on whitespace, so punctuation rides along. */
  text: string;
  className?: string;
  /** Render as this element (default p). */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Scroll-linked read-along: each word eases from faint to full colour as the
 * block travels up the viewport, so the passage appears to be "read" by the
 * scroll itself.
 *
 * Progress is 0 while the block sits at the bottom of the viewport and 1 once it
 * has risen past the upper third — the window where a reader is actually looking
 * at it. Words interpolate across that range with a short overlap so adjacent
 * words cross-fade rather than snapping on one at a time.
 *
 * SSR-safe: renders every word at full opacity so the copy is always present and
 * crawlable, then hands over to the scroll handler once mounted.
 */
const ScrollText = ({ text, className = "", as = "p" }: ScrollTextProps) => {
  const ref = useRef<HTMLElement>(null);
  // Starts fully read so SSR (and a JS-disabled client) always paints the whole
  // passage at full colour. 2 rather than 1: a word's ramp is `fade` wide and
  // the last one starts at `1 - fade`, so progress must exceed 1 to light it.
  const [progress, setProgress] = useState(2);
  const Tag = as as any;

  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(2); // fully lit, no scroll ramp
      return undefined;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      // Track the block's own top as it rises: progress 0 when it sits at ~80%
      // down the viewport, 1 by the time it reaches ~22%. Measuring the top
      // alone (rather than top-to-bottom travel) means the ramp completes while
      // the whole quote is still comfortably on screen — reading it, not
      // watching it leave.
      const start = vh * 0.8;
      const end = vh * 0.22;
      const travelled = start - rect.top;
      setProgress(Math.min(1, Math.max(0, travelled / (start - end))));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Each word fades across a window OVERLAP words wide, so neighbours
  // cross-fade instead of snapping on one at a time. Word starts are spread
  // over 0→1 such that the LAST word finishes exactly at progress 1 — without
  // this the tail of the passage would never reach full colour.
  const OVERLAP = 3;
  const fade = OVERLAP / (words.length + OVERLAP - 1);
  const step = words.length > 1 ? (1 - fade) / (words.length - 1) : 0;

  return (
    <Tag ref={ref} className={`${styles.text} ${className}`}>
      {words.map((word, i) => {
        const lit = Math.min(1, Math.max(0, (progress - i * step) / fade));
        return (
          <span key={`${word}-${i}`} className={styles.word} style={{ "--lit": lit } as any}>
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </Tag>
  );
};

export default wrapperHOC(ScrollText, {
  componentName: "ScrollText-CareerFinal",
  showForChina: true,
});
