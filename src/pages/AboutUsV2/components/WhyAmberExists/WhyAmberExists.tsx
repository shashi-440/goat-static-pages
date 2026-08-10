import { useRef, useState } from "react";
import Image from "@Components/Image";
import Reveal from "../Reveal/Reveal";
import styles from "./WhyAmberExists.module.scss";
import lakeImg from "../../assets/why-1.jpg";
import coffeeImg from "../../assets/why-2.jpg";
import gardenImg from "../../assets/why-3.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

interface FlipCardProps {
  /** front-of-card question */
  question: string;
  /** back-of-card answer (JSX to allow the gradient "amber." highlight) */
  answer: JSX.Element;
  /** card height variant */
  size: "tall" | "short";
  /** horizontal alignment of the toggle button */
  align: "start" | "end";
}

// Max vertical tilt (deg) — reached near the very top / bottom edge.
const MAX_TILT = 12;

const FlipCard = ({ question, answer, size, align }: FlipCardProps) => {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const alignClass = align === "end" ? styles.toggleEnd : styles.toggleStart;

  // Vertical tilt that follows the cursor's height: hovering near the top tips
  // the card one way, near the bottom the opposite way — hinting the flip.
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || flipped) return;
    const r = el.getBoundingClientRect();
    const py = (e.clientY - r.top) / r.height - 0.5; // -0.5 (top) … 0.5 (bottom)
    // Top → tip back (positive rotateX), bottom → tip forward (negative).
    el.style.setProperty("--tilt-x", `${-py * MAX_TILT * 2}deg`);
  };
  const handleLeave = () => {
    cardRef.current?.style.setProperty("--tilt-x", "0deg");
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.flipCard} ${size === "tall" ? styles.cardTall : styles.cardShort}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className={styles.tilt}>
        <div className={`${styles.flipInner} ${flipped ? styles.isFlipped : ""}`}>
          {/* FRONT — question + plus */}
          <div className={`${styles.face} ${styles.front}`}>
            <p className={styles.cardText}>{question}</p>
            <div className={`${styles.toggleRow} ${alignClass}`}>
              <button
                type="button"
                className={`${styles.toggle} ${styles.toggleOpen}`}
                aria-label="Reveal answer"
                aria-expanded={flipped}
                onClick={() => setFlipped(true)}
              >
                <span className={styles.plus} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* BACK — answer + close */}
          <div className={`${styles.face} ${styles.back}`}>
            <p className={styles.answerText}>{answer}</p>
            <div className={`${styles.toggleRow} ${alignClass}`}>
              <button
                type="button"
                className={`${styles.toggle} ${styles.toggleClose}`}
                aria-label="Hide answer"
                aria-expanded={flipped}
                onClick={() => setFlipped(false)}
              >
                <span className={styles.cross} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// No data-nav-theme="dark" here, unlike CrewCTA: the band is light grey now, so the
// Navbar must keep its dark logo and dark links over it. Marking it would swap the
// header to its light treatment and leave a white logo on a near-white ground.
const WhyAmberExists = () => (
  <section className={styles.section}>
    <Reveal as="h2" className={styles.heading}>
      Why amber Exists
    </Reveal>

    <div className={styles.grid}>
      {/* Column 1 — text then image */}
      <Reveal className={styles.column} delay={0}>
        <FlipCard
          size="tall"
          align="start"
          question="Finding a home shouldn't be the hardest part of studying abroad."
          answer={
            <>
              So we exist to make every student&apos;s journey abroad simpler, safer, and more
              meaningful.
            </>
          }
        />
        <div className={`${styles.imageCard} ${styles.imageLandscape}`}>
          <Image
            src={lakeImg}
            alt="Three friends greeting each other outside a stone building"
            className={styles.image}
            width="100%"
            height="100%"
          />
        </div>
      </Reveal>

      {/* Column 2 — image then text */}
      <Reveal className={styles.column} delay={130}>
        <div className={`${styles.imageCard} ${styles.imageSquare}`}>
          <Image
            src={coffeeImg}
            alt="A student looking out the window from a cozy wooden study desk"
            className={styles.image}
            width="100%"
            height="100%"
          />
        </div>
        <FlipCard
          size="short"
          align="start"
          question="What made us believe there had to be a better way?"
          answer={
            <>
              In 2016, one near-scam showed us how broken student housing could be. So we decided to
              build the platform we wished we&apos;d had.
            </>
          }
        />
      </Reveal>

      {/* Column 3 — text then image */}
      <Reveal className={styles.column} delay={260}>
        <FlipCard
          size="tall"
          align="start"
          question="What if moving abroad felt like coming home?"
          answer={
            <>
              That&apos;s why we built <span className={styles.amber}>amber.</span> Verified homes,
              transparent pricing, and real people to help—so students feel at home before they even
              arrive.
            </>
          }
        />
        <div className={`${styles.imageCard} ${styles.imageLandscape}`}>
          <Image
            src={gardenImg}
            alt="Two smiling women enjoying coffee by a storefront window"
            className={styles.image}
            width="100%"
            height="100%"
          />
        </div>
      </Reveal>
    </div>
  </section>
);

export default wrapperHOC(WhyAmberExists, {
  componentName: "WhyAmberExists-AboutUsV2",
  showForChina: true,
});
