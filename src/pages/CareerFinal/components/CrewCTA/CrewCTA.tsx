import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import RolesButton from "../RolesButton/RolesButton";
import styles from "./CrewCTA.module.scss";
// The outer four are real teammates — two from India, two from elsewhere — so the
// cluster reads as this team rather than as stock photography. Two of each, and
// alternating across the fan (IN, non-IN, ?, non-IN, IN) so neither side is all
// one office.
//
// The centre keeps crew-3.jpg: it is the largest circle at 123px and the only one
// shot square-on at that size, and the real headshots are 160px crops that would
// soften noticeably scaled up to it.
import harshalImg from "../../assets/people/harshal-maniyar.jpg";
import mirnaImg from "../../assets/people/mirna-abdo.jpg";
import crew3 from "../../assets/crew-3.jpg";
import danImg from "../../assets/people/dan-teo.jpg";
import prachiImg from "../../assets/people/prachi-kamble.jpg";

/**
 * Closing black CTA band (Figma 2665:13697), reusing AboutUsV2's CrewCTA
 * treatment: five faces, the same centre-outward fan reveal, and
 * the same plain (unringed) centre avatar, so the two pages read as one site.
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
    <section className={styles.section} id="open-roles" data-nav-theme="dark">
      <div ref={avatarsRef} className={`${styles.avatars} ${shown ? styles.avatarsShown : ""}`}>
        <span className={`${styles.avatar} ${styles.avatarSmall} ${styles.side} ${styles.left2}`}>
          <Image src={harshalImg} alt="" className={styles.avatarImage} width={84} height={84} />
        </span>
        <span className={`${styles.avatar} ${styles.avatarMedium} ${styles.side} ${styles.left1}`}>
          <Image src={mirnaImg} alt="" className={styles.avatarImage} width={90} height={90} />
        </span>
        <span className={`${styles.avatarCenter} ${styles.center}`}>
          <Image src={crew3} alt="" className={styles.avatarImage} width={123} height={123} />
        </span>
        <span className={`${styles.avatar} ${styles.avatarMedium} ${styles.side} ${styles.right1}`}>
          <Image src={danImg} alt="" className={styles.avatarImage} width={90} height={90} />
        </span>
        <span className={`${styles.avatar} ${styles.avatarSmall} ${styles.side} ${styles.right2}`}>
          <Image src={prachiImg} alt="" className={styles.avatarImage} width={84} height={84} />
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
        <RolesButton variant="solid" />
      </Reveal>
    </section>
  );
};

export default wrapperHOC(CrewCTA, {
  componentName: "CrewCTA-CareerFinal",
  showForChina: true,
});
