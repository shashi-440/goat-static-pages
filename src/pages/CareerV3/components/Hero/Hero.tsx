import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import CustomLink from "@Components/CustomLink";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Hero.module.scss";
// Reused from CareerV2 rather than duplicated — same 2400x1350 JPEG.
import heroImg from "../../../CareerV2/assets/hero.jpg";

// Distance (px) over which the hero image eases from full-bleed to contained.
const SHRINK_DISTANCE = 420;

/**
 * Section 1 — tagline + CTA.
 *
 * Hero line is split so "home" can carry its own emphasis, since the whole
 * proposition of the page hangs on that one word.
 */
const Hero = () => {
  const [mediaShown, setMediaShown] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);

  // On first load: reveal the hero image AFTER the title + button have shown.
  useEffect(() => {
    const t = window.setTimeout(() => setMediaShown(true), 350);
    return () => window.clearTimeout(t);
  }, []);

  // Hero image starts full-bleed and eases to its contained, rounded size over
  // the first ~420px of scroll. Driven by a CSS variable so the interpolation
  // lives in CSS; rAF-throttled. Same treatment as About Us v2 / Career v2.
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
    <section className={styles.hero}>
      <div className={styles.header}>
        <Reveal as="h1" className={styles.title}>
          We help students find <em className={styles.accent}>home</em>, before they find everything
          else
        </Reveal>
        <Reveal as="p" className={styles.subtitle} delay={100}>
          Grow fast, own big things, and do it with a team that&rsquo;s got your back. That&rsquo;s
          the amber way.
        </Reveal>
        <Reveal delay={180} className={styles.cta}>
          <CustomLink to="#open-roles" className={styles.button}>
            <span className={styles.buttonLabel}>Join the amber Fam</span>
            <svg
              className={styles.buttonArrow}
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 9h10M9.5 4.5L14 9l-4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </CustomLink>
        </Reveal>
      </div>

      <div ref={mediaRef} className={`${styles.media} ${mediaShown ? styles.mediaShown : ""}`}>
        <Image
          src={heroImg}
          alt="An amber team member working in a sunlit office lounge"
          className={styles.image}
          width="100%"
          height="100%"
          isEagerLoad
        />
      </div>
    </section>
  );
};

export default wrapperHOC(Hero, {
  componentName: "Hero-CareerV3",
  showForChina: true,
});
