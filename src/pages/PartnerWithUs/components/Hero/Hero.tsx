import { useEffect, useRef } from "react";
import Image from "@Components/Image";
import CustomLink from "@Components/CustomLink";
import { UniversityPartners } from "../LogoStrip/LogoStrip";
// Shared with About Us / Scholarship rather than copied, so every v2 page uses
// one scroll-reveal.
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Hero.module.scss";
import heroPhoto from "../../assets/hero-bg.jpg";
import avatar1 from "../../assets/avatar-1.jpg";
import avatar2 from "../../assets/avatar-2.jpg";
import avatar3 from "../../assets/avatar-3.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Hero — Figma node 2141:4336.
 *
 * Centred headline with an overlapping avatar cluster sitting inline on the
 * second line, the lede + blue pill under it, then the 1200px photo and the
 * university logo strip. The strip lives inside the hero in this design rather
 * than in a section of its own.
 *
 * The design positions the avatar cluster absolutely into a run of spaces in the
 * headline; here it is a real inline element between "get" and "global", so the
 * gap stays correct when the headline rewraps.
 */
const AVATARS = [
  // Each avatar carries its own crop from the node — the source photos are not
  // framed identically, so one shared object-position would misalign the faces.
  { src: avatar1, alt: "", left: "-7.5%", top: "-7.5%", size: "115%" },
  { src: avatar2, alt: "", left: "-17%", top: "-19.74%", size: "134%" },
  { src: avatar3, alt: "", left: "0.18%", top: "2.56%", size: "100%" },
];

// Distance (px) over which the hero image eases from full-bleed to contained.
// Same value as the About Us hero, so the two pages scroll identically.
const SHRINK_DISTANCE = 420;

const Hero = () => {
  const mediaRef = useRef<HTMLDivElement>(null);

  // Hero image: starts full-bleed (edge-to-edge) and eases to its contained,
  // rounded size as the user scrolls down the first ~420px. Driven by a CSS
  // variable so the interpolation lives in CSS; rAF-throttled for smoothness.
  // Ported from AboutUsV2's Hero — same effect, this page's own column width.
  useEffect(() => {
    const node = mediaRef.current;
    if (!node) return undefined;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.setProperty("--shrink", "1");
      return undefined;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / SHRINK_DISTANCE));
      node.style.setProperty("--shrink", String(progress));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    // The header watches for this attribute to know when the hero is half past,
    // which is when its CTA appears in the bar. Same trick as the About Us
    // navbar's data-nav-theme sections.
    <section className={styles.hero} data-pwu-hero>
      <div className={styles.heroRow}>
        <Reveal as="h1" className={styles.title}>
          Partner with amber student
          <br />
          get{" "}
          <span className={styles.avatars} aria-hidden="true">
            {AVATARS.map((avatar, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <span className={styles.avatar} key={i}>
                <img
                  src={avatar.src}
                  alt=""
                  className={styles.avatarImage}
                  style={{
                    left: avatar.left,
                    top: avatar.top,
                    width: avatar.size,
                    height: avatar.size,
                  }}
                />
              </span>
            ))}
          </span>{" "}
          global access
        </Reveal>

        <Reveal className={styles.lede} delay={120}>
          <p className={styles.subtitle}>
            Make the most out of this partnership and avail the benefits
          </p>
          {/* Figma labels this pill "List on amber", which is the List With Us
              call to action — this page is aimed at agents and partners, and its
              own closing card says "Partner with us". All three pills match. */}
          <CustomLink href="/" className={styles.cta} dataTestId="partner-with-us-hero-cta">
            Partner with us
          </CustomLink>
        </Reveal>
      </div>

      <div ref={mediaRef} className={styles.photo}>
        <Image
          src={heroPhoto}
          alt="Students sharing a meal around the table of a sunlit student apartment"
          className={styles.photoImage}
          width="100%"
          height="100%"
          isEagerLoad
        />
      </div>

      <UniversityPartners />
    </section>
  );
};

export default wrapperHOC(Hero, {
  componentName: "Hero-PartnerWithUs",
  showForChina: true,
});
