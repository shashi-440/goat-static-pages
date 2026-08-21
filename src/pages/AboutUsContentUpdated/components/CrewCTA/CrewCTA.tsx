import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import CustomLink from "@Components/CustomLink";
import Reveal from "../Reveal/Reveal";
import styles from "./CrewCTA.module.scss";
import crew1 from "../../assets/crew-1.jpg";
import crew2 from "../../assets/crew-2.jpg";
import crew3 from "../../assets/crew-3.jpg";
import crew4 from "../../assets/crew-4.jpg";
import crew5 from "../../assets/crew-5.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

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
    <section className={styles.section} data-nav-theme="dark">
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
          Come join the amber crew.
        </Reveal>
        <Reveal as="p" className={styles.subtitle} delay={560}>
          The work is getting students home before they arrive.
          <br />
          Come do it with us.
        </Reveal>
      </div>

      <Reveal delay={660}>
        <CustomLink href="/careers" className={styles.button} dataTestId="about-us-v2-view-roles">
          View open roles
        </CustomLink>
      </Reveal>
    </section>
  );
};

export default wrapperHOC(CrewCTA, {
  componentName: "CrewCTA-AboutUsContentUpdated",
  showForChina: true,
});
