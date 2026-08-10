import { CSSProperties, useState } from "react";
import CustomLink from "@Components/CustomLink";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
// The navbar's gradient pill IS this page's CTA — same class, not a copy of its
// rules, so the two can't drift apart. It also carries the `color: #fff
// !important` guard the site's global `a:hover` rule needs.
import navStyles from "../../../AboutUsV2/components/Navbar/Navbar.module.scss";
import AvatarStack from "../AvatarStack/AvatarStack";
// The poster goes through the normal asset pipeline (jpg is covered by the loader
// rule, so it gets hashed and inlined-or-emitted like any image). The mp4 can't:
// webpack/base.config's asset rule only matches png|svg|jpe?g|gif. Rather than
// widen a shared build config for one page, the video rides on the
// CopyRspackPlugin pattern in webpack/server.config, which globs
// `src/pages/**/assets/*.*` — any extension — to /assets/images/pages/<path>.
// That's why this one path is a literal instead of an import.
import poster from "../../assets/hero-poster.jpg";
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

const VIDEO_SRC = "/assets/images/pages/GroupBookingV2Alt/assets/hero.mp4";

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
 * Group Booking hero, video variant — two columns: video left, copy right.
 *
 * Differs from the ticket version in two ways, and only those two: the visual is a
 * looping video instead of a 3D card, and the live total is back inside the headline
 * rather than being the card's payload. Everything else — the slider, the confetti
 * at maximum — is the same.
 *
 * The video is decorative and deliberately inert: it doesn't respond to the group
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
            <strong className={styles.amount}>
              {/* Symbol and digits split so the £ can be set down — at full size it
                  reads as another numeral and crowds the figure. */}
              <span className={styles.currency}>{CURRENCY}</span>
              {withCommas(totalSaving)}
            </strong>{" "}
            together
          </Reveal>

          <Reveal as="p" className={styles.subtitle} delay={80}>
            Book with a group and get {money(SAVING_PER_STUDENT)} cashback on every additional
            booking!
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
            <CustomLink
              href="/"
              className={navStyles.tryButton}
              dataTestId="group-booking-v2-alt-claim"
            >
              Claim group discount
            </CustomLink>
          </div>
        </div>

        {/* Sits after the copy in the DOM but to its left on screen, via `order: -1`
            on .videoSlot — the video opens the hero visually, but it's the headline
            that explains it, so a screen reader should reach that first. */}
        <Reveal className={styles.videoSlot}>
          {/*
            muted + playsInline are what make autoplay legal on iOS and in Chrome;
            without both, the browser blocks it and you get a frozen poster. The
            poster covers the gap before the first frame decodes. aria-hidden and no
            controls: it carries no information, so it shouldn't be a tab stop or a
            thing a screen reader announces.
          */}
          <video
            className={styles.video}
            src={VIDEO_SRC}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            data-testid="group-booking-v2-alt-hero-video"
          />
        </Reveal>
      </div>
    </section>
  );
};

export default wrapperHOC(Hero, {
  componentName: "Hero-GroupBookingV2Alt",
  showForChina: true,
});
