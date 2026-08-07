import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import CustomLink from "@Components/CustomLink";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Testimonials.module.scss";
import brand from "../../assets/testimonial-brand.png";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Case studies & testimonials" — Figma node 2483:9540.
 *
 * Three cards on a scroll track with the design's dots + chevrons underneath.
 * At 1440px all three fit and the controls sit idle (disabled); below that the
 * track scrolls a card at a time, which is what the controls are for.
 */
const QUOTE =
  "Amber Student have supported us filling voids across the portfolio for many years. We worked closely through Covid to reduce the impact of the pandemic on our students and continue to work in partnership to provide excellent accommodation to a global audience. We look forward to a positive ongoing relationship.";

/**
 * The same case study five times, on purpose: three fit at 1440px, so the extra
 * two are what give the track something to scroll and the controls something to
 * do. Swap in the real quotes as they land.
 */
const ITEMS = Array.from({ length: 5 }, (_, i) => ({
  id: `fresh-${i + 1}`,
  name: "Linsey Cullen",
  role: "Head of Customer Experience, Fresh",
  quote: QUOTE,
}));

/** Tolerance for "is the track at one of its ends", in px. */
const EDGE = 1;

/**
 * Drawn here rather than imported. The exported icons bake in the states the
 * design happened to be showing — a pale #c9c9c9 back chevron beside a dark
 * #202020 forward one — so as flat images the back one stayed greyed out even
 * once it was usable. Taking the stroke from currentColor hands that decision
 * to the button, which knows whether it is disabled.
 */
const Chevron = ({ back = false }: { back?: boolean }) => (
  <svg
    className={styles.chev}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d={back ? "M11 2L5 8L11 14" : "M5 2L11 8L5 14"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * How far one card advances the track: its width plus the gap after it.
 * `scrollWidth / count` is a card short of a gap — the track has one fewer gap
 * than it has cards — which left the last stop a few pixels shy of the end.
 */
const cardPitch = (node: HTMLDivElement) => {
  const track = node.firstElementChild;
  const gap = track ? parseFloat(window.getComputedStyle(track).columnGap) || 0 : 0;
  return (node.scrollWidth + gap) / ITEMS.length;
};

const Testimonials = () => {
  const viewport = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // 0 while every card is on screen — that is when the controls are inert.
  const [maxIndex, setMaxIndex] = useState(0);
  const maxIndexRef = useRef(0);
  // The chevrons read the track's real position rather than the dot index. The
  // viewport scrolls natively, so a trackpad swipe moves the cards without ever
  // going through goTo — driving the chevrons off the index left the back one
  // greyed out while the track was plainly scrolled in from the start.
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  /** Pulls the dot index and both chevron states off wherever the track sits. */
  const sync = useCallback(() => {
    const node = viewport.current;
    if (!node) return;

    const furthest = node.scrollWidth - node.clientWidth;
    setAtStart(node.scrollLeft <= EDGE);
    setAtEnd(node.scrollLeft >= furthest - EDGE);

    const pitch = cardPitch(node);
    if (pitch <= 0) return;
    const nearest = Math.round(node.scrollLeft / pitch);
    setIndex(Math.min(Math.max(nearest, 0), maxIndexRef.current));
  }, []);

  const measure = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const pitch = cardPitch(node);
    const visible = pitch > 0 ? Math.round(node.clientWidth / pitch) : ITEMS.length;
    maxIndexRef.current = Math.max(0, ITEMS.length - visible);
    setMaxIndex(maxIndexRef.current);
    sync();
  }, [sync]);

  useEffect(() => {
    const node = viewport.current;
    measure();
    window.addEventListener("resize", measure);

    // Throttled to a frame: a swipe fires scroll far more often than the two
    // booleans and one index can actually change.
    let raf = 0;
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };
    if (node) node.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", measure);
      if (raf) window.cancelAnimationFrame(raf);
      if (node) node.removeEventListener("scroll", onScroll);
    };
  }, [measure, sync]);

  const goTo = (next: number) => {
    const node = viewport.current;
    const clamped = Math.min(Math.max(next, 0), maxIndex);
    setIndex(clamped);
    if (node) {
      const reduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      node.scrollTo({
        left: cardPitch(node) * clamped,
        behavior: reduced ? "auto" : "smooth",
      });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal as="h2" className={styles.heading}>
          Case studies &amp; testimonials
        </Reveal>

        <div className={styles.viewport} ref={viewport}>
          <div className={styles.track}>
            {ITEMS.map((item) => (
              <article className={styles.card} key={item.id}>
                <div className={styles.cardTop}>
                  <div className={styles.person}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.role}>{item.role}</span>
                  </div>
                  <div className={styles.brand}>
                    {/* Same as the partner wall — brand marks appear, they do
                        not animate in. */}
                    <Image
                      src={brand}
                      alt="amber and Londonist"
                      className={styles.brandImage}
                      width={173}
                      height={28}
                      isNotLazy
                    />
                  </div>
                </div>

                <div className={styles.cardBottom}>
                  <p className={styles.quote}>&ldquo;{item.quote}&rdquo;</p>
                  <CustomLink href="/" className={styles.readMore}>
                    Read Case Study
                  </CustomLink>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.nav}>
          <div className={styles.dots}>
            {/* One per stop the track can rest at, not per card — with five
                cards and three on screen there are three stops, so a dot per
                card would leave two of them permanently unreachable. Falls back
                to one per card when everything fits and the controls are inert,
                which is the idle row the design draws. */}
            {Array.from({ length: maxIndex > 0 ? maxIndex + 1 : ITEMS.length }, (_, i) => (
              <button
                type="button"
                key={`dot-${i}`}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          <div className={styles.discs}>
            <button
              type="button"
              aria-label="Previous testimonial"
              className={styles.disc}
              onClick={() => goTo(index - 1)}
              disabled={atStart}
            >
              <Chevron back />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              className={styles.disc}
              onClick={() => goTo(index + 1)}
              disabled={atEnd}
            >
              <Chevron />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default wrapperHOC(Testimonials, {
  componentName: "Testimonials-ListWithUs",
  showForChina: true,
});
