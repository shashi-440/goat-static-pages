import { CSSProperties, useEffect, useRef, useState } from "react";
// PLACEHOLDER ART — the page's own winner photos stand in for the face cluster.
// Any square-ish image drops in.
import face1 from "../../assets/winner-1.jpg";
import face2 from "../../assets/winner-2.jpg";
import face3 from "../../assets/winner-3.jpg";
import InlineLottie from "../InlineLottie/InlineLottie";
import fastMessage from "../../assets/lottie/fast-message.json";
import styles from "./Manifesto.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * PLACEHOLDER COPY — the shape is the point; swap the words freely.
 *
 * Written as segments rather than one string so art can sit between them. A string
 * becomes words; an object becomes an inline chip. Both are laid out as one run of
 * tokens, so a chip brightens on scroll exactly like the words around it rather
 * than being a static image the text flows past.
 */
const CONTENT: Array<string | { chip: "faces" | "tile" }> = [
  "Ambition doesn’t wait for permission. Neither should funding. amberscholar exists because the students",
  { chip: "faces" },
  "who move things forward are too often stopped by the cost of getting there. We back the ones building,",
  { chip: "tile" },
  "competing, creating and questioning — whatever they’re chasing, wherever they’re from. No essays about hardship. No hoops. Just the work you’re already doing.",
];

const FACES = [face1, face2, face3];

type Token = { kind: "word"; value: string } | { kind: "chip"; value: "faces" | "tile" };

/**
 * Flattened once at module scope — the content never changes at runtime. Typed
 * explicitly because flatMap widens a union of two array shapes to unknown[].
 */
const TOKENS: Token[] = CONTENT.flatMap<Token>((part) =>
  typeof part === "string"
    ? part.split(" ").map((word) => ({ kind: "word" as const, value: word }))
    : [{ kind: "chip" as const, value: part.chip }],
);

/**
 * How many tokens the brightening edge is spread across. 1 would switch each word on
 * like a light; this softens it into a gradient that moves through the sentence.
 */
const RAMP = 3;

/**
 * Where the animated mark sits in the token run. The loop starts when the
 * brightening edge reaches this index — so it begins the moment the mark lights up,
 * not while it's still dim further down the passage.
 */
const MARK_INDEX = TOKENS.findIndex((t) => t.kind === "chip" && t.value === "tile");

/** Same idea for the face cluster, which fans open when the edge reaches it. */
const FACES_INDEX = TOKENS.findIndex((t) => t.kind === "chip" && t.value === "faces");

/**
 * Scroll-read manifesto.
 *
 * The text is pinned in the middle of a tall section and its words brighten from
 * dim to full as you scroll — so reading and scrolling are the same gesture.
 *
 * Only opacity animates, which is the whole trick: it never touches layout or
 * paint, so the effect can't jank no matter how long the passage is. That's the
 * same restraint reboot.studio uses, applied per token rather than per element.
 *
 * The per-frame work is one CSS custom property on the paragraph. Each token derives
 * its own opacity from that in CSS, so scrolling writes a single value rather than
 * touching sixty spans:
 *
 *   opacity = clamp(DIM, DIM + (--lit − --i) × step, 1)
 *
 * `--lit` defaults high in the stylesheet, so with JS disabled or before hydration
 * the passage is fully legible rather than a wall of near-invisible text.
 */
const Manifesto = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  // Whether the reading edge has reached the animated mark / the face cluster.
  const [markLit, setMarkLit] = useState(false);
  const [facesOpen, setFacesOpen] = useState(false);
  // Mirror the state so the scroll handler can compare without reading state, and
  // only call setState on an actual transition — a handful of times across the
  // section's whole travel, rather than every frame.
  const markLitRef = useRef(false);
  const facesOpenRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    if (!section || !text) return undefined;

    // Reduced motion: hand over the finished state, no scroll tracking. The mark
    // stays parked too — InlineLottie ignores `play` under reduced motion.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      text.style.setProperty("--lit", String(TOKENS.length + RAMP));
      // Hand over the finished arrangement too, rather than leaving the cluster
      // collapsed on a single face forever.
      setFacesOpen(true);
      return undefined;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      // The sticky child is one viewport tall, so the section's own scroll travel is
      // whatever height it has beyond that.
      const travel = section.offsetHeight - window.innerHeight;
      if (travel <= 0) return;
      const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / travel));
      // Overshoot by RAMP so the final token finishes brightening before the section
      // lets go, rather than still ramping as it leaves.
      const lit = progress * (TOKENS.length + RAMP);
      text.style.setProperty("--lit", lit.toFixed(2));

      const reachedMark = lit >= MARK_INDEX;
      if (reachedMark !== markLitRef.current) {
        markLitRef.current = reachedMark;
        setMarkLit(reachedMark);
      }

      const reachedFaces = lit >= FACES_INDEX;
      if (reachedFaces !== facesOpenRef.current) {
        facesOpenRef.current = reachedFaces;
        setFacesOpen(reachedFaces);
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} data-nav-theme="dark">
      <div className={styles.sticky}>
        <p ref={textRef} className={styles.text}>
          {TOKENS.map((token, index) =>
            token.kind === "word" ? (
              <span
                // Words repeat, so the index is the only stable key here.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={`${styles.tok} ${styles.word}`}
                style={{ "--i": index } as CSSProperties}
              >
                {token.value}{" "}
              </span>
            ) : (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={`${styles.tok} ${styles.chip}`}
                style={{ "--i": index } as CSSProperties}
                // Decorative: the sentence reads the same without them.
                aria-hidden="true"
              >
                {token.value === "faces" ? (
                  <span className={`${styles.faces} ${facesOpen ? styles.facesOpen : ""}`}>
                    {FACES.map((face, faceIndex) => (
                      <img
                        key={face}
                        className={styles.face}
                        // Its own position in the stack, so each can be tucked
                        // behind the first by exactly its own offset.
                        style={{ "--n": faceIndex } as CSSProperties}
                        src={face}
                        alt=""
                      />
                    ))}
                  </span>
                ) : (
                  // autoPlay off: this sits well below the fold, so an intro play
                  // would run unseen. It parks on its finished frame and replays on
                  // hover.
                  <InlineLottie
                    data={fastMessage}
                    size={40}
                    scale={2.1}
                    loop
                    // Controlled: starts looping when the reading edge arrives, and
                    // parks again if you scroll back above it.
                    play={markLit}
                  />
                )}
              </span>
            ),
          )}
        </p>
      </div>
    </section>
  );
};

export default wrapperHOC(Manifesto, {
  componentName: "Manifesto-ScholarshipV2",
  showForChina: true,
});
