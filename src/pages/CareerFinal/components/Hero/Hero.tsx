import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import RolesButton from "../RolesButton/RolesButton";
import styles from "./Hero.module.scss";
// The hero paints full-bleed at 100vw before shrinking, so on a retina laptop it
// is asked for ~3000 device px. Encode the source as wide as it actually is —
// anything narrower is upscaled by the browser and reads soft. mozjpeg at q82+
// with 4:4:4 chroma holds up at that size; the byte cost is worth it on the one
// image above the fold. All six are 3:2, so `object-fit: cover` trims roughly
// 8% off the top and bottom inside the 16:9 hero frame.
import heroCampusImg from "../../assets/hero-campus.jpg";
import heroWalkImg from "../../assets/hero-walk.jpg";
import heroStreetImg from "../../assets/hero-street.jpg";
import heroCourtyardImg from "../../assets/hero-courtyard.jpg";
import heroPlazaImg from "../../assets/hero-plaza.jpg";
import heroColonnadeImg from "../../assets/hero-colonnade.jpg";

// Hero photo candidates, switchable from the floating control at the bottom of
// the page so the shot can be compared in place before one is committed to.
// Adding another option is one entry here; the switch sizes itself to the list.
const HERO_OPTIONS = [
  {
    id: "colonnade",
    label: "Colonnade",
    src: heroColonnadeImg,
    alt: "Two students walking and talking past the columns of a campus building",
  },
  {
    id: "campus-walk",
    label: "Campus walk",
    src: heroWalkImg,
    alt: "Two students walking and talking along a tree-lined campus path",
  },
  {
    id: "courtyard",
    label: "Courtyard",
    src: heroCourtyardImg,
    alt: "Two students working together over a laptop at an outdoor table in a campus courtyard",
  },
  {
    id: "plaza",
    label: "Plaza",
    src: heroPlazaImg,
    alt: "Three students greeting each other on a brick campus plaza, laptops under their arms",
  },
  {
    id: "campus",
    label: "Campus",
    src: heroCampusImg,
    alt: "Students talking on a campus bench under blossoming trees",
  },
  {
    id: "street",
    label: "Old town",
    src: heroStreetImg,
    alt: "A student in an amber hoodie walking a cobbled old-town street with her laptop",
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
