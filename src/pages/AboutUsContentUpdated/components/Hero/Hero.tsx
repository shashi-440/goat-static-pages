import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import Reveal from "../Reveal/Reveal";
import TitleStamp from "../TitleStamp/TitleStamp";
import styles from "./Hero.module.scss";
import heroImg from "../../assets/hero.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

// Distance (px) over which the hero image eases from full-bleed to contained.
const SHRINK_DISTANCE = 420;

const Hero = () => {
  const [mediaShown, setMediaShown] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);

  // On first load: reveal the hero image AFTER the title + subtitle have shown.
  useEffect(() => {
    const t = window.setTimeout(() => setMediaShown(true), 350);
    return () => window.clearTimeout(t);
  }, []);

  // Hero image: starts full-bleed (edge-to-edge) and eases to its contained,
  // rounded size as the user scrolls down the first ~420px. Driven by a CSS
  // variable so the interpolation lives in CSS; rAF-throttled for smoothness.
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
        {/* The stamp sits where the deck marks "[image]" — between "Global" and
            "student housing" — so the cycling city photos land mid-headline. */}
        <Reveal as="h1" className={styles.title}>
          Shaping the future of
          <br />
          Global
          <TitleStamp />
          student housing
        </Reveal>
        <Reveal as="p" className={styles.subtitle} delay={120}>
          We help you find it again, in 250+ cities worldwide
        </Reveal>
      </div>

      <div ref={mediaRef} className={`${styles.media} ${mediaShown ? styles.mediaShown : ""}`}>
        <Image
          src={heroImg}
          alt="Students relaxing together at home"
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
  componentName: "Hero-AboutUsContentUpdated",
  showForChina: true,
});
