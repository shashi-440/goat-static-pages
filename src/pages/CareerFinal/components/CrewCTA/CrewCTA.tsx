import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import RolesButton from "../RolesButton/RolesButton";
import styles from "./CrewCTA.module.scss";
// Five real teammates, no stock photography, and no face twice.
//
// Spread across offices and alternating so neither side of the fan is one region:
// Harshal (India), Mirna (Egypt), Bhanu (India, centre), Dan (China), Solomon
// (Nigeria).
//
// All five are real teammates. crew-3.jpg used to hold the centre, but it turned
// out to be a photo of Dan Teo — the same face as the circle to its right, which
// read as a duplicate even though the two files differ. Bhanu takes the centre
// instead.
//
// His crop is a separate 320px file rather than the shared 160px one: the centre
// circle renders at 123px, so a 160px crop is only 1.3x and visibly soft on a
// retina screen. 320 gives it 2.6x, matching what the smaller circles get from
// their own 160px crops.
import harshalImg from "../../assets/people/harshal-maniyar.jpg";
import mirnaImg from "../../assets/people/mirna-abdo.jpg";
import bhanuImg from "../../assets/people/bhanu-mahajan-lg.jpg";
import danImg from "../../assets/people/dan-teo.jpg";
import solomonImg from "../../assets/people/ajibode-solomon.jpg";

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
          <Image src={bhanuImg} alt="" className={styles.avatarImage} width={123} height={123} />
        </span>
        <span className={`${styles.avatar} ${styles.avatarMedium} ${styles.side} ${styles.right1}`}>
          <Image src={danImg} alt="" className={styles.avatarImage} width={90} height={90} />
        </span>
        <span className={`${styles.avatar} ${styles.avatarSmall} ${styles.side} ${styles.right2}`}>
          <Image src={solomonImg} alt="" className={styles.avatarImage} width={84} height={84} />
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
