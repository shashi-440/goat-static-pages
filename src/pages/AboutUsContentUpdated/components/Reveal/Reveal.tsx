import { useEffect, useRef, useState } from "react";
import styles from "./Reveal.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger delay in ms — used to make siblings appear one-by-one. */
  delay?: number;
  /** Optional extra className on the wrapper. */
  className?: string;
  /** Render as this element (default div). */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Fade + rise-up scroll reveal. Animates once when the element first scrolls
 * into view, then stays visible (no replay on scroll-up). SSR-safe: renders in
 * the hidden state and reveals after hydration + intersection.
 */
const Reveal = ({ children, delay = 0, className = "", as = "div" }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const Tag = as as any;

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // Respect reduced-motion: show immediately, skip the animation.
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect(); // once, then stay
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.isVisible : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
};

export default wrapperHOC(Reveal, {
  componentName: "Reveal-AboutUsContentUpdated",
  showForChina: true,
});
