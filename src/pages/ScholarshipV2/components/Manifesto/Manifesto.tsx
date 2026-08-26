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
 * Written as segments rather than one string so art can sit between them. A string
 * becomes words; `{ chip }` becomes an inline chip; `{ br: true }` becomes a line
 * break. All of it is laid out as one run of tokens, so a chip brightens on scroll
 * exactly like the words around it rather than being a static image the text flows
 * past.
 */
type Segment = string | { chip: "faces" | "tile" } | { br: true };

/**
 * ONE passage, read straight through in a single pinned frame.
 *
 * It was TWO, handed over mid-section: the first brightened in, held, then un-lit word by
 * word as the second rose into its place. That machinery is gone — the two are now one run
 * of tokens on one timeline, so the reading never stops and restarts.
 *
 * ⚠️  Worth knowing what went with it, because it was the fiddliest part of this file: a
 * `HOLD` beat, an `ERASE` sweep with its own `--out` edge on every token, an `OVERLAP` so
 * the screen was never blank, a `DRIFT` transform for the exiting and arriving paragraphs,
 * and per-passage clocks so each inline mark could be tested against its own reading
 * position rather than the global one. One passage needs none of it: one `--lit`, one clock.
 *
 * The authored breaks are what carry the structure now — four sentences as four stanzas,
 * each a complete thought. Left to wrap on their own they run together into one centred
 * slab and the "that's why" turn in the middle is lost.
 */
const SEGMENTS: Segment[] = [
  // The face cluster sits BEFORE "dreamers", so the faces read as the subject the word then
  // names rather than as a trailing decoration after it.
  "amberscholar 2026 is for students and",
  { chip: "faces" },
  "dreamers who have the hunger to make something happen.",
  { br: true },
  "At amber, we don’t just accommodate students. We make room for their dreams too.",
  { br: true },
  "That’s why we created the amber Dream Fund, it’s to back students with big goals, bold ideas, and dreams they truly believe in.",
  { br: true },
  "If there’s something you’ve always wanted to build, create, achieve, or take further,",
  { chip: "tile" },
  "this is your chance to make it real.",
];

const FACE_PHOTOS = [face1, face2, face3];

type Token =
  | { kind: "word"; value: string }
  | { kind: "chip"; value: "faces" | "tile" }
  | { kind: "break" };

/**
 * Flattened once at module scope — the content never changes at runtime. Typed
 * explicitly because flatMap widens a union of segment shapes to unknown[].
 */
const tokenise = (segments: Segment[]): Token[] =>
  segments.flatMap<Token>((part) => {
    if (typeof part === "string") {
      return part.split(" ").map((word) => ({ kind: "word" as const, value: word }));
    }
    if ("br" in part) return [{ kind: "break" as const }];
    return [{ kind: "chip" as const, value: part.chip }];
  });

const TOKENS = tokenise(SEGMENTS);

/** How many words the brightening edge is spread over. */
const RAMP = 3;

/**
 * The whole section's scroll, measured in TOKEN UNITS rather than pixels or fractions.
 *
 * One unit is one word of reading, so the pace stays identical whatever the passage's
 * length and whatever the section's height. Changing the copy changes the section's travel
 * automatically instead of needing the vh re-tuned by hand.
 */
/** A little travel past the final word, so the section does not release mid-ramp. */
const TAIL = 4;

const TOTAL = TOKENS.length + RAMP + TAIL;

/**
 * Scroll travel allotted per token unit, in vh — the reading pace, and the one number here
 * that was tuned by feel rather than derived.
 *
 * The section's height comes FROM this rather than being a hand-picked `vh` in the
 * stylesheet, which is what makes the copy safe to edit: rewrite a passage and the travel
 * follows it, instead of the reveal finishing early or running on past the end until
 * somebody notices and re-tunes the number — the manual step this removes.
 *
 * Rendered as an inline style, so the server emits the same height the client computes and
 * there is no shift on hydration.
 */
const VH_PER_UNIT = 2.5;
/** Plus one viewport for the sticky child itself, which contributes no travel. */
const SECTION_VH = Math.round(100 + TOTAL * VH_PER_UNIT);

/**
 * Where each inline mark sits in the run.
 *
 * A plain index again. While there were two passages this had to carry WHICH passage too,
 * because the second's clock did not start until the handover and testing its mark against
 * the global cursor lit it before the passage had appeared. One clock, one index.
 */
const chipAt = (chip: "faces" | "tile") => {
  const index = TOKENS.findIndex((t) => t.kind === "chip" && t.value === chip);
  return index === -1 ? Infinity : index;
};

/** The loop starts when the brightening edge reaches the mark, not while it is still dim. */
const MARK = chipAt("tile");
/** Same idea for the face cluster, which fans open when the edge reaches it. */
const FACES = chipAt("faces");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Scroll-read manifesto, in one passage.
 *
 * The text is pinned in the middle of a tall section and its words brighten from dim
 * to full as you scroll — so reading and scrolling are the same gesture.
 *
 * Only OPACITY animates, which is the whole trick: it never touches layout or paint,
 * so the effect cannot jank however long the passages are.
 *
 * Each token derives its own opacity from its passage's `--lit` in CSS, so scrolling
 * writes one property per passage rather than touching a hundred and thirty spans:
 *
 *   opacity = clamp(DIM, DIM + (--lit − --i) × step, 1)
 *
 * ── What the frame loop deliberately does NOT do ────────────────────────────
 * It never reads layout. `offsetHeight` and `getBoundingClientRect()` were both read
 * every frame, straight after writing custom properties to the paragraphs — a
 * read-after-write, which forces the browser to flush style and layout synchronously
 * before it can answer. Sixty forced layouts a second over 130 spans is exactly the
 * kind of thing that feels "not smooth" while looking correct in every screenshot.
 * The geometry is measured once and re-measured only on resize and load.
 *
 * `--lit` defaults high in the stylesheet, so with JS disabled or before hydration the
 * passage is fully legible rather than a wall of near-invisible text.
 */
const Manifesto = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
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

    // Reduced motion: hand over the finished state, no scroll tracking. The stylesheet
    // unpins the section under the same query. The mark stays parked too — InlineLottie
    // ignores `play` under reduced motion.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      text.style.setProperty("--lit", String(TOKENS.length + RAMP));
      // Hand over the finished arrangement too, rather than leaving the cluster collapsed
      // on a single face forever.
      setFacesOpen(true);
      return undefined;
    }

    // Geometry, measured OUTSIDE the frame loop. `offsetHeight` forces layout, so it
    // cannot be read on a frame that also writes styles.
    let sectionTop = 0;
    let travel = 0;
    const measure = () => {
      sectionTop = section.getBoundingClientRect().top + window.scrollY;
      // The sticky child is one viewport tall, so the section's own scroll travel is
      // whatever height it has beyond that.
      travel = section.offsetHeight - window.innerHeight;
    };

    // Last value written, so a frame that changes nothing writes nothing. Scrolling fires
    // far more often than the rounded value actually moves.
    let lastLit = NaN;

    let raf = 0;
    const update = () => {
      raf = 0;
      if (travel <= 0) return;
      // From cached geometry and `scrollY` alone — no layout read.
      const progress = clamp01((window.scrollY - sectionTop) / travel);
      // Scroll position expressed in token units, which is what every constant above is
      // measured in. One passage, so this is the reading position outright — there is no
      // second clock to offset any more.
      const at = progress * TOTAL;

      const lit = Math.round(at * 100) / 100;
      if (lit !== lastLit) {
        lastLit = lit;
        text.style.setProperty("--lit", lit.toFixed(2));
      }

      const reachedMark = at >= MARK;
      if (reachedMark !== markLitRef.current) {
        markLitRef.current = reachedMark;
        setMarkLit(reachedMark);
      }

      const reachedFaces = at >= FACES;
      if (reachedFaces !== facesOpenRef.current) {
        facesOpenRef.current = reachedFaces;
        setFacesOpen(reachedFaces);
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Anything loading above this section moves it, and `sectionTop` is cached.
    window.addEventListener("load", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      style={{ minHeight: `${SECTION_VH}vh` }}
      data-nav-theme="dark"
    >
      <div className={styles.sticky}>
        <p ref={textRef} className={styles.text}>
          {TOKENS.map((token, index) => {
            if (token.kind === "break") {
              // eslint-disable-next-line react/no-array-index-key
              return <span className={styles.break} key={index} />;
            }
            if (token.kind === "word") {
              return (
                <span
                  // Words repeat, so the index is the only stable key here.
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className={`${styles.tok} ${styles.word}`}
                  style={{ "--i": index } as CSSProperties}
                >
                  {token.value}{" "}
                </span>
              );
            }
            return (
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
                    {FACE_PHOTOS.map((face, faceIndex) => (
                      <img
                        key={face}
                        className={styles.face}
                        // Its own position in the stack, so each can be tucked behind the
                        // first by exactly its own offset.
                        style={{ "--n": faceIndex } as CSSProperties}
                        src={face}
                        alt=""
                      />
                    ))}
                  </span>
                ) : (
                  // autoPlay off: this sits well below the fold, so an intro play would run
                  // unseen. It parks on its finished frame and replays on hover.
                  <InlineLottie
                    data={fastMessage}
                    size={40}
                    scale={2.1}
                    loop
                    // Controlled: starts looping when the reading edge arrives, and parks
                    // again if you scroll back above it.
                    play={markLit}
                  />
                )}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
};

export default wrapperHOC(Manifesto, {
  componentName: "Manifesto-ScholarshipV2",
  showForChina: true,
});
