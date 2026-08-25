import { useEffect, useRef, useState } from "react";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import LottieIcon, { LottieIconHandle } from "../LottieIcon/LottieIcon";
import styles from "./Benefits.module.scss";
// One icon per benefit, from the set this page already uses.
//
// FOUR OF THESE FILES ARE UNUSABLE: heart-bag, cup, party and shield render
// nothing — sampled at frames 20 through 89, every one is blank, so they are
// broken exports rather than mis-timed animations. (LottieIcon parks on the last
// frame, which is why the first attempt here showed only two of six icons.) The
// working set is ai-brain, ai-chip, flash, globe, graduation, rocket, search,
// shield-key, stopwatch-speed, user-ai and users-ai; these six are drawn from it.
import usersAiAnim from "../../assets/lottie/users-ai.json";
import rocketAnim from "../../assets/lottie/rocket.json";
import userAiAnim from "../../assets/lottie/user-ai.json";
import shieldKeyAnim from "../../assets/lottie/shield-key.json";
import stopwatchAnim from "../../assets/lottie/stopwatch-speed.json";
import graduationAnim from "../../assets/lottie/graduation.json";

interface Benefit {
  title: string;
  body: string;
  icon: any;
}

// Copy is deliberately short — two lines a card, not five.
//
// The previous bodies were the full policy text (the Health card ran to four
// sentences and 280 characters), which made the tallest card three times the
// shortest and left the short ones carrying a block of dead space. Each is now
// the one thing a candidate actually wants to know, and the detail belongs in an
// offer letter rather than a careers page.
const BENEFITS: Benefit[] = [
  {
    title: "Health & Wellbeing",
    body:
      "Medical, dental and vision cover for you and your dependents, plus therapy and mental " +
      "health support when you need it.",
    icon: usersAiAnim,
  },
  {
    title: "Everyday Life",
    body:
      "A monthly lifestyle stipend, commuter and phone allowances, and lunch and snacks on the " +
      "house.",
    icon: rocketAnim,
  },
  {
    title: "Family Support",
    body:
      "Paid parental leave for biological, adoptive and foster parents, with support for your " +
      "path to parenthood.",
    icon: userAiAnim,
  },
  {
    title: "Financial Future",
    body:
      "Retirement and pension plans with a company match, and help navigating equity and " +
      "financial planning.",
    icon: shieldKeyAnim,
  },
  {
    title: "Time Away",
    body: "Flexible paid vacation, public holidays, and a company-wide year-end closure.",
    icon: stopwatchAnim,
  },
  {
    title: "Learning & Growth",
    body: "Funds for courses, training and subscriptions, so you keep growing in the role.",
    icon: graduationAnim,
  },
];

// Gap between each card's entrance, in ms.
const STAGGER = 80;

// Max vertical tilt (deg), reached near the card's top and bottom edges. Same
// value and same cursor-driven approach as the AboutUsV2 flip cards, so the two
// sections feel like one interaction language.
const MAX_TILT = 12;

/**
 * "Benefits" — a 3 x 2 grid of gradient cards.
 *
 * Each card is a pale lilac-to-pink wash with its title and a short body at the
 * top and the icon in the BOTTOM-RIGHT corner. The icon is deliberately not
 * beside the heading: pinning it to the far corner gives every card the same
 * silhouette however long its copy is, which is what makes a row of them read as
 * a set rather than as six separately-sized blocks.
 *
 * Light band (#f7f7f7), so it deliberately does NOT carry data-nav-theme="dark".
 * The shared Navbar switches to its white logo while such a section is behind the
 * header line — right for the #151515 band this used to be, wrong now.
 */
/**
 * "Benefits" — a 3 x 2 card grid.
 *
 * Each card leads with its icon, then the title and a short body. Hovering tips
 * the card on its X axis following the cursor's height and replays the icon.
 *
 * The tilt is lifted from AboutUsV2's flip cards: a `--tilt-x` custom property
 * set from the pointer's position within the card, consumed by a dedicated
 * `.tilt` layer. Keeping the rotation on its own element rather than on `.card`
 * matters — `.card` is a `Reveal`, whose entrance writes its own transform, and
 * the two would overwrite each other.
 *
 * Light band (#f7f7f7), so it deliberately does NOT carry data-nav-theme="dark".
 */
const Benefits = () => {
  const gridRef = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(LottieIconHandle | null)[]>([]);
  // Icons play once when the grid scrolls in, rather than on mount — off-screen
  // animation is wasted, and the entrance should land with the cards.
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const node = gridRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setPlay(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Tilt follows the cursor's height: near the top the card tips back, near the
  // bottom it tips forward.
  const handleMove = (i: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRefs.current[i];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const py = (e.clientY - r.top) / r.height - 0.5; // -0.5 (top) … 0.5 (bottom)
    el.style.setProperty("--tilt-x", `${-py * MAX_TILT * 2}deg`);
  };

  const handleEnter = (i: number) => () => {
    iconRefs.current[i]?.replay();
  };

  const handleLeave = (i: number) => () => {
    cardRefs.current[i]?.style.setProperty("--tilt-x", "0deg");
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.top}>
          <h2 className={styles.heading}>Benefits</h2>
          <p className={styles.lede}>
            We want people to do their best work here, which means taking care of them in the
            moments that matter.
          </p>
        </Reveal>

        <ul ref={gridRef} className={styles.grid}>
          {BENEFITS.map((benefit, i) => (
            <Reveal as="li" key={benefit.title} className={styles.cardOuter} delay={i * STAGGER}>
              {/* The perspective host. Separate from the Reveal wrapper so the
                  entrance transform and the tilt never fight for `transform`. */}
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={styles.card}
                onMouseMove={handleMove(i)}
                onMouseEnter={handleEnter(i)}
                onMouseLeave={handleLeave(i)}
              >
                <div className={styles.tilt}>
                  <span className={styles.cardIcon}>
                    <LottieIcon
                      ref={(h) => {
                        iconRefs.current[i] = h;
                      }}
                      animationData={benefit.icon}
                      size={30}
                      play={play}
                    />
                  </span>
                  <h3 className={styles.cardTitle}>{benefit.title}</h3>
                  <p className={styles.cardBody}>{benefit.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default wrapperHOC(Benefits, {
  componentName: "Benefits-CareerFinal",
  showForChina: true,
});
