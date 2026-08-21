import { useEffect, useRef, useState } from "react";
import wrapperHOC from "@Utils/wrapperHOC";

interface CountUpProps {
  /** Final number to count up to. */
  target: number;
  /** Text before the number (e.g. ""). */
  prefix?: string;
  /** Text after the number (e.g. " Million+", "+"). */
  suffix?: string;
  /** Animation duration in ms. */
  duration?: number;
  className?: string;
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Counts from 0 up to `target` when it first scrolls into view, then stops.
 * SSR-safe: renders the final value on the server / before hydration so the
 * content is always present, and re-runs the count once visible on the client.
 */
const CountUp = ({
  target,
  prefix = "",
  suffix = "",
  duration = 1600,
  className,
}: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(target); // final value by default (SSR-safe)

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return undefined;
    }

    let raf = 0;
    let start = 0;
    let done = false;

    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(easeOutCubic(progress) * target));
      if (progress < 1) {
        raf = window.requestAnimationFrame(step);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !done) {
            done = true;
            setValue(0);
            raf = window.requestAnimationFrame(step);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
};

export default wrapperHOC(CountUp, {
  componentName: "CountUp-AboutUsContentUpdated",
  showForChina: true,
});
