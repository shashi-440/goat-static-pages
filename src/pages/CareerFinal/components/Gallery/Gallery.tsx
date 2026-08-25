import { useCallback, useEffect, useRef, useState } from "react";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Gallery.module.scss";

interface Shot {
  /** Short caption, used as the image's accessible description. */
  label: string;
  /**
   * Remote placeholder (Unsplash office stock) so the carousel has real content
   * to show. Swap each for a local import once the real photos exist — these are
   * hotlinked and should not ship to production.
   */
  src: string;
}

// PLACEHOLDER PHOTOS — hotlinked Unsplash, sixteen DISTINCT images, no repeats.
// Every URL was checked to return 200.
//
// Chosen for colour and people rather than empty rooms: the previous set was
// muted office interiors, which looked flat once the dark background came off
// and the photos had to carry the section on their own. Dark concert and
// architectural shots were deliberately rejected — against a white backdrop they
// read as holes in the strip.
//
// These are stand-ins: replace each `src` with a local import of the real photo
// and nothing else here changes.
//
// Card count drives the geometry: CARDS.length cards are spaced evenly around a
// full 360deg ring, so adding or removing one re-spaces the cylinder
// automatically. Sixteen puts ~8 across the viewport, matching the reference.
const CARDS: Shot[] = [
  {
    label: "Conference talk",
    src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Students on campus",
    src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Working together",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Festival lights",
    src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Studio session",
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Sunset offsite",
    src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Long table dinner",
    src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Workshop wall",
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Bright standup",
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Hands in",
    src: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Drinks after work",
    src: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Team lunch",
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Group portrait",
    src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Collaboration",
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Open-plan desks",
    src: "https://images.unsplash.com/photo-1552581234-26160f608093?w=820&h=560&q=72&auto=format&fit=crop",
  },
  {
    label: "Pair programming",
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=820&h=560&q=72&auto=format&fit=crop",
  },
];

// Three rows, each carrying the FULL deck rotated by a different offset.
//
// Not a round-robin split. The ring radius is derived from the angular step
// between neighbours, and the step is 360/count — so dealing the deck into
// thirds drops each row to ~5 cards, which collapses the radius from ~1000px to
// ~300px and turns the shallow arc into a tight hexagonal fan. Every row needs
// the full count to keep the original curve.
//
// Instead each row shows all sixteen, offset by a different amount so the three
// rows are never displaying the same photo at the same angle. The deck holds no
// duplicates now, so the offsets only have to be distinct — they no longer need
// to avoid landing two copies of one photo side by side.
const ROW_COUNT = 3;
const ROW_OFFSET = [0, 6, 11];
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

// ZERO. A positive gap opens a real hole in the ring and the white page shows
// through it — that was the visible seam. At 0 the tangent seating already
// leaves neighbours overlapping by ~12px on screen, so the strip is continuous;
// the hairline between frames comes from each card's own inner edge instead.
const CARD_GAP = 0;

// r = (w + gap) / (2 * tan(step / 2)).
//
// The TANGENT form. The chord form (`/ 2 sin`) tiles the cards' flat widths
// around the ring exactly, but after projection a card at angle a appears only
// `w * cos(a)` wide while its neighbour's centre is still a full chord away — so
// every pair gaps, widening toward the edges. Dividing by tan seats them so they
// meet on screen, with `CARD_GAP` opening the hairline.
const radiusFor = (step: number) =>
  Math.round((CARD_W + CARD_GAP) / (2 * Math.tan((Math.PI * step) / 360)));

// Cards this far (in slots) from the front are edge-on slivers; they fade out
// rather than being drawn as 1px lines.
const FADE_SLOTS = 4.2;

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
const opacityAt = (deg: number, step: number) => {
  const d = Math.abs((((deg % 360) + 540) % 360) - 180);
  const slots = d / step;
  // Fade over the last 1.3 slots before FADE_SLOTS, smoothstepped so neither
  // end of the fade has a corner in it.
  const t = Math.min(1, Math.max(0, (slots - (FADE_SLOTS - 1.3)) / 1.3));
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
        el.style.opacity = String(opacityAt(i * step + angle, step));
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

  return (
    <section className={styles.section}>
      {/* The section runs white → near-black, so it cannot carry
          data-nav-theme="dark" as a whole — the header would flip to its white
          logo while still over the pale top. This zero-impact marker covers only
          the region from the carousel down, which is what the shared Navbar
          detects. */}
      <div className={styles.darkZone} data-nav-theme="dark" aria-hidden="true" />

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
