import { CSSProperties, useEffect, useRef, useState } from "react";
import styles from "./InlineLottie.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

interface InlineLottieProps {
  /** Parsed Lottie JSON — imported from ../../assets/lottie. */
  data: unknown;
  /**
   * The element's layout box in px — what the line reserves for it.
   */
  size: number;
  /**
   * Visual magnification of the artwork, applied as a transform so it costs no
   * layout. Lottie comps are often mostly empty canvas: this one's ink fills 44% of
   * its 350 square, so at 1× it renders far smaller than its box implies. Scaling
   * here rather than growing `size` keeps the line box from stretching.
   */
  scale?: number;
  /** Delay before the one-shot plays, so it can land with the copy around it. */
  delay?: number;
  /**
   * Whether to play once on mount. Off for marks that sit below the fold — the
   * animation would run unseen; they park on the finished frame and wait for hover.
   */
  autoPlay?: boolean;
  /** Run continuously rather than as a one-shot. */
  loop?: boolean;
  /**
   * Controlled play state. Leave undefined for the uncontrolled behaviour above;
   * pass a boolean to drive it from outside — used to start a looping mark at the
   * moment the scroll reaches it, rather than while it's still off screen.
   */
  play?: boolean;
}

/**
 * A Lottie that sits inside a line of text.
 *
 * Deliberately not CareerV2's LottieIcon, which is otherwise the same idea: that
 * one hosts the animation in a <div>, and a <div> inside an <h1> is invalid — a
 * heading takes phrasing content only. This hosts it in a <span> so it can live in
 * the headline legitimately.
 *
 * Plays once shortly after mount, then holds its last frame; hovering it replays.
 * lottie-web is dynamically imported: it's ~250KB and client-only, so it stays out
 * of the page chunk and out of the server bundle.
 */
const InlineLottie = ({
  data,
  size,
  scale = 1,
  delay = 0,
  autoPlay = true,
  loop = false,
  play,
}: InlineLottieProps) => {
  const hostRef = useRef<HTMLSpanElement>(null);
  const animRef = useRef<any>(null);
  const reducedRef = useRef(false);
  // Flips once the animation exists, so the control effect below re-runs for a
  // `play` that turned true while lottie-web was still loading.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let cancelled = false;
    let timer = 0;
    let anim: any = null;

    const reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = reduced;
    // Replay from the top on hover. Skipped where there's no real pointer, since a
    // touch device would fire this on tap and the mark isn't interactive.
    const canHover = !!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
    const onEnter = () => anim?.goToAndPlay(0, true);

    import("lottie-web").then((mod) => {
      const lottie: any = (mod as any).default ?? mod;
      if (cancelled || !hostRef.current) return;

      anim = lottie.loadAnimation({
        container: hostRef.current,
        renderer: "svg",
        loop,
        autoplay: false,
        animationData: data,
      });
      animRef.current = anim;

      // Park on the finished frame the moment it loads, so the line never has a
      // hole in it while the animation waits — and so reduced-motion users get the
      // settled artwork permanently.
      anim.addEventListener("DOMLoaded", () => {
        if (cancelled) return;
        anim.goToAndStop(anim.totalFrames - 1, true);
        setReady(true);
        if (reduced) return;
        if (canHover) host.addEventListener("pointerenter", onEnter);
        // A controlled mark waits for `play`; only uncontrolled ones self-start.
        if (play !== undefined || !autoPlay) return;
        timer = window.setTimeout(() => {
          if (!cancelled) anim.goToAndPlay(0, true);
        }, delay);
      });
    });

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      host.removeEventListener("pointerenter", onEnter);
      anim?.destroy();
      animRef.current = null;
    };
    // `play` is deliberately absent: it's handled by the control effect below, and
    // including it here would tear down and rebuild the animation on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, delay, autoPlay, loop]);

  // Controlled start/stop. Runs on `ready` too, so a `play` that turned true during
  // the dynamic import isn't missed.
  useEffect(() => {
    const anim = animRef.current;
    if (!ready || !anim || play === undefined || reducedRef.current) return;
    if (play) {
      anim.goToAndPlay(0, true);
    } else {
      anim.goToAndStop(anim.totalFrames - 1, true);
    }
  }, [play, ready]);

  return (
    <span
      ref={hostRef}
      className={styles.host}
      style={{ height: size, width: size, "--scale": scale } as CSSProperties}
      aria-hidden="true"
    />
  );
};

export default wrapperHOC(InlineLottie, {
  componentName: "InlineLottie-ScholarshipV2",
  showForChina: true,
});
