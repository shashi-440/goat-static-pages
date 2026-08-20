import { CSSProperties, useState } from "react";
import CustomLink from "@Components/CustomLink";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
// The navbar's gradient pill IS this page's CTA — same class, not a copy of its
// rules, so the two can't drift apart. It also carries the `color: #fff
// !important` guard the site's global `a:hover` rule needs.
import navStyles from "../../../AboutUsV2/components/Navbar/Navbar.module.scss";
import AvatarStack from "../AvatarStack/AvatarStack";
// A normal asset import — jpg is covered by webpack/base.config's loader rule, so it
// gets hashed and inlined-or-emitted like any other image. (The mp4 this replaced could
// not be imported: that rule only matches png|svg|jpe?g|gif, so the video had to ride on
// the CopyRspackPlugin glob in webpack/server.config and be referenced by literal path.
// One less special case.)
//
// Cropped to 79:77 — the Polaroid 600 image window's own ratio — and exported at 716×696,
// which is 2× the 358×348 it is displayed at. Cropping in the asset rather than with
// object-fit means the browser is never handed pixels it throws away.
import photo from "../../assets/hero-photo.jpg";
import styles from "./Hero.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

// Group-size slider. Placeholder economics — one flat saving per student — so the
// headline moves believably while the real rate card is still being worked out.
const MIN_GROUP = 2;
const MAX_GROUP = 10;
// 8, so the headline opens on £400 as specified. The figure is slider-driven, not
// copy — hardcoding it would break the one interaction this hero is built around.
const DEFAULT_GROUP = 8;
const SAVING_PER_STUDENT = 50;
const CURRENCY = "£";
// Placeholder, like the rate above it — a real print would carry wherever the group
// actually moved to, and this page has no city in scope yet. UK, to match the £.
const CAMPUS = "University of Manchester";


/**
 * Thousands separators without Intl.
 *
 * `toLocaleString` would be fine on Node 20, but a formatter that can't vary
 * between the server and the browser removes any chance of a hydration mismatch on
 * the one number this hero is built around.
 */
const withCommas = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const money = (value: number) => `${CURRENCY}${withCommas(value)}`;

/**
 * Group Booking hero — two columns: photograph left, copy right.
 *
 * Differs from the ticket version in two ways, and only those two: the visual is a
 * print of four friends rather than a 3D card, and the live total is back inside the
 * headline rather than being the card's payload. Everything else — the slider, the
 * confetti at maximum — is the same.
 *
 * The photograph is decorative and deliberately inert: it doesn't respond to the group
 * size. What does: the headline's figure, the count beside the slider, and the
 * avatar row.
 *
 * The figure sits on its own line so only that line reflows as the slider moves;
 * the line above it stays put instead of re-wrapping.
 */
const Hero = () => {
  const [groupSize, setGroupSize] = useState(DEFAULT_GROUP);

  const totalSaving = groupSize * SAVING_PER_STUDENT;
  // 0 → 1 across the slider's range, used to draw the filled part of the track.
  const fill = (groupSize - MIN_GROUP) / (MAX_GROUP - MIN_GROUP);

  return (
    <section className={styles.hero}>
      <div className={styles.row}>
        <div className={styles.copy}>
          <Reveal as="h1" className={styles.title}>
            Friends who book together
            <br />
            save{" "}
            {/* Two wrappers, and both are needed — see the stylesheet. The outer holds
                the figure's SPACE in the line at exactly one line's height; the inner is
                the ticket itself, lifted out of the line box so it can be taller than the
                line and rotated without moving a single word around it.

                Inside: counterfoil, perforation, figure. The £ is put on the far side of
                the tear so the digits are what the eye lands on — and so the tear has
                something to actually separate. The rule is decorative and gets
                aria-hidden; the £ is not, so it stays in the accessible name and the
                headline still reads "save £400 together". */}
            <strong className={styles.amount}>
              <span className={styles.amountStamp}>
                <span className={styles.stub}>
                  <span className={styles.currency}>{CURRENCY}</span>
                </span>
                <span className={styles.tear} aria-hidden="true" />
                <span className={styles.figure}>{withCommas(totalSaving)}</span>
              </span>
            </strong>{" "}
            together
          </Reveal>

          {/* Says what the number in the headline is made of, which the old line
              ("get £50 cashback on every additional booking!") did not: it left the
              rate and the total looking like two unrelated figures, and "additional"
              implied the first booking was excluded. Stated as a per-student rate,
              the £400 above is something the reader can arrive at themselves. */}
          <Reveal as="p" className={styles.subtitle} delay={80}>
            The more friends you book with, the more you all get back —{" "}
            {money(SAVING_PER_STUDENT)} cashback for every student in the group.
          </Reveal>

          {/* The slider moved the headline but never said what it was set to — the
              track alone gives no read on the current count or the ceiling. */}
          <div className={styles.sliderMeta}>
            <span className={styles.sliderCount}>
              <AvatarStack count={groupSize} maxCount={MAX_GROUP} />
              <span>
                <strong className={styles.sliderCountValue}>{groupSize}</strong> friends
              </span>
            </span>
            <span className={styles.sliderMax}>Up to {MAX_GROUP}</span>
          </div>

          {/* Not wrapped in Reveal: the slider is the hero's control, so it should
              never be sitting at opacity 0 waiting on an observer. */}
          <div className={styles.sliderRow} style={{ "--fill": fill } as CSSProperties}>
            {/* Follows the thumb and surfaces on hover, focus or drag — the value is
                already spelled out above, so this is confirmation under the finger
                rather than the only place to read it. */}
            <span className={styles.bubble} aria-hidden="true">
              {groupSize}
            </span>

            <span className={styles.track} aria-hidden="true">
              <span className={styles.trackFill} />
            </span>

            {/* One pip per stop. The control is discrete — nine positions, not a
                continuum — and without them the track implies you can land
                anywhere. Each carries its own 0→1 position so the same
                thumb-travel maths that places the fill places these. */}
            <span className={styles.ticks} aria-hidden="true">
              {Array.from({ length: MAX_GROUP - MIN_GROUP + 1 }, (_, index) => (
                <span
                  key={index}
                  className={`${styles.tick} ${
                    MIN_GROUP + index <= groupSize ? styles.tickOn : ""
                  }`}
                  style={{ "--p": index / (MAX_GROUP - MIN_GROUP) } as CSSProperties}
                />
              ))}
            </span>
            <input
              className={styles.slider}
              type="range"
              min={MIN_GROUP}
              max={MAX_GROUP}
              step={1}
              value={groupSize}
              onChange={(event) => setGroupSize(Number(event.target.value))}
              aria-label="Number of friends booking with you"
              // Matches the visible copy — it read "students, saving" while the page
              // says friends and cashback.
              aria-valuetext={`${groupSize} friends, ${money(totalSaving)} saved together`}
              data-testid="group-booking-v2-alt-group-size"
            />
          </div>

          <div className={styles.ctaRow}>
            {/* Two classes, not one: `tryButton` keeps the gradient, the radius and
                the `color: #fff !important` guard, and `.cta` overrides only the
                SIZE. Growing tryButton itself would grow the navbar's own "Try
                amber" on every v2 page that shares it. */}
            <CustomLink
              href="/"
              className={`${navStyles.tryButton} ${styles.cta}`}
              dataTestId="group-booking-v2-alt-claim"
            >
              Claim group discount
            </CustomLink>
          </div>
        </div>

        {/* Sits after the copy in the DOM but to its left on screen, via `order: -1`
            on .photoSlot — the print opens the hero visually, but it's the headline
            that explains it, so a screen reader should reach that first.

            A figure/figcaption, not a div and a span: the caption in a Polaroid's
            bottom border IS a caption, and marking it as one keeps it attached to the
            image for anything reading the page rather than looking at it. */}
        <Reveal className={styles.photoSlot}>
          <figure className={styles.polaroid}>
            {/* The window. Its own element so the print's edge can carry a hairline
                the frame around it doesn't. */}
            <span className={styles.print}>
              <img
                className={styles.photo}
                src={photo}
                width={716}
                height={696}
                alt="Four friends sitting around a table in the kitchen of a shared flat"
                // The hero's own image, so it must not be lazy — deferring the one
                // thing above the fold is how you get a hole in the first paint.
                loading="eager"
                decoding="async"
                data-testid="group-booking-v2-alt-hero-photo"
              />
            </span>
            {/* Earns the wide bottom border, which is otherwise 117px of white slab on a
                white page. Set as a label rather than in a handwriting face: fake
                handwriting is the one thing that would tip this from "a print on the
                page" into novelty.

                Two lines, place over sentiment — the campus is the fact and gets the
                weight; "moved in together" is the caption under it. */}
            <figcaption className={styles.caption}>
              <span className={styles.place}>
                {/* A drawn pin rather than 📍, and not for purity: the emoji renders as a
                    bright red at a size where its detail is lost, which put a spot of a
                    red that ISN'T this page's red into an otherwise monochrome label —
                    and every platform draws it differently. An inline SVG inherits the
                    label's own grey and holds still across all of them. */}
                <svg
                  className={styles.pin}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.6A2.6 2.6 0 1 1 14.6 9 2.6 2.6 0 0 1 12 11.6z" />
                </svg>
                {CAMPUS}
              </span>
              <span className={styles.captionLabel}>Moved in together</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
};

export default wrapperHOC(Hero, {
  componentName: "Hero-GroupBookingV2Alt",
  showForChina: true,
});
