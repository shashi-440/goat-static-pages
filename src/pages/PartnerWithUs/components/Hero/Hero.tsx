import { useEffect, useRef } from "react";
import Image from "@Components/Image";
import CustomLink from "@Components/CustomLink";
// Shared with About Us / Scholarship rather than copied, so every v2 page uses
// one scroll-reveal.
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Hero.module.scss";
import heroPhoto from "../../assets/hero-bg.jpg";
import avatar1 from "../../assets/testimonial-avatar-1.png";
import avatar2 from "../../assets/testimonial-avatar-2.png";
import avatar3 from "../../assets/testimonial-avatar-3.png";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Hero — Figma node 2141:4336.
 *
 * Centred two-line headline, the lede + blue pill under it, then the 1200px photo.
 *
 * The node also put a "University Partners" logo strip inside the hero (2141:4368).
 * It is gone — removed by request — which is why the hero now ends on the photo.
 *
 * The headline carries an overlapping three-avatar cluster between "Your" and
 * "audience" — sitting in front of the noun the faces illustrate. They are the SAME three illustrations the
 * Testimonials section uses, imported from `assets/testimonial-avatar-*.png` rather
 * than a second set: a page showing one trio of faces in the hero and a different
 * trio further down reads as stock art in both places.
 */
const AVATARS = [avatar1, avatar2, avatar3];
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
          Your{" "}
          {/* Before the noun, not after the sentence. aria-hidden, and the headline
              reads correctly without it: the faces illustrate "audience", they do not
              add a word to the sentence. */}
          <span className={styles.avatars} aria-hidden="true">
            {AVATARS.map((src, i) => (
              <Image
                src={src}
                alt=""
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className={styles.avatar}
                width={44}
                height={44}
                isNotLazy
              />
            ))}
          </span>{" "}
          audience.
          <br />
          Our global housing network.
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
          alt="A student working at a desk in their room, with a laptop, notes and a shelf of books behind them"
          className={styles.photoImage}
          width="100%"
          height="100%"
          isEagerLoad
        />
      </div>
    </section>
  );
};

export default wrapperHOC(Hero, {
  componentName: "Hero-PartnerWithUs",
  showForChina: true,
});
