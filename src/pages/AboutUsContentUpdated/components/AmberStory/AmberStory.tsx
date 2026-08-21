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
  /**
   * Month + year, matching the original About Us date line ("April 2016").
   * Months are chosen to space the milestones plausibly across each year — the
   * content deck supplies only years.
   */
  date: string;
  description: string;
}

// Copy per the content deck, structured like the original About Us cards: a date
// line then the body. The deck's headings now open the description rather than
// sitting on their own line. Timeline runs 2017 → 2019 → 2023 → 2025 → Today.
const CARDS: StoryCard[] = [
  {
    image: story1,
    date: "March 2017",
    description:
      "Where it all began. amber started with 25 people and one belief: no student should have to gamble on where they’ll live.",
  },
  {
    image: story2,
    date: "August 2019",
    description:
      "amber goes mobile. The amber app brought search, booking and roommate finding together in one place.",
  },
  {
    image: story3,
    date: "May 2023",
    description:
      "Going global. amber grew from a handful of cities into a global network spanning 250+ cities, 80 countries and 800+ partner universities.",
  },
  {
    image: story4,
    date: "January 2025",
    description:
      "2 million beds and counting. Today, amber connects students with 2M+ beds across 250+ cities, helping them find a place that feels like home.",
  },
  {
    image: story1,
    date: "Today",
    description:
      "2 million beds later. amber connects students with 2M+ beds across 250+ cities, helping them find a place they call home.",
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
        The amber story
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
                  alt=""
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
  componentName: "AmberStory-AboutUsContentUpdated",
  showForChina: true,
});
