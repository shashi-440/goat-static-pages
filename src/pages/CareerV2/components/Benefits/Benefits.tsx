import { useCallback, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import RolesButton from "../RolesButton/RolesButton";
import CarouselControls from "../CarouselControls/CarouselControls";
import styles from "./Benefits.module.scss";
import rewardsImg from "../../assets/benefit-rewards.jpg";
import celebrateImg from "../../assets/benefit-celebrate.jpg";
import timeImg from "../../assets/benefit-time.jpg";
import learningImg from "../../assets/benefit-learning.jpg";
import aiImg from "../../assets/benefit-ai.jpg";

interface Benefit {
  title: string;
  /** Bold opening sentence. Only some slides have one in the design. */
  lead?: string;
  body: string;
  image: string;
  alt: string;
}

// Content and per-slide art from Figma 2853:17475 — five frames, one per slide,
// each with its own photo and copy.
const BENEFITS: Benefit[] = [
  {
    title: "Rewards & Recognition",
    lead: "We're not going to be weird about money.",
    body: "Competitive salaries, bonuses/incentives, insurance, Meals, rewards & recognition, cab reimbursements, relocation assistance",
    image: rewardsImg,
    alt: "An amber team member speaking at a company meetup",
  },
  {
    title: "Celebrate Together",
    body: "From festivals and cultural celebrations to team experiences and everyday moments, we make space for people to connect, celebrate, and enjoy the journey together.",
    image: celebrateImg,
    alt: "Colleagues raising a toast together at a celebration",
  },
  {
    title: "Take your time",
    body: "Leaves- Paternity, maternity, adoption, bereavement, wellness, period leave for female employees, flexi culture- few days work from home",
    image: timeImg,
    alt: "A parent and child picking strawberries in a garden",
  },
  {
    title: "Learning & Growth",
    body: "Ownership, autonomy, and a flat organisation mean you'll learn directly from leaders, take on meaningful challenges early, and grow through impact—not tenure.",
    image: learningImg,
    alt: "Two colleagues laughing over a laptop in a library",
  },
  {
    title: "Build with AI",
    lead: "AI is part of how we build every day.",
    body: "Whether you're designing, coding, writing, or solving operational challenges, you'll have access to modern AI tools that help you move faster, experiment more, and focus on meaningful work.",
    image: aiImg,
    alt: "Someone working thoughtfully at a laptop by a window at dusk",
  },
];

/**
 * Dark "Benefits of working at Amber" band (Figma 2665:13571).
 *
 * The five titles on the left double as the carousel nav — the active one is
 * white, the rest neutral/500. Clicking a title, a dot, or an arrow moves the
 * slide, which swaps the copy on the right.
 */
const Benefits = () => {
  const [active, setActive] = useState(0);

  const go = useCallback((next: number) => {
    // Wrap at both ends so the arrows never dead-end.
    setActive((prev) => {
      const total = BENEFITS.length;
      return typeof next === "number" ? (next + total) % total : prev;
    });
  }, []);

  const current = BENEFITS[active];

  // Solid #151515 throughout, so data-nav-theme="dark" makes the shared Navbar
  // swap to its light logo and white links for the whole section.
  return (
    <section className={styles.section} data-nav-theme="dark">
      <Reveal className={styles.header}>
        <h2 className={styles.title}>Benefits of working at Amber</h2>
        <p className={styles.subtitle}>
          No ping pong tables or bean bag chairs, just benefits you actually want
        </p>
      </Reveal>

      <div className={styles.body}>
        <div className={styles.grid}>
          <ul className={styles.titles}>
            {BENEFITS.map((benefit, i) => (
              <li key={benefit.title}>
                <button
                  type="button"
                  className={`${styles.titleButton} ${i === active ? styles.titleActive : ""}`}
                  onClick={() => go(i)}
                  aria-current={i === active}
                >
                  {benefit.title}
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.mediaColumn}>
            <div className={styles.media}>
              {/* `key` forces a fresh <img> per slide so the swap is a clean cut
                  rather than the previous photo lingering while the new one loads. */}
              <Image
                key={current.image}
                src={current.image}
                alt={current.alt}
                className={styles.image}
                width="100%"
                height="100%"
              />
            </div>
          </div>

          <div className={styles.copy}>
            <p className={styles.copyText}>
              {/* Not every slide has a bold lead sentence in the design. */}
              {current.lead ? <span className={styles.copyLead}>{current.lead} </span> : null}
              {current.body}
            </p>
            <RolesButton />
          </div>
        </div>

        <CarouselControls
          count={BENEFITS.length}
          active={active}
          onSelect={go}
          onPrev={() => go(active - 1)}
          onNext={() => go(active + 1)}
          theme="dark"
          label="benefit"
        />
      </div>
    </section>
  );
};

export default wrapperHOC(Benefits, {
  componentName: "Benefits-CareerV2",
  showForChina: true,
});
