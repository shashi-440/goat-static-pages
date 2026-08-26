import { useCallback, useEffect, useRef, useState } from "react";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Gallery.module.scss";

// The real office photos, exported from Figma (Career Page Cleanup, node
// 2979:4454 — the "indian" section) and committed here. They arrived as 4096x2731
// PNGs at ~10MB each, 142MB for the set; resized to 820px wide JPEGs at q72 they
// are ~115KB each, in line with the crew-*.jpg already in this folder. 820 is 2x
// the 400px card width, so they stay sharp on a retina display.
import life01 from "../../assets/life/life-01.jpg";
import life02 from "../../assets/life/life-02.jpg";
import life03 from "../../assets/life/life-03.jpg";
import life04 from "../../assets/life/life-04.jpg";
import life05 from "../../assets/life/life-05.jpg";
import life06 from "../../assets/life/life-06.jpg";
import life07 from "../../assets/life/life-07.jpg";
import life08 from "../../assets/life/life-08.jpg";
import life09 from "../../assets/life/life-09.jpg";
import life10 from "../../assets/life/life-10.jpg";
import life11 from "../../assets/life/life-11.jpg";
import life12 from "../../assets/life/life-12.jpg";
import life13 from "../../assets/life/life-13.jpg";
// The offices outside India (Career Page Cleanup, node 3003:4591 — "outer"). The
// OPPO Find N5 / HASSELBLAD camera watermark was a white band exactly 384px tall
// at the bottom of each source, measured by scanning up for near-white rows rather
// than eyeballed; the stairwell has faint text baked into the photo instead, so ~7%
// of its height came off. Cropped away before the ratio fit, so the watermark is
// gone rather than merely out of frame.
import life14 from "../../assets/life/life-14.jpg";
import life15 from "../../assets/life/life-15.jpg";
import life16 from "../../assets/life/life-16.jpg";
import life17 from "../../assets/life/life-17.jpg";
import life18 from "../../assets/life/life-18.jpg";

interface Shot {
  /** Short caption, used as the image's accessible description. */
  label: string;
  /** Local import — these are the real photos, not hotlinked stock. */
  src: string;
}

// The real office photos — thirteen of them, no repeats.
//
// This replaces sixteen hotlinked Unsplash URLs which the previous comment here
// flagged as not shippable. Thirteen rather than sixteen is fine: each row shows
// the whole deck at a different offset, so the count only sets how long a row
// takes to loop, not whether the arc is continuous.
//
// Labels describe the shot for the accessible description; the images themselves
// are decorative (alt="") since the section is a mood piece, not information.
const CARDS: Shot[] = [
  { label: "Screening in the lounge", src: life01 },
  { label: "Diwali at the office", src: life02 },
  { label: "Beanbag corner", src: life03 },
  { label: "Foosball table", src: life04 },
  { label: "Board games over lunch", src: life05 },
  { label: "The open-plan floor", src: life06 },
  { label: "Working together", src: life07 },
  { label: "Table football crowd", src: life08 },
  { label: "All-hands circle", src: life09 },
  { label: "Breakout seating", src: life10 },
  { label: "Team celebration", src: life11 },
  { label: "Desks at full tilt", src: life12 },
  { label: "Afternoon in the lounge", src: life13 },
  // ---- offices outside India ----
  //
  // Five, not seven: the Figma section holds seven tiles but two are exact
  // duplicates (byte-identical downloads — the dinner and the group photo each
  // appear twice), and the carousel shows every card in all three rows, so a
  // repeat would be visible.
  { label: "Desks at the China office", src: life14 },
  { label: "Working session", src: life15 },
  { label: "Team dinner in China", src: life16 },
  { label: "The China team", src: life17 },
  { label: "Office stairwell", src: life18 },
];

// Three rows, each carrying the FULL deck at a different offset.
//
// This restores the wide shallow arc. A row needs about twelve cards for its
// visible span to fill the strip — measured: six cards span ~1000px of a 1440px
// viewport and leave obvious gaps, twelve span ~1693px and fill it — and with
// eighteen photos three DISJOINT rows would only get six each. The full deck it
// is, until there are enough photos for twelve a row.
//
// The cost is duplicates: every row draws from the same deck, so a photo can be
// visible in two rows at once. Offsets space them as far apart as the deck allows,
// which is the most that can be done without more photos — the rows spin at
// different speeds, so no offset keeps them apart forever.
//
// WHEN 18 MORE PHOTOS ARRIVE: switch to disjoint slices of twelve —
//   const PER_ROW = Math.floor(CARDS.length / ROW_COUNT);
//   CARDS.slice(r * PER_ROW, (r + 1) * PER_ROW)
// — which makes a repeat impossible AND keeps the arc, since each row still holds
// twelve cards.
const ROW_COUNT = 3;
const ROW_OFFSET = [0, 6, 12];
const ROWS: Shot[][] = Array.from({ length: ROW_COUNT }, (_, r) => {
  const k = ROW_OFFSET[r] % CARDS.length;
  return [...CARDS.slice(k), ...CARDS.slice(0, k)];
});

// ---- Cylinder geometry ---------------------------------------------------
// Cards sit on the INSIDE wall of a cylinder with the viewer at its centre,
// which is what gives the concave arc — edges curving away, centre nearest.
//
// CARD_W must match $card-w in the stylesheet: the radius is derived from it, so
// a mismatch leaves the cards overlapping or gapped on the ring.
// Per ROW, not per deck: each row carries a third of the cards, so the ring
// spacing is derived from the row length. Rows can differ in length by one (16
// across 3 is 6/5/5), so STEP is computed from each row's own count at render
// time rather than being a single module constant.
const stepFor = (count: number) => 360 / count;

// Landscape frames. Office photos are wide scenes — a room, a table, a group —
// and a tall portrait crop cuts the sides off whatever the shot was actually of.
//
// A landscape card gives the arc less vertical extent to bow through, so the
// curve is recovered with a tighter radius and a nearer camera rather than by
// making the cards tall.
const CARD_W = 400;
// Mirrors $card-h. Not read by the geometry — only CARD_W feeds the radius — but
// kept in sync so the two files do not disagree about the card's shape.
const CARD_H = 190;

// The inter-photo gap, seated on the RING rather than as padding inside each card.
//
// It used to be `padding-right: $img-gap` on the card, which foreshortens with the
// card it belongs to: measured 10px between the two centre photos but only 6px out
// at the edges, which is the uneven spacing. A gap built into the ring's own
// spacing is a fixed angular distance, so it projects to the same proportion of
// every card and the rhythm reads as even all the way across.
const CARD_GAP = 12;

// r = (w + gap) / (2 * tan(step / 2)).
//
// The TANGENT form. The chord form (`/ 2 sin`) tiles the cards' flat widths
// around the ring exactly, but after projection a card at angle a appears only
// `w * cos(a)` wide while its neighbour's centre is still a full chord away — so
// every pair gaps, widening toward the edges. Dividing by tan seats them so they
// meet on screen, with `CARD_GAP` opening the hairline.
const radiusFor = (step: number) =>
  Math.round((CARD_W + CARD_GAP) / (2 * Math.tan((Math.PI * step) / 360)));

// How far from the front of the arc a card stays visible, in DEGREES.
//
// Degrees, not slots. This was `4.2` slots, which was fine at sixteen cards (a
// slot is 22.5deg, so ~95deg) but is scale-dependent in the worst way: a slot is
// 360/count, so at six cards a row the same 4.2 became 252deg — wider than the
// visible hemisphere. Nothing ever faded, the far side of the cylinder stayed
// fully opaque, and a card at rotateY(120deg) rendered 375px tall against a 190px
// row (perspective magnifies whatever swings toward the viewer). That is what made
// the rows overlap and spill out of the section.
//
// 78deg. The CURVE is the whole point of this component, and it comes from cards
// being visibly angled — cut the fade short and the strip flattens into a plain
// row of pictures. 60deg was tried and does exactly that.
//
// The catch is that perspective magnifies a card as it swings toward the viewer,
// and on this eighteen-card ring (r = 1134px) a card at 78deg projects 403px tall
// against a 190px card. That is not a reason to shorten the fade — it is a
// requirement on the ROW, which is sized to 420px to hold it. The two are a pair:
// widening this without raising $row-h puts the rows back on top of each other.
const FADE_DEG = 78;
// Width of the fade ramp, also in degrees.
const FADE_RAMP = 26;

/**
 * Per-card opacity at `deg` degrees from the front of the arc.
 *
 * Height is deliberately NOT varied here any more. Tapering each card's own
 * height made adjacent cards different vertical extents, so at every join the
 * strip's top and bottom edge stepped instead of flowing — that was the kink.
 * With one uniform height, perspective alone scales each card, and because the
 * scale is continuous around the ring the top edges form a single smooth curve.
 *
 * Only opacity varies, so cards edge-on to the viewer leave rather than
 * collapsing into a hard 1px line at the end of the arc.
 */
const opacityAt = (deg: number) => {
  // Angular distance from the front of the arc: 0deg faces the viewer, 180deg is
  // directly behind. The expression already yields that distance — do not negate
  // it against 180, which inverts the fade and hides the front of the strip.
  const d = Math.abs((((deg % 360) + 540) % 360) - 180);
  // Smoothstepped over FADE_RAMP so neither end of the fade has a corner in it.
  const t = Math.min(1, Math.max(0, (d - (FADE_DEG - FADE_RAMP)) / FADE_RAMP));
  const k = t * t * (3 - 2 * t);
  return Number((1 - k).toFixed(3));
};

// Idle spin, degrees per second, PER ROW.
//
// Positive: with the cards on the inner wall, an increasing rotateY carries the
// near face right-to-left, which is the direction the reference drifts. (This is
// the same sign convention the drag inverts — see onPointerMove.)
//
// The middle row runs negative so it travels the opposite way, and the three
// speeds are deliberately not multiples of each other — with 2.6/-2.0/3.1 the
// rows drift back into alignment only after several minutes, where round numbers
// would visibly re-sync every few seconds and the three would read as one block.
const ROW_SPIN_DPS = [2.6, -2.0, 3.1];

// Starting offset per row, in degrees. Without this every row would begin with a
// card centred at exactly the same angle and the first frame would look like a
// grid rather than three independent rings.
const ROW_PHASE = [0, 14, 27];

// Drag: screen px -> degrees. A full viewport drag turns a bit over a quarter.
const DRAG_SENS = 0.16;
// Wheel/trackpad: horizontal delta -> degrees.
const WHEEL_SENS = 0.09;
// Inertia after a fling, and how fast it decays toward the idle spin.
const FRICTION = 0.94;
// Below this the fling is spent and the idle spin takes back over.
const MIN_FLING = 0.02;
// How far the pointer must move before it counts as a drag, not a click.
const DRAG_SLOP = 3;

/**
 * Photo gallery — a 3D cylinder carousel above the closing CTA.
 *
 * The cards are laid out on the inner wall of a cylinder: each is rotated
 * `i * STEP` degrees about the Y axis and pushed out by the radius, so the strip
 * curves away at both edges and bows toward the viewer in the middle. That
 * concave arc is the whole look — a flat marquee with a CSS curve filter cannot
 * produce it, because the cards themselves have to be angled in space.
 *
 * It turns continuously right-to-left, and can also be dragged or scrolled
 * horizontally. All three share one angle: the idle spin advances it every
 * frame, a drag sets it directly, and a fling decays back into the idle spin
 * rather than stopping dead.
 *
 * The rotation is driven in a ref and written straight to the element's
 * transform, NOT through state — a setState per frame on 16 cards re-renders the
 * whole subtree 60 times a second for a value only the transform consumes.
 */
const Gallery = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  // One entry per row: the ring element, and that row's card elements.
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[][]>(
    ROWS.map(() => []),
  );

  // Live rotation state. One angle per row now — all in refs, so the loop never
  // triggers a render.
  const angles = useRef<number[]>([...ROW_PHASE]);
  const velocity = useRef(0); // degrees/frame, from a fling; shared by all rows
  const dragging = useRef<{ id: number; x: number; moved: boolean } | null>(null);
  const rafRef = useRef(0);
  const lastT = useRef(0);
  const visible = useRef(false);
  const stillRef = useRef(false);

  // `isDragging` is the one piece of state, because it changes the cursor —
  // that has to go through the class list, and it changes on gesture start/end
  // rather than per frame.
  const [isDragging, setIsDragging] = useState(false);

  const apply = useCallback(() => {
    ROWS.forEach((row, r) => {
      const step = stepFor(row.length);
      const radius = radiusFor(step);
      const angle = angles.current[r];

      const ring = ringRefs.current[r];
      if (ring) ring.style.transform = `translateZ(${radius}px) rotateY(${angle}deg)`;

      // Only opacity is per-frame — height is uniform, so the arc's top and
      // bottom edges stay smooth. Written straight to style rather than through
      // state: this runs every frame, and a setState here would re-render every
      // card 60x a second for a value only the compositor consumes.
      cardRefs.current[r].forEach((el, i) => {
        if (!el) return;
        el.style.opacity = String(opacityAt(i * step + angle));
      });
    });
  }, []);

  // One loop for every row's idle spin and the shared fling decay. Runs only
  // while the section is on screen, so an off-screen carousel costs nothing.
  const tick = useCallback(
    (t: number) => {
      const dt = lastT.current ? Math.min(64, t - lastT.current) : 16;
      lastT.current = t;

      if (!dragging.current?.moved) {
        if (Math.abs(velocity.current) > MIN_FLING) {
          // Coasting from a fling. Every row takes the same angular delta, so a
          // flick moves the whole gallery as one piece rather than shearing the
          // rows apart.
          angles.current = angles.current.map((a) => a + velocity.current);
          velocity.current *= FRICTION;
        } else {
          velocity.current = 0;
          // Idle: each row returns to its own speed and direction.
          angles.current = angles.current.map(
            (a, r) => a + (ROW_SPIN_DPS[r] * dt) / 1000,
          );
        }
        apply();
      }

      rafRef.current = window.requestAnimationFrame(tick);
    },
    [apply],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    stillRef.current =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    apply();

    // Reduced motion: lay the rings out and leave them. Drag and wheel still
    // work, so the photos remain reachable — it just never moves on its own.
    if (stillRef.current) return undefined;

    const start = () => {
      if (rafRef.current) return;
      lastT.current = 0;
      rafRef.current = window.requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!rafRef.current) return;
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };

    if (typeof IntersectionObserver === "undefined") {
      start();
      return () => stop();
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible.current = entries.some((e) => e.isIntersecting);
        if (visible.current) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(stage);

    return () => {
      io.disconnect();
      stop();
    };
  }, [apply, tick]);

  // ---- Drag ---------------------------------------------------------------
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = { id: e.pointerId, x: e.clientX, moved: false };
    velocity.current = 0;
    stageRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragging.current;
    if (!d || d.id !== e.pointerId) return;

    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < DRAG_SLOP) return;
    if (!d.moved) {
      d.moved = true;
      setIsDragging(true);
    }

    // NEGATED. The cards sit on the inside wall of the cylinder facing inward,
    // so increasing rotateY carries the near face LEFT while the cursor goes
    // right — the surface would move against the hand. Flipping the sign makes
    // the photos follow the drag, which is what "grab and pull" should do.
    //
    // Applied equally to all three rows: one gesture over the stage moves the
    // whole gallery, which is what a single grab should feel like. The rows
    // resume their own directions the moment the fling decays.
    const delta = -dx * DRAG_SENS;
    angles.current = angles.current.map((a) => a + delta);
    // Remember the last movement as the fling velocity, so releasing mid-drag
    // carries on rather than stopping dead.
    velocity.current = delta;
    d.x = e.clientX;
    apply();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragging.current;
    if (!d || d.id !== e.pointerId) return;
    dragging.current = null;
    setIsDragging(false);
    if (stageRef.current?.hasPointerCapture(e.pointerId)) {
      stageRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // ---- Horizontal scroll --------------------------------------------------
  // Bound natively rather than via onWheel: React's wheel handler is passive, so
  // preventDefault() there is a no-op and the page would scroll as well.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const onWheel = (e: WheelEvent) => {
      // Only claim genuinely horizontal intent — a vertical scroll over the
      // carousel must still scroll the page.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      // Same inversion as the drag, for the same reason: a rightward scroll
      // should move the strip the way a rightward drag does.
      const delta = -e.deltaX * WHEEL_SENS;
      angles.current = angles.current.map((a) => a + delta);
      velocity.current = delta * 0.5;
      apply();
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [apply]);

  // No data-nav-theme marker in this section any more. It used to end in a dark
  // ramp, so it carried one over its lower region to flip the header to its white
  // logo. The background is flat white now and a white logo on white would
  // vanish; CrewCTA below carries its own marker for the real dark band.
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Reveal className={styles.headerInner}>
          <h2 className={styles.title}>Life at amber</h2>
          <p className={styles.subtitle}>
            Offsites, festivals, launch days and the ordinary Tuesdays in between.
          </p>
        </Reveal>
      </div>

      {/* The stage owns the perspective and the gestures for all three rows, so
          one drag turns the whole gallery. Each row inside it is an independent
          cylinder with its own angle, speed and direction. */}
      <div
        ref={stageRef}
        className={`${styles.stage} ${isDragging ? styles.isDragging : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="group"
        aria-label="Photos of life at amber. Drag or scroll sideways to browse."
      >
        {ROWS.map((row, r) => {
          const step = stepFor(row.length);
          const radius = radiusFor(step);
          return (
            <div key={`row-${r}`} className={styles.row}>
              <div
                ref={(el) => {
                  ringRefs.current[r] = el;
                }}
                className={styles.ring}
                // Pre-hydration state only; the JS rewrites this every frame.
                style={{
                  transform: `translateZ(${radius}px) rotateY(${ROW_PHASE[r]}deg)`,
                }}
              >
                {row.map((card, i) => (
                  <div
                    key={`${card.label}-${i}`}
                    ref={(el) => {
                      cardRefs.current[r][i] = el;
                    }}
                    className={styles.card}
                    // Each card is turned to its own angle on its row's ring,
                    // then pushed out to the wall. The negative radius puts the
                    // cards on the INSIDE of the cylinder, facing inward at the
                    // viewer. Opacity is written per frame by `apply`.
                    style={{
                      transform: `rotateY(${i * step}deg) translateZ(${-radius}px)`,
                    }}
                  >
                    <img src={card.src} alt="" className={styles.photo} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default wrapperHOC(Gallery, {
  componentName: "Gallery-CareerFinal",
  showForChina: true,
});
