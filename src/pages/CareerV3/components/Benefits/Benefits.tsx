import { Fragment, useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import LottieIcon, { LottieIconHandle } from "../../../CareerV2/components/LottieIcon/LottieIcon";
import styles from "./Benefits.module.scss";
// Purpose-made icons for this section. The CareerV2 set (rocket / globe / cap /
// magnifier) was built for CoreValues and had no bearing on salary, celebration,
// leave or autonomy — it was assigned by what happened to exist.
//
// Recoloured on import: the source art is black line work with red accents, so
// black was mapped to white and the reds to the brand pink. A blanket CSS
// `brightness(0) invert(1)` would have flattened all four of party's colours to
// one white blob and lost its particles.
import shieldAnim from "../../assets/lottie/shield.json";
import partyAnim from "../../assets/lottie/party.json";
import heartBagAnim from "../../assets/lottie/heart-bag.json";
import cupAnim from "../../assets/lottie/cup.json";
// Photos shared with CareerV2's Benefits carousel rather than duplicated.
import rewardsImg from "../../../CareerV2/assets/benefit-rewards.jpg";
import celebrateImg from "../../../CareerV2/assets/benefit-celebrate.jpg";
import timeImg from "../../../CareerV2/assets/benefit-time.jpg";
import learningImg from "../../../CareerV2/assets/benefit-learning.jpg";

interface Promise {
  icon: unknown;
  title: string;
  body: string;
  image: string;
  alt: string;
}

// Copy exactly as supplied by the content team.
const PROMISES: Promise[] = [
  {
    icon: shieldAnim,
    title: "You can count on us",
    body:
      "A salary that respects the work, real bonuses and recognition, insurance that actually " +
      "covers what matters, meals, cab support, and help settling in if the job means a new city.",
    image: rewardsImg,
    alt: "An amber team member speaking at a company meetup",
  },
  {
    icon: partyAnim,
    title: "You never miss a moment worth celebrating",
    body:
      "Every festival, every background, every reason to mark the day — alongside the small " +
      "everyday things that make work feel less like work.",
    image: celebrateImg,
    alt: "Colleagues raising a toast together at a celebration",
  },
  {
    icon: heartBagAnim,
    title: "You get time, when life needs it",
    body:
      "Paternity, maternity, adoption, bereavement, wellness leave, period leave, and a " +
      "flexi-culture that lets you work from home when you need to — because life doesn’t pause " +
      "just because it’s a Tuesday.",
    image: timeImg,
    alt: "A parent and child picking strawberries in a garden",
  },
  {
    icon: cupAnim,
    title: "You get room to grow, your way",
    body:
      "A flat, open team where ownership matters more than tenure, autonomy is real, and you get " +
      "to learn directly from the people leading the company — not wait your turn.",
    image: learningImg,
    alt: "Two colleagues laughing over a laptop in a library",
  },
];

/**
 * "What you get, working here" — laid out like ScholarshipV2's Categories
 * section: heading across the top, media on the left, and the titled list on the
 * right, both starting on the same grid row so the list aligns with the top of
 * the image rather than the heading above it.
 *
 * Hovering a row swaps the photo and opens that row's body; the others collapse.
 * The images are stacked and cross-faded rather than swapped, so there is never a
 * frame with nothing painted, and mounting them all means no hover waits on a
 * network fetch.
 */
// Gap between each row's entrance, in ms.
const STAGGER = 150;

const Benefits = () => {
  const [active, setActive] = useState(0);
  // How many rows have entered. Drives the staggered scroll-in.
  const [revealed, setRevealed] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const iconRefs = useRef<(LottieIconHandle | null)[]>([]);

  // Scroll-in: reveal the rows one after another, each firing its icon once as
  // it lands. Runs a single time — re-triggering on every pass would replay the
  // whole sequence while someone is reading.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(PROMISES.length);
      return undefined;
    }

    const timers: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        PROMISES.forEach((_, i) => {
          timers.push(
            window.setTimeout(
              () => {
                setRevealed(i + 1);
                // Fire this row's icon as it arrives, not all four at once.
                iconRefs.current[i]?.replay();
              },
              // The lead-in matters: LottieIcon imports lottie-web dynamically,
              // so `replay()` is a no-op until that resolves. Without it the
              // first icon silently skips its animation on a fast scroll-in.
              120 + i * STAGGER,
            ),
          );
        });
      },
      { threshold: 0.2 },
    );

    io.observe(node);
    return () => {
      io.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  // Hovering a row opens its body, swaps the photo, and replays its icon — the
  // icon has to be driven imperatively because `play` only fires on a false→true
  // edge, so re-entering an already-played row would do nothing.
  const selectRow = (i: number) => {
    setActive(i);
    iconRefs.current[i]?.replay();
  };

  return (
    <section ref={sectionRef} className={styles.section} data-nav-theme="dark">
      <div className={styles.inner}>
        <Reveal className={styles.top}>
          <h2 className={styles.heading}>
            What you get, working here
            <br />
            <span className={styles.headingMuted}>
              A place that takes care of people the same way we ask our teams to take care of
              students.
            </span>
          </h2>

          <div className={styles.feature}>
            {PROMISES.map((promise, i) => (
              <div
                key={promise.title}
                className={`${styles.slide} ${i === active ? styles.slideActive : ""}`}
                aria-hidden={i !== active}
              >
                <Image
                  src={promise.image}
                  alt={i === active ? promise.alt : ""}
                  className={styles.featureImage}
                  width="100%"
                  height="100%"
                  isEagerLoad
                />
              </div>
            ))}
          </div>

          <div className={styles.list}>
            {PROMISES.map((promise, i) => (
              <Fragment key={promise.title}>
                {i > 0 ? <span className={styles.hRule} aria-hidden="true" /> : null}
                <button
                  type="button"
                  className={`${styles.row} ${i === active ? styles.rowActive : ""} ${
                    i < revealed ? styles.rowShown : ""
                  }`}
                  // Matches the icon timer's lead-in below, so each row's slide-up
                  // and its icon fire together rather than 120ms apart.
                  style={{ transitionDelay: `${120 + i * STAGGER}ms` }}
                  onMouseEnter={() => selectRow(i)}
                  onFocus={() => selectRow(i)}
                  aria-label={`Show ${promise.title}`}
                >
                  <span className={styles.iconSlot} aria-hidden="true">
                    {/* Played imperatively via the ref (see `selectRow`) so it can
                        replay on every hover, not only the first. */}
                    <LottieIcon
                      ref={(el) => {
                        iconRefs.current[i] = el;
                      }}
                      animationData={promise.icon}
                      size={28}
                    />
                  </span>
                  <span className={styles.rowText}>
                    <span className={styles.rowTitle}>{promise.title}</span>
                    {/* Accordion body. Height is animated via a grid track rather
                        than max-height, which would need a guessed value and
                        either clip long copy or ease against empty space. */}
                    <span className={styles.rowBodyWrap}>
                      <span className={styles.rowDesc}>{promise.body}</span>
                    </span>
                  </span>
                </button>
              </Fragment>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default wrapperHOC(Benefits, {
  componentName: "Benefits-CareerV3",
  showForChina: true,
});
