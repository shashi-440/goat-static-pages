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
  /** back-of-card answer (JSX to allow the gradient "Amber." highlight) */
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

// No `data-nav-theme="dark"`: the section is now a light grey tint, so the navbar
// must keep its normal dark logo and links over it. The flag is what flips the
// header to its white treatment (see Navbar.tsx), and leaving it on would make the
// header invisible against this background.
const WhyAmberExists = () => (
  <section className={styles.section}>
    <Reveal as="h2" className={styles.heading}>
      Why amber exists
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
              You worked years for the acceptance letter. Finding where you&apos;ll live
              shouldn&apos;t take months.
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
          question="Home is the one thing you can't inspect from 4,000 miles away."
          answer={<>So we verify it for you. Real rooms, real buildings, real operators.</>}
        />
      </Reveal>

      {/* Column 3 — text then image */}
      <Reveal className={styles.column} delay={260}>
        <FlipCard
          size="tall"
          align="start"
          question="What if moving abroad felt a little more like coming home?"
          answer={
            <>
              Your room is ready, your keys are waiting and our team is available 24/7 when you need
              us. That&apos;s <span className={styles.amber}>amber.</span>
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
  componentName: "WhyAmberExists-AboutUsContentUpdated",
  showForChina: true,
});
