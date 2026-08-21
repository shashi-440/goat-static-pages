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
 * TWO passages, read one after the other in the same pinned frame: the first
 * brightens in, holds, then crosses out as the second brightens in behind it.
 *
 * They are separate arrays rather than one long one because they do not share a
 * timeline — each gets its own `--lit` and its own fade, and the handover between
 * them is a third thing that belongs to neither. See `TIMELINE` below.
 */
const PASSAGES: Segment[][] = [
  [
    // One line, and much shorter than what was here before. The two inline marks were both
    // buried in that longer passage; the face cluster stays in this one and the animated
    // mark moved into the second rather than being dropped, since both are existing art for
    // this section.
    //
    // The cluster sits BEFORE "dreamers", so the faces read as the subject the word then
    // names rather than as a trailing decoration after it.
    "amberscholar 2026 is for students and",
    { chip: "faces" },
    "dreamers who have the hunger to make something happen.",
  ],
  [
    // Line breaks are authored, not incidental: three sentences set as three stanzas, each
    // one a complete thought. Left to wrap on their own they run together into a single
    // centred slab and the "that's why" turn in the middle is lost.
    "At amber, we don’t just accommodate students. We make room for their dreams too.",
    { br: true },
    "That’s why we created the amber Dream Fund, it’s to back students with big goals, bold ideas, and dreams they truly believe in.",
    { br: true },
    "If there’s something you’ve always wanted to build, create, achieve, or take further,",
    { chip: "tile" },
    "this is your chance to make it real.",
  ],
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

const TOKENS = PASSAGES.map(tokenise);

/** How many words the brightening edge is spread over. */
const RAMP = 3;

/**
 * The whole section's scroll, measured in TOKEN UNITS rather than pixels or
 * fractions.
 *
 * One unit is one word of reading. Everything else — how long the first passage
 * holds once it is fully lit, how long the crossfade takes — is expressed in the same
 * unit, so the reading pace stays identical whatever the passages' lengths and
 * whatever the section's height. Changing the copy changes the section's travel
 * automatically instead of needing the vh re-tuned by hand.
 *
 * `HOLD` is the beat where the first passage sits complete and unmoving. Without it
 * the last word brightens and the passage immediately starts dissolving, so the one
 * moment the reader has the whole thought in front of them never happens.
 */
const HOLD = 9;
/**
 * Units over which the first passage is ERASED, word by word.
 *
 * It is not a cross-fade any more. Fading one paragraph out while fading the other in put
 * a two-line slab and an eight-line slab on screen together, both half-present — which
 * reads as a glitch whatever duration you give it, because the two are nothing like the
 * same shape. Instead the first passage un-lights in the same direction it lit, so the
 * screen is only ever clearing or filling.
 *
 * Faster than the reading: 9 units to clear what took 19 to light. It is being cleared to
 * make room, not re-read.
 */
const ERASE = 9;

/**
 * How much the second passage's arrival overlaps the first's erase, in units.
 *
 * Non-zero so the screen is never entirely empty — the last words of the first passage are
 * still going as the first words of the second come up. Small, because the overlap is the
 * one moment both passages exist and the whole point of erasing was to keep that short.
 */
const OVERLAP = 3;

/**
 * How far each passage drifts vertically through the handover, in px.
 *
 * The exiting one lifts away and the arriving one rises into its place, both travelling the
 * same direction so the handover reads as one gesture. 44px, not the 22 first tried: the
 * two passages differ in height by nearly 400px, and against that a 22px move did not
 * register as movement at all — it just looked like a fade. Transform on the paragraph, so
 * it composites and costs nothing per frame.
 */
const DRIFT = 44;
/** A little travel past the final word, so the section does not release mid-ramp. */
const TAIL = 4;

const FIRST_END = TOKENS[0].length + RAMP;
const SECOND_START = FIRST_END + HOLD;
/** Where the erase begins, and where the second passage picks up. */
const ERASE_START = SECOND_START;
const ERASE_END = ERASE_START + ERASE;
const SECOND_READ = ERASE_END - OVERLAP;
const TOTAL = SECOND_READ + TOKENS[1].length + RAMP + TAIL;
/** The erase edge sweeps from before the first token to past the last one. */
const ERASE_FROM = -RAMP;
const ERASE_TO = TOKENS[0].length + RAMP;

/**
 * Scroll travel allotted per token unit, in vh — the reading pace, and the one number here
 * that was tuned by feel rather than derived.
 *
 * The section's height comes FROM this rather than being a hand-picked `vh` in the
 * stylesheet, which is what makes the copy safe to edit: rewrite a passage and the travel
 * follows it, instead of the reveal finishing early or running on past the end until
 * somebody notices and re-tunes the number. It was 260vh for one passage and had to become
 * 460 for two; that is exactly the manual step this removes.
 *
 * Rendered as an inline style, so the server emits the same height the client computes and
 * there is no shift on hydration.
 */
const VH_PER_UNIT = 2.5;
/** Plus one viewport for the sticky child itself, which contributes no travel. */
const SECTION_VH = Math.round(100 + TOTAL * VH_PER_UNIT);

/**
 * Where each inline mark sits — WHICH passage, and where in that passage's run.
 *
 * Both used to be in the first passage, so a single index was enough. They are now one in
 * each, and a mark's cue has to be compared against its OWN passage's reading position:
 * the second passage's clock does not start until the handover, so testing its mark
 * against the global cursor would light it before the passage had appeared.
 */
const findChip = (chip: "faces" | "tile") => {
  for (let passage = 0; passage < TOKENS.length; passage += 1) {
    const index = TOKENS[passage].findIndex((t) => t.kind === "chip" && t.value === chip);
    if (index !== -1) return { passage, index };
  }
  return { passage: 0, index: Infinity };
};

/** The loop starts when the brightening edge reaches the mark, not while it is still dim. */
const MARK = findChip("tile");
/** Same idea for the face cluster, which fans open when the edge reaches it. */
const FACES = findChip("faces");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Scroll-read manifesto, in two passages.
 *
 * The text is pinned in the middle of a tall section and its words brighten from dim
 * to full as you scroll — so reading and scrolling are the same gesture. When the
 * first passage is finished and has held for a beat, it crosses out and the second
 * arrives in the same frame and reads the same way.
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
 * It also only writes to the passage that is actually on screen. A custom property
 * set on a paragraph invalidates style for its whole subtree, so writing `--lit` to
 * both meant recomputing every span in both passages on every frame to no effect —
 * the hidden one cannot show the result.
 *
 * `--lit` defaults high in the stylesheet, so with JS disabled or before hydration the
 * visible passage is fully legible rather than a wall of near-invisible text.
 */
const Manifesto = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const passageRefs = useRef<Array<HTMLParagraphElement | null>>([]);
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
    const [first, second] = passageRefs.current;
    if (!section || !first || !second) return undefined;

    // Reduced motion: hand over the finished state, no scroll tracking. Both passages
    // are laid out as ordinary stacked paragraphs by the stylesheet under the same
    // query, so nothing is hidden behind anything. The mark stays parked too —
    // InlineLottie ignores `play` under reduced motion.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      [first, second].forEach((el, i) => {
        el.style.setProperty("--lit", String(TOKENS[i].length + RAMP));
        el.style.visibility = "visible";
      });
      // No erase either: both passages stay, laid out one under the other by the stylesheet.
      first.style.setProperty("--out", "-9999");
      // Hand over the finished arrangement too, rather than leaving the cluster
      // collapsed on a single face forever.
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

    // Last values written, so a frame that changes nothing writes nothing. Scrolling
    // fires far more often than the rounded values actually move.
    let lastLit = [NaN, NaN];
    let lastFade = [NaN, NaN];
    let lastDrift = [NaN, NaN];
    let lastOut = NaN;

    let raf = 0;
    const update = () => {
      raf = 0;
      if (travel <= 0) return;
      // From cached geometry and `scrollY` alone — no layout read.
      const progress = clamp01((window.scrollY - sectionTop) / travel);
      // Scroll position expressed in token units, which is what every constant above
      // is measured in.
      const at = progress * TOTAL;

      // How far through the erase we are. Drives the first passage's exit — both its
      // word-by-word clearing and its lift.
      const erase = clamp01((at - ERASE_START) / ERASE);
      // The second passage's reading starts near the end of the erase, so its own clock is
      // the global one minus where it begins.
      const lits = [at, at - SECOND_READ];
      // Its arrival is a plain ramp over the overlap: by the time the erase finishes it is
      // fully present, with its opening words already lighting.
      const arrive = clamp01((at - SECOND_READ) / OVERLAP);
      // Neither paragraph cross-fades any more — the words do that. These only decide
      // whether each is present at all, so a hidden one stops taking selection and hits.
      const fades = [erase < 1 ? 1 : 0, arrive > 0 ? 1 : 0];
      const drifts = [-erase * DRIFT, (1 - arrive) * DRIFT];

      [first, second].forEach((el, i) => {
        const fade = fades[i];
        if (fade !== lastFade[i]) {
          lastFade[i] = fade;
          // Stacked in the same box, so whichever is gone has to stop existing for
          // selection and hit-testing — a transparent paragraph still takes pointer events
          // and still joins a text selection dragged across it.
          el.style.visibility = fade ? "visible" : "hidden";
        }
        // Nothing to see, so nothing to compute: skip the subtree invalidation entirely
        // while this passage is not on screen.
        if (!fade) return;

        // The drift. `translate(-50%, -50%)` is the centring, so it has to be restated here
        // — writing `transform` from JS replaces the stylesheet's whole value, and dropping
        // the -50%s would jump the passage to the corner of its box.
        const dy = Math.round(drifts[i] * 10) / 10;
        if (dy !== lastDrift[i]) {
          lastDrift[i] = dy;
          el.style.transform = `translate(-50%, calc(-50% + ${dy}px))`;
        }

        const lit = Math.round(lits[i] * 100) / 100;
        if (lit !== lastLit[i]) {
          lastLit[i] = lit;
          el.style.setProperty("--lit", lit.toFixed(2));
        }
      });

      // The erase edge, on the first passage only. Swept in the SAME direction the reading
      // ran, so the passage clears from its opening word — it reads as being consumed, not
      // as being deleted from the end backwards.
      const out = Math.round((ERASE_FROM + erase * (ERASE_TO - ERASE_FROM)) * 100) / 100;
      if (out !== lastOut) {
        lastOut = out;
        first.style.setProperty("--out", out.toFixed(2));
      }

      // Each mark against its own passage's reading position — `at` for the first, and the
      // handover-offset clock for the second.
      const litIn = (passage: number) => lits[passage];

      const reachedMark = litIn(MARK.passage) >= MARK.index;
      if (reachedMark !== markLitRef.current) {
        markLitRef.current = reachedMark;
        setMarkLit(reachedMark);
      }

      const reachedFaces = litIn(FACES.passage) >= FACES.index;
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
        {TOKENS.map((tokens, passage) => (
          <p
            // eslint-disable-next-line react/no-array-index-key
            key={passage}
            ref={(el) => {
              passageRefs.current[passage] = el;
            }}
            className={styles.text}
          >
            {tokens.map((token, index) => {
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
              );
            })}
          </p>
        ))}
      </div>
    </section>
  );
};

export default wrapperHOC(Manifesto, {
  componentName: "Manifesto-ScholarshipV2",
  showForChina: true,
});
