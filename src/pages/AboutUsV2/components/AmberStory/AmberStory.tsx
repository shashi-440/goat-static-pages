import { useState } from "react";
import Image from "@Components/Image";
import Reveal from "../Reveal/Reveal";
import styles from "./AmberStory.module.scss";
import prevIcon from "../../assets/carousel-prev.svg";
import nextIcon from "../../assets/carousel-next.svg";
import story1 from "../../assets/story-1.jpg";
import story2 from "../../assets/story-2.jpg";
import story3 from "../../assets/story-3.jpg";
import story4 from "../../assets/story-4.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

interface StoryCard {
  image: string;
  date: string;
  description: string;
}

const CARDS: StoryCard[] = [
  {
    image: story1,
    date: "April 2016",
    description:
      "We kicked off Amber with a team of 25 to make finding student housing abroad a breeze and take the stress out of searching for a place to stay.",
  },
  {
    image: story2,
    date: "July 2017",
    description:
      "Our platform grew to support over 100 universities, with a dedicated team expanding our services to multiple countries, making international student housing even more accessible.",
  },
  {
    image: story3,
    date: "March 2019",
    description:
      "We launched our mobile app, allowing students to search and connect with potential roommates, streamlining their housing experience directly from their phones.",
  },
  {
    image: story4,
    date: "June 2020",
    description:
      "Introduced a new feature for virtual tours, enabling students to explore potential housing options remotely, enhancing accessibility during the pandemic.",
  },
  {
    image: story1,
    date: "February 2021",
    description:
      "Crossed one million beds listed across our platform, giving students more verified, trusted places to call home than ever before.",
  },
  {
    image: story2,
    date: "September 2022",
    description:
      "Opened new regional hubs and welcomed a fast-growing team, bringing local, on-the-ground support to students across more cities worldwide.",
  },
  {
    image: story3,
    date: "May 2023",
    description:
      "Rolled out instant booking and secure payments, making it faster and safer for students to lock in their home from anywhere in the world.",
  },
  {
    image: story4,
    date: "November 2025",
    description:
      "Reached 2 million+ beds across 250+ cities and 80+ countries, partnering with 800+ universities to help students settle in with confidence.",
  },
];

// Cards visible in the viewport at once; the track slides ONE card per click.
const PER_VIEW = 4;
const MAX_INDEX = Math.max(0, CARDS.length - PER_VIEW);

const AmberStory = () => {
  const [index, setIndex] = useState(0);

  const goPrev = () => setIndex((prev) => Math.max(0, prev - 1));
  const goNext = () => setIndex((prev) => Math.min(MAX_INDEX, prev + 1));

  return (
    <section className={styles.section}>
      <Reveal as="h2" className={styles.heading}>
        The Amber Story
      </Reveal>

      <Reveal className={styles.viewport} delay={120}>
        <div
          className={styles.track}
          // Slide by a single card: each step is one card-width + one gap.
          // `(100% + gap) / PER_VIEW` = one card-and-gap in viewport units.
          style={{
            transform: `translateX(calc(${-index} * (100% + var(--gap)) / var(--per-view)))`,
          }}
        >
          {CARDS.map((card) => (
            <article key={card.date} className={styles.card}>
              <div className={styles.cover}>
                <Image
                  src={card.image}
                  alt={card.date}
                  className={styles.coverImage}
                  width="100%"
                  height="100%"
                />
              </div>
              <div className={styles.body}>
                <span className={styles.date}>{card.date}</span>
                <p className={styles.description}>{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      <div className={styles.controls}>
        <div className={styles.dots}>
          {Array.from({ length: MAX_INDEX + 1 }).map((_, i) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to position ${i + 1}`}
              aria-current={i === index}
            />
          ))}
        </div>
        <button
          type="button"
          className={styles.navButton}
          onClick={goPrev}
          aria-label="Previous"
          disabled={index === 0}
        >
          <Image src={prevIcon} alt="" width={16} height={16} />
        </button>
        <button
          type="button"
          className={styles.navButton}
          onClick={goNext}
          aria-label="Next"
          disabled={index === MAX_INDEX}
        >
          <Image src={nextIcon} alt="" width={16} height={16} />
        </button>
      </div>
    </section>
  );
};

export default wrapperHOC(AmberStory, {
  componentName: "AmberStory-AboutUsV2",
  showForChina: true,
});
