import { useState } from "react";
import Image from "@Components/Image";
import StoryModal from "../StoryModal/StoryModal";
import styles from "./CreatorMarquee.module.scss";
import bandImg from "../../assets/band.jpg";
import badgeImg from "../../assets/badge.png";
import playIcon from "../../assets/play.svg";
// Portraits from the design — image 22317 (2122:8944) plus the two from
// 2124:8990. Squared and cropped to the card's 313px window.
import winner1 from "../../assets/winner-1.jpg";
import winner2 from "../../assets/winner-2.jpg";
import winner3 from "../../assets/winner-3.jpg";
import winner4 from "../../assets/winner-4.jpg";
import winner5 from "../../assets/winner-5.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

// Placeholder story video for every card, until each winner's own is supplied —
// swap in a real id per entry in WINNERS below and that card stops falling back.
// https://www.youtube.com/watch?v=uPivRC-AyDc — an amber video, so the stand-in is
// at least on-brand; it replaced Blender's "Big Buck Bunny", which read as random.
const PLACEHOLDER_VIDEO_ID = "uPivRC-AyDc";

interface Winner {
  name: string;
  /** Award tier — drives the laurel colour (gold vs silver). */
  role: "Winner" | "Runner Up";
  /** Which edition they placed in. */
  edition: string;
  image: string;
  /** YouTube id for this winner's story; falls back to the placeholder. */
  videoId?: string;
}

// Eight cards over five portraits, so some repeat. The order is set so no photo
// sits next to itself — including across the loop seam, where the last card runs
// straight back into the first.
const WINNERS: Winner[] = [
  { name: "Salena Gomez", role: "Winner", edition: "Forth Edition", image: winner1 },
  { name: "Hind Irlane", role: "Runner Up", edition: "Forth Edition", image: winner2 },
  { name: "Micah Sarah", role: "Winner", edition: "Third Edition", image: winner3 },
  { name: "Cam Malik", role: "Runner Up", edition: "Third Edition", image: winner4 },
  { name: "Tyler Glass", role: "Winner", edition: "Second Edition", image: winner1 },
  { name: "Julia Estonia", role: "Runner Up", edition: "Second Edition", image: winner5 },
  { name: "Miriam Rao", role: "Winner", edition: "First Edition", image: winner2 },
  { name: "Ashley Walseman", role: "Runner Up", edition: "First Edition", image: winner3 },
];

// Laurel pair flanking the award line. Authored here rather than exported —
// there is no laurel node in the Figma file, only a reference screenshot. Uses
// currentColor so it picks up the award green from .meta.
const Laurel = () => (
  <svg className={styles.laurel} viewBox="0 0 22 14" fill="currentColor" aria-hidden="true" focusable="false">
    <g>
      <path d="M6.6 13.3C3.9 12.1 2.1 9.4 2.1 6.3c0-1.9.7-3.7 1.9-5.1l.85.75C3.75 3.15 3.2 4.65 3.2 6.3c0 2.6 1.5 4.9 3.85 6z" />
      <ellipse cx="2.5" cy="2.6" rx="1.35" ry="0.72" transform="rotate(-52 2.5 2.6)" />
      <ellipse cx="1.75" cy="5.1" rx="1.35" ry="0.72" transform="rotate(-22 1.75 5.1)" />
      <ellipse cx="1.95" cy="7.7" rx="1.35" ry="0.72" transform="rotate(10 1.95 7.7)" />
      <ellipse cx="3" cy="10.1" rx="1.35" ry="0.72" transform="rotate(38 3 10.1)" />
      <ellipse cx="4.85" cy="12" rx="1.3" ry="0.7" transform="rotate(62 4.85 12)" />
    </g>
    {/* Mirrored for the right-hand branch. */}
    <g transform="translate(22,0) scale(-1,1)">
      <path d="M6.6 13.3C3.9 12.1 2.1 9.4 2.1 6.3c0-1.9.7-3.7 1.9-5.1l.85.75C3.75 3.15 3.2 4.65 3.2 6.3c0 2.6 1.5 4.9 3.85 6z" />
      <ellipse cx="2.5" cy="2.6" rx="1.35" ry="0.72" transform="rotate(-52 2.5 2.6)" />
      <ellipse cx="1.75" cy="5.1" rx="1.35" ry="0.72" transform="rotate(-22 1.75 5.1)" />
      <ellipse cx="1.95" cy="7.7" rx="1.35" ry="0.72" transform="rotate(10 1.95 7.7)" />
      <ellipse cx="3" cy="10.1" rx="1.35" ry="0.72" transform="rotate(38 3 10.1)" />
      <ellipse cx="4.85" cy="12" rx="1.3" ry="0.7" transform="rotate(62 4.85 12)" />
    </g>
  </svg>
);

/**
 * Winner card — Figma node 2122:8944 (Default / On Hover).
 *
 * Anatomy: a bordered, clipped body holding a #111928 header (name + meta) with
 * the photo pulled up over its lower two thirds, and a white "Watch Story" pill
 * straddling the body's bottom edge by 18px.
 *
 * Hover adds two things over the photo — a diagonal dark gradient and the
 * "RECEIVED $10,000" graphic — both handled in CSS off the card's :hover.
 */
const Card = ({ winner, onOpen }: { winner: Winner; onOpen: () => void }) => (
  <li className={styles.cardItem}>
    {/* A real button, so Enter/Space and focus rings come for free. */}
    <button type="button" className={styles.card} onClick={onOpen}>
      <div className={styles.body}>
      <div className={styles.header}>
        <span className={styles.name}>{winner.name}</span>
        <span className={styles.meta}>
          <span
            className={`${styles.award} ${
              winner.role === "Runner Up" ? styles.awardRunnerUp : ""
            }`}
          >
            <Laurel />
            {winner.role}
          </span>
          <span className={styles.bullet} aria-hidden="true" />
          <span className={styles.edition}>{winner.edition}</span>
        </span>
      </div>

      <div className={styles.photo}>
        <Image
          src={winner.image}
          alt=""
          className={styles.photoImage}
          width={313}
          height={313}
          isEagerLoad
        />
        {/* Hover: diagonal scrim, then the award graphic over it.
            The reveal lives on this wrapper, not on the <Image> itself — Image
            applies `.animateOpacity.show { opacity: 1 }`, two classes, which
            would out-specify a single-class rule here and force it visible. */}
        <span className={styles.photoScrim} aria-hidden="true" />
        <span className={styles.badge} aria-hidden="true">
          <Image
            src={badgeImg}
            alt=""
            className={styles.badgeImage}
            width={168}
            height={81}
            isEagerLoad
          />
        </span>
      </div>
    </div>

      <span className={styles.watch}>
        {/* 18px slot per the design, holding the triangle at its own 12.67×11.5
            size — the SVG is preserveAspectRatio="none", so stretching it to a
            square distorts it into a blob. The rotation is on the slot because
            Image's `.animateOpacity.show { transform: none }` would cancel it. */}
        <span className={styles.playSlot} aria-hidden="true">
          <Image
            src={playIcon}
            alt=""
            className={styles.playImage}
            width={13}
            height={12}
            isEagerLoad
          />
        </span>
        Watch Story
      </span>
    </button>
  </li>
);

/**
 * A single rail of winner cards drifting left (Figma 2096:5071 — the sibling
 * "Container:transform" at the same coordinates is a duplicate showing the rail
 * mid-scroll, not a second row).
 *
 * The rail renders its cards twice and translates by exactly half the track, so
 * the second copy is in the first's place when the animation loops and the seam
 * is invisible. Pure CSS, so no scroll listener; pauses on hover.
 *
 * Behind it sits the design's hero-backdrop-band (2109:3553): a photo with two
 * white gradients over it, fading it out at the top and bottom.
 */
const CreatorMarquee = () => {
  // Which winner's story is playing; null when the lightbox is closed.
  const [playing, setPlaying] = useState<Winner | null>(null);

  return (
    <section className={styles.section} aria-label="amberscholar winners">
      <div className={styles.band} aria-hidden="true">
        <Image
          src={bandImg}
          alt=""
          className={styles.bandImage}
          width="100%"
          height="100%"
          isEagerLoad
        />
        <span className={styles.bandFade} />
      </div>

      <div className={styles.viewport}>
        <ul className={styles.track}>
          {[...WINNERS, ...WINNERS].map((winner, i) => (
            <Card
              // eslint-disable-next-line react/no-array-index-key
              key={`${winner.name}-${i}`}
              winner={winner}
              onOpen={() => setPlaying(winner)}
            />
          ))}
        </ul>
      </div>

      <StoryModal
        open={playing !== null}
        title={playing ? `${playing.name} — ${playing.role}, ${playing.edition}` : ""}
        videoId={playing?.videoId ?? PLACEHOLDER_VIDEO_ID}
        onClose={() => setPlaying(null)}
      />
    </section>
  );
};

export default wrapperHOC(CreatorMarquee, {
  componentName: "CreatorMarquee-ScholarshipV2",
  showForChina: true,
});
