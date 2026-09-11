import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import RolesButton from "../RolesButton/RolesButton";
import styles from "./Hero.module.scss";
// 16:9 JPEGs — the hero goes full-bleed at 100vw before shrinking, so it needs
// the width; JPEG keeps each one under 500KB instead of several MB.
import heroImg from "../../assets/hero.jpg";
import heroNeonImg from "../../assets/hero-neon.jpg";
// 3:2 rather than 16:9 like the other two, so `object-fit: cover` trims roughly
// 8% off the top and bottom of this one inside the hero frame.
import heroCampusImg from "../../assets/hero-campus.jpg";

// Hero photo candidates, switchable from the floating control at the bottom of
// the page so the shot can be compared in place before one is committed to.
// Adding another option is one entry here; the switch sizes itself to the list.
const HERO_OPTIONS = [
  {
    id: "campus",
    label: "Campus",
    src: heroCampusImg,
    alt: "Students talking on a campus bench under blossoming trees",
  },
  {
    id: "open-floor",
    label: "Open floor",
    src: heroImg,
    alt: "An amber team member working at a laptop in the open-plan office",
  },
  {
    id: "neon",
    label: "Neon desk",
    src: heroNeonImg,
    alt: "Two amber teammates working together under a neon 'Believe in your dreams' sign",
  },
];

// Distance (px) over which the hero image eases from full-bleed to contained.
const SHRINK_DISTANCE = 420;

const Hero = () => {
  const [mediaShown, setMediaShown] = useState(false);
  const [heroOption, setHeroOption] = useState(0);
  const mediaRef = useRef<HTMLDivElement>(null);

  // On first load: reveal the hero image AFTER the title + button have shown.
  useEffect(() => {
    const t = window.setTimeout(() => setMediaShown(true), 350);
    return () => window.clearTimeout(t);
  }, []);

  // Hero image: starts full-bleed (edge-to-edge) and eases to its contained,
  // rounded size as the user scrolls down the first ~420px. Driven by a CSS
  // variable so the interpolation lives in CSS; rAF-throttled for smoothness.
  // Same treatment as the About Us v2 hero.
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
          {/* Explicit break so the second sentence always starts its own line,
              rather than wherever the measure happens to put it. */}
          Help millions find their place.
          <br />
          Find yours with us.
        </Reveal>
        <Reveal delay={120} className={styles.cta}>
          <RolesButton variant="primary" />
        </Reveal>
      </div>

      <div ref={mediaRef} className={`${styles.media} ${mediaShown ? styles.mediaShown : ""}`}>
        <Image
          key={HERO_OPTIONS[heroOption].id}
          src={HERO_OPTIONS[heroOption].src}
          alt={HERO_OPTIONS[heroOption].alt}
          className={styles.image}
          width="100%"
          height="100%"
          isEagerLoad
        />
      </div>

      {/* Deliberately low-contrast: a review aid that sits over the page
          without competing with it. Comes up to full opacity on hover/focus. */}
      <div className={styles.switch} role="group" aria-label="Hero image option">
        {HERO_OPTIONS.map((option, index) => (
          <button
            key={option.id}
            type="button"
            className={`${styles.switchOption} ${index === heroOption ? styles.switchOptionActive : ""}`}
            aria-pressed={index === heroOption}
            onClick={() => setHeroOption(index)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default wrapperHOC(Hero, {
  componentName: "Hero-CareerFinal",
  showForChina: true,
});
