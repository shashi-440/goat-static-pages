import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import { useCallback } from "react";
import CustomLink from "@Components/CustomLink";
import Reveal from "../Reveal/Reveal";
import styles from "./CrewCTA.module.scss";
// The same five real teammates the Career page's CrewCTA uses, so the two closing
// bands read as one site rather than one page having stock photography.
//
// Dan holds the centre. Around them: two from India (Harshal, Prachi) and two from
// elsewhere (Mirna, Michael), one man and one woman in each pair, alternating so
// neither side of the fan is a single region.
//
// Michael and not Solomon in the last slot: Solomon's photo has a near-black
// backdrop, which measures 16/255 at the crop's outer ring against this section's
// #0a0a0a (10) — the circle loses its edge and the face appears to float.
//
// Paths reach across into CareerFinal's assets rather than duplicating the files.
// The crops are shared, so a re-export lands on both pages at once.
import harshalImg from "../../../CareerFinal/assets/people/harshal-maniyar.jpg";
import mirnaImg from "../../../CareerFinal/assets/people/mirna-abdo.jpg";
import danImg from "../../../CareerFinal/assets/people/dan-teo-lg.jpg";
import prachiImg from "../../../CareerFinal/assets/people/prachi-kamble.jpg";
import michaelImg from "../../../CareerFinal/assets/people/adeniran-michael.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

const CrewCTA = () => {
  // Writes the cursor position to CSS custom properties for the button's
  // highlight. Straight to style rather than through state: a setState per
  // mousemove would re-render this tree ~60x a second for a value only CSS reads.
  const handleMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);

  // Park it centre on exit, so the next hover fades up from the middle rather
  // than snapping in from wherever the cursor last was.
  const handleLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  }, []);

  const avatarsRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  // Reveal the avatars from the centre outward when the cluster scrolls in.
  useEffect(() => {
    const node = avatarsRef.current;
    if (!node) return undefined;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} data-nav-theme="dark">
      <div ref={avatarsRef} className={`${styles.avatars} ${shown ? styles.avatarsShown : ""}`}>
        <span className={`${styles.avatar} ${styles.avatarSmall} ${styles.side} ${styles.left2}`}>
          <Image src={harshalImg} alt="" className={styles.avatarImage} width={84} height={84} />
        </span>
        <span className={`${styles.avatar} ${styles.avatarMedium} ${styles.side} ${styles.left1}`}>
          <Image src={mirnaImg} alt="" className={styles.avatarImage} width={90} height={90} />
        </span>
        <span className={`${styles.avatarCenter} ${styles.center}`}>
          <Image src={danImg} alt="" className={styles.avatarImage} width={123} height={123} />
        </span>
        <span className={`${styles.avatar} ${styles.avatarMedium} ${styles.side} ${styles.right1}`}>
          <Image src={prachiImg} alt="" className={styles.avatarImage} width={90} height={90} />
        </span>
        <span className={`${styles.avatar} ${styles.avatarSmall} ${styles.side} ${styles.right2}`}>
          <Image src={michaelImg} alt="" className={styles.avatarImage} width={84} height={84} />
        </span>
      </div>

      <div className={styles.copy}>
        <Reveal as="h2" className={styles.heading} delay={450}>
          Come join the amber crew.
        </Reveal>
        <Reveal as="p" className={styles.subtitle} delay={560}>
          Join a team of curious builders, creative thinkers, and passionate problem-solvers working
          together to
        </Reveal>
      </div>

      <Reveal delay={660}>
        <CustomLink
          href="/career"
          className={styles.button}
          dataTestId="about-us-v2-view-roles"
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        >
          View open roles
        </CustomLink>
      </Reveal>
    </section>
  );
};

export default wrapperHOC(CrewCTA, {
  componentName: "CrewCTA-AboutUsV2",
  showForChina: true,
});
