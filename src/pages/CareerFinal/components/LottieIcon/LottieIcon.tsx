import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import styles from "./LottieIcon.module.scss";

export interface LottieIconHandle {
  /** Restart the animation from frame 0 and play it once. */
  replay: () => void;
}

interface LottieIconProps {
  /** Imported Lottie JSON (animation data). */
  animationData: any;
  /** Square edge in px — matches the static icons it replaces. */
  size?: number;
  /** Play once as soon as this turns true (used for the staggered scroll-in). */
  play?: boolean;
}

/**
 * Renders a Lottie animation at icon scale, played on demand rather than looping.
 *
 * The animation runs once when `play` flips true (the card's scroll-in) and then
 * holds its final frame. `replay()` via ref plays it again — CoreValues calls
 * that on section hover.
 *
 * lottie-web is imported dynamically inside an effect so it never runs during SSR
 * (it reaches for `document` on load) and never lands in the server bundle.
 * Honours prefers-reduced-motion by rendering the last frame statically.
 */
const LottieIcon = forwardRef<LottieIconHandle, LottieIconProps>(
  ({ animationData, size = 32, play = false }, ref) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<any>(null);
    const reduceRef = useRef(false);
    // Whether the intro has already been fired, so it only plays once.
    const playedRef = useRef(false);

    useImperativeHandle(ref, () => ({
      replay: () => {
        if (!animRef.current || reduceRef.current) return;
        animRef.current.goToAndPlay(0, true);
      },
    }));

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return undefined;

      let cancelled = false;

      reduceRef.current = !!(
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );

      import("lottie-web").then(({ default: lottie }) => {
        if (cancelled || !hostRef.current) return;

        const anim = lottie.loadAnimation({
          container: hostRef.current,
          renderer: "svg",
          loop: false,
          autoplay: false,
          animationData,
        });
        animRef.current = anim;

        // Render the settled icon straight away so nothing is missing before the
        // intro fires (and permanently, under reduced motion).
        anim.addEventListener("DOMLoaded", () => {
          if (cancelled) return;
          anim.goToAndStop(anim.totalFrames - 1, true);
        });
      });

      return () => {
        cancelled = true;
        animRef.current?.destroy();
        animRef.current = null;
      };
    }, [animationData]);

    // Fire the one-shot intro when the card scrolls in.
    useEffect(() => {
      if (!play || playedRef.current || reduceRef.current) return;
      const anim = animRef.current;
      if (!anim) return;
      playedRef.current = true;
      anim.goToAndPlay(0, true);
    }, [play]);

    return (
      <div
        ref={hostRef}
        className={styles.icon}
        style={{ height: size, width: size }}
        aria-hidden="true"
      />
    );
  },
);

LottieIcon.displayName = "LottieIcon";

export default LottieIcon;
