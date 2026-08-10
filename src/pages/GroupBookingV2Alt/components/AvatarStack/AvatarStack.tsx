import { CSSProperties } from "react";
/**
 * Open Peeps by Pablo Stanley (https://www.openpeeps.com/), released CC0 1.0 —
 * public domain, so no attribution is required and none is rendered; the credit
 * here is courtesy.
 *
 * These assets used to live with the ticket variant of this page (GroupBookingV2)
 * and were imported from there so the two casts couldn't drift; that page has since
 * been removed, so they moved here and this is now their only home. The provenance
 * note travelled with them.
 *
 * Committed as static files rather than generated at runtime, because this
 * sandbox's pages have to paste back into amber-user-website unchanged and that
 * app has no avatar dependency. They were produced once with DiceBear, which
 * renders the pack locally:
 *
 *   npm i @dicebear/core @dicebear/collection
 *   createAvatar(openPeeps, { seed, size: 96, backgroundColor: [tone],
 *                             backgroundType: ["solid"] })
 *   seeds  Aria Bex Cleo Dev Esha Finn Gita Hugo Ivy Jonas
 *   tones  8fa6c4 c98f9b 93b3a1 c0a882 9b93c4 c49a86 84aab8 b79ac4 a8b884 c4948f
 *   then svgo --multipass --precision=1  (17% off; the extra decimals are
 *   invisible at the 24px these render at)
 *
 * The tone is baked into each file as a solid background.
 */
import avatar01 from "./assets/avatar-01.svg";
import avatar02 from "./assets/avatar-02.svg";
import avatar03 from "./assets/avatar-03.svg";
import avatar04 from "./assets/avatar-04.svg";
import avatar05 from "./assets/avatar-05.svg";
import avatar06 from "./assets/avatar-06.svg";
import avatar07 from "./assets/avatar-07.svg";
import avatar08 from "./assets/avatar-08.svg";
import avatar09 from "./assets/avatar-09.svg";
import avatar10 from "./assets/avatar-10.svg";
import styles from "./AvatarStack.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Display order, which is not file order: avatar-10 is moved up to third. Slots
 * fill left to right, so anyone late in this list only appears in a large group —
 * position here decides who shows up first, not just who sits where.
 */
const AVATARS = [
  avatar01,
  avatar02,
  avatar10,
  avatar03,
  avatar04,
  avatar05,
  avatar06,
  avatar07,
  avatar08,
  avatar09,
];

interface AvatarStackProps {
  /** People currently in the group — one avatar each. */
  count: number;
  /** Total slots to render. Owned by Hero, since it owns the slider's range. */
  maxCount: number;
}

/**
 * The group as an overlapping row of faces, beside the slider's count.
 *
 * Behaviour is the ticket version's, unchanged — same pack, same 24px, same
 * overlap, same show/hide. Only the placement differs: on the ticket it sits in the
 * card's stub, here it labels the slider.
 *
 * Every slot is rendered once and then shown or hidden, rather than being added to
 * and removed from the list. Unmounting a node cancels its transition, so a mapped
 * list can animate arrivals but departures just vanish. With a fixed set of nodes,
 * CSS runs both directions symmetrically — and `--count` on the container lets a
 * hidden slot tuck itself behind whichever avatar is currently last.
 */
const AvatarStack = ({ count, maxCount }: AvatarStackProps) => (
  <span
    className={styles.stack}
    style={{ "--count": count } as CSSProperties}
    // The count is spelled out in the text right beside this, so the faces are
    // decoration.
    aria-hidden="true"
  >
    {Array.from({ length: maxCount }, (_, index) => (
      <span
        key={index}
        className={`${styles.avatar} ${index < count ? "" : styles.avatarHidden}`}
        style={{ "--i": index } as CSSProperties}
      >
        {/* Wraps rather than running out if maxCount ever exceeds the pack. */}
        <img className={styles.img} src={AVATARS[index % AVATARS.length]} alt="" />
      </span>
    ))}
  </span>
);

export default wrapperHOC(AvatarStack, {
  componentName: "AvatarStack-GroupBookingV2Alt",
  showForChina: true,
});
