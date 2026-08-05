import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import CustomLink from "@Components/CustomLink";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./CrewCTA.module.scss";
import crew1 from "../../../CareerV2/assets/crew-1.jpg";
import crew2 from "../../../CareerV2/assets/crew-2.jpg";
import crew3 from "../../../CareerV2/assets/crew-3.jpg";
import crew4 from "../../../CareerV2/assets/crew-4.jpg";
import crew5 from "../../../CareerV2/assets/crew-5.jpg";

/**
 * Closing CTA — "Join the amber Fam".
 *
 * Reuses the crew-avatar fan from About Us v2 / Career v2 (same five photos,
 * same centre-outward reveal) so the pages read as one site. Sits on white
 * rather than black, since the Benefits band directly above is already dark.
 */
const CrewCTA = () => {
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
    <section className={styles.section} id="open-roles">
      <div ref={avatarsRef} className={`${styles.avatars} ${shown ? styles.avatarsShown : ""}`}>
        <span className={`${styles.avatar} ${styles.avatarSmall} ${styles.side} ${styles.left2}`}>
          <Image src={crew1} alt="" className={styles.avatarImage} width={84} height={84} />
        </span>
        <span className={`${styles.avatar} ${styles.avatarMedium} ${styles.side} ${styles.left1}`}>
          <Image src={crew2} alt="" className={styles.avatarImage} width={90} height={90} />
        </span>
        <span className={`${styles.avatarCenter} ${styles.center}`}>
          <Image src={crew3} alt="" className={styles.avatarImage} width={123} height={123} />
        </span>
        <span className={`${styles.avatar} ${styles.avatarMedium} ${styles.side} ${styles.right1}`}>
          <Image src={crew4} alt="" className={styles.avatarImage} width={90} height={90} />
        </span>
        <span className={`${styles.avatar} ${styles.avatarSmall} ${styles.side} ${styles.right2}`}>
          <Image src={crew5} alt="" className={styles.avatarImage} width={84} height={84} />
        </span>
      </div>

      <div className={styles.copy}>
        <Reveal as="h2" className={styles.heading} delay={450}>
          Join the amber Fam
        </Reveal>
        <Reveal as="p" className={styles.subtitle} delay={560}>
          Grow fast, own big things, and do it with a team that&rsquo;s got your back.
        </Reveal>
      </div>

      <Reveal delay={660}>
        <CustomLink to="/careers" className={styles.button}>
          <span className={styles.buttonLabel}>Join the team</span>
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
    </section>
  );
};

export default wrapperHOC(CrewCTA, {
  componentName: "CrewCTA-CareerV3",
  showForChina: true,
});
