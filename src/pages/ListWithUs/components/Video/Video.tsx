import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Video.module.scss";
import backdrop from "../../assets/video-backdrop.jpg";
import playButton from "../../assets/icons/play-button.svg";
import progressKnob from "../../assets/icons/progress-knob.svg";
import iconPlay from "../../assets/icons/icon-play.svg";
import iconVolume from "../../assets/icons/icon-volume.svg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Begin your journey with amber" — Figma node 2456:6596.
 *
 * A full-bleed photo band runs behind the section, washed out top and bottom and
 * faded to white on the left so the heading stays readable. The player is a
 * still mock-up, matching the design: chrome, scrub bar and controls are drawn,
 * not wired to a video.
 */
const Video = () => (
  <section className={styles.section}>
    <div className={styles.band} aria-hidden="true">
      <Image
        src={backdrop}
        alt=""
        className={styles.bandImage}
        width="100%"
        height="100%"
      />
      <span className={styles.bandWash} />
    </div>
    <span className={styles.bandLeftFade} aria-hidden="true" />

    <div className={styles.row}>
      <Reveal className={styles.heading}>
        <h2 className={styles.title}>Begin your journey with amber</h2>
      </Reveal>

      <div className={styles.media}>
        <div className={styles.card}>
          <span className={styles.thumbnail} aria-hidden="true" />
          <span className={styles.chromeScrim} aria-hidden="true" />

          <div className={styles.centre}>
            <p className={styles.centreLabel}>Grow with us</p>
            <span className={styles.play}>
              <img src={playButton} alt="" className={styles.playIcon} />
            </span>
          </div>

          <div className={styles.controls}>
            <span className={styles.progressTrack} />
            <span className={styles.progressPlayed} />
            <img src={progressKnob} alt="" className={styles.progressKnob} />

            <div className={styles.controlsLeft}>
              <img src={iconPlay} alt="" className={styles.controlIconPlay} />
              <img src={iconVolume} alt="" className={styles.controlIconVolume} />
              <span className={styles.time}>0:34 / 2:06</span>
            </div>

            <div className={styles.controlsRight}>
              <span className={styles.pill}>CC</span>
              <span className={styles.pill}>1080p</span>
              {/* Four corner brackets, built from eight bars as in the design. */}
              <span className={styles.fullscreen}>
                <span className={styles.fsTopLeftH} />
                <span className={styles.fsTopLeftV} />
                <span className={styles.fsTopRightH} />
                <span className={styles.fsTopRightV} />
                <span className={styles.fsBottomLeftH} />
                <span className={styles.fsBottomLeftV} />
                <span className={styles.fsBottomRightH} />
                <span className={styles.fsBottomRightV} />
              </span>
            </div>
          </div>
        </div>

        <Reveal as="p" className={styles.caption} delay={120}>
          Gain a competitive edge in student housing with amber&apos;s real-time analytics and
          insights. List with us for hassle free tenant acquisition, higher conversions, and
          increased revenue!
        </Reveal>
      </div>
    </div>
  </section>
);

export default wrapperHOC(Video, {
  componentName: "Video-ListWithUs",
  showForChina: true,
});
