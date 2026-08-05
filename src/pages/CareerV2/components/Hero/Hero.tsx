import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import RolesButton from "../RolesButton/RolesButton";
import styles from "./Hero.module.scss";
// 2432x1368 (16:9) JPEG — the hero goes full-bleed at 100vw before shrinking,
// so it needs the extra width; JPEG keeps it at 767KB instead of 6MB.
import heroImg from "../../assets/hero.jpg";

// Distance (px) over which the hero image eases from full-bleed to contained.
const SHRINK_DISTANCE = 420;

const Hero = () => {
  const [mediaShown, setMediaShown] = useState(false);
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
          Build the future of student living
        </Reveal>
        <Reveal delay={120} className={styles.cta}>
          <RolesButton variant="primary" />
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
  componentName: "Hero-CareerV2",
  showForChina: true,
});
