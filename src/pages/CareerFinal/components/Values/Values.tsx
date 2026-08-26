import { useEffect, useRef, useState } from "react";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import LottieIcon, { LottieIconHandle } from "../LottieIcon/LottieIcon";
import styles from "./Values.module.scss";
// Lottie icons, all recoloured to $neutral7 and sized to the same 32px box.
// Figma specifies three glyphs (rocket / graduation-cap / bulb) reused across
// the eight cards; these are the animated equivalents this page already uses
// elsewhere, picked so no two adjacent cards repeat an icon.
// Purpose-made icons for three of the principles, recoloured to $neutral7 on
// import so they sit level with the rest of the set (they ship pure black).
import stopwatchAnim from "../../assets/lottie/stopwatch-speed.json";
import flashAnim from "../../assets/lottie/flash.json";
import shieldKeyAnim from "../../assets/lottie/shield-key.json";
import userAiAnim from "../../assets/lottie/user-ai.json";
import aiChipAnim from "../../assets/lottie/ai-chip.json";
import usersAiAnim from "../../assets/lottie/users-ai.json";
import graduationAnim from "../../assets/lottie/graduation.json";
import globeAnim from "../../assets/lottie/globe.json";
// Sunrise for "Irrational optimism" — a sun clearing the horizon with an upward
// arrow. Recoloured from pure black to $neutral7 like the rest of the set. Two of
// its layers (Mask, Arrow) end at frame 12 while the comp runs to 90, so the
// frames were checked: the arrow is back by 45 and the resting frame 89 draws the
// complete glyph, which is what LottieIcon parks on.
import sunriseAnim from "../../assets/lottie/value-sunrise.json";

interface Value {
  icon: any;
  title: string;
  body: string;
}

// Copy is verbatim from Figma 2937:4380, with one fix: that frame's last card in
// row one reads "Think in systems and processe" — a truncation — spelled out here.
const VALUES: Value[] = [
  {
    icon: stopwatchAnim,
    title: "Hustle is in our DNA",
    body:
      "We figure things out. We don’t wait for perfect conditions, perfect information, or " +
      "perfect resources to show up. We take initiative, unblock ourselves, and get the job done.",
  },
  {
    icon: flashAnim,
    title: "Speed over structure",
    body:
      "We move fast, and speed comes with some chaos. We value people who can think clearly, " +
      "act quickly, and create structure as they go. If you need every answer before you start, " +
      "this probably isn’t the place for you.",
  },
  {
    icon: graduationAnim,
    title: "We bet on people",
    body:
      "We prefer potential over pedigree. Experience matters, but trajectory matters more. " +
      "We’re willing to give ambitious people opportunities before they look completely ready " +
      "on paper.",
  },
  {
    icon: shieldKeyAnim,
    title: "Own the outcome",
    body:
      "Your job isn’t to complete tasks; it’s to make the outcome happen. Inputs, effort, and " +
      "activity matter only if they move the result. You think like an owner.",
  },
  {
    icon: usersAiAnim,
    title: "Customer in every room",
    body:
      "Every decision should have an invisible customer sitting at the table. We start with what " +
      "makes the customer successful, and work backwards from there.",
  },
  {
    icon: aiChipAnim,
    title: "AI native",
    body:
      "If AI can do it well, AI should do it. We use technology to remove repetitive work, move " +
      "faster, think better, and spend more time on problems where humans add unique value.",
  },
  {
    icon: globeAnim,
    title: "Think in systems and processes",
    body:
      "We prefer solutions, knowledge, and systems that make future work easier, and compound.",
  },
  {
    icon: userAiAnim,
    title: "In-person first",
    body:
      "We believe great teams are built through shared context, fast feedback, and spontaneous " +
      "collaboration. We choose to work together in person because we believe the quality and " +
      "speed of work is better that way.",
  },
  {
    icon: sunriseAnim,
    title: "Irrational optimism",
    body:
      "We believe difficult things are possible before there is enough evidence to prove it. " +
      "Ambition requires a certain level of unreasonable belief.",
  },
];

// Gap between each card's entrance, in ms. Tighter than Benefits' 150 because
// there are eight cards here rather than four — at 150 the last one lands over a
// second after the first, long enough to read as a delay rather than a sequence.
const STAGGER = 70;

// Lead-in before the first card fires. LottieIcon imports lottie-web inside an
// effect, so `replay()` is a no-op until that resolves; without this the first
// icon silently skips its animation on a fast scroll-in.
const LEAD_IN = 120;

/**
 * "Our values" — eight value cards in a 4x2 grid (Figma 2937:4380).
 *
 * Replaces the core-values section. On scroll-in the cards reveal one after
 * another, each firing its icon animation once as it lands; the animations then
 * hold their final frame. Hovering or focusing a card replays just that card's
 * icon, which is why the icons are driven imperatively through refs rather than
 * by a `play` prop — `play` only fires on a false-to-true edge, so re-entering
 * an already-played card would do nothing.
 *
 * The dividers are gradient pseudo-elements on the grid cells — faint at both
 * ends, strongest in the middle, and inset from the cell's edges so no rule runs
 * into the container's boundary. Being on the cells, they reflow automatically
 * when the grid drops to two columns and then one, switching from vertical to
 * horizontal as they go.

 */
const Values = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const iconRefs = useRef<(LottieIconHandle | null)[]>([]);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (still || typeof IntersectionObserver === "undefined") {
      setRevealed(VALUES.length);
      return undefined;
    }

    const timers: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        VALUES.forEach((_, i) => {
          timers.push(
            window.setTimeout(() => {
              setRevealed(i + 1);
              // Fire this card's icon as it arrives, not all eight at once.
              iconRefs.current[i]?.replay();
            }, LEAD_IN + i * STAGGER),
          );
        });
      },
      { threshold: 0.15 },
    );

    io.observe(node);
    return () => {
      io.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <Reveal className={styles.header}>
        <h2 className={styles.title}>Our operating principles</h2>
      </Reveal>

      <ul className={styles.grid}>
        {VALUES.map((value, i) => (
          <li
            key={value.title}
            className={`${styles.card} ${i < revealed ? styles.cardShown : ""}`}
            // Matches the icon timer so each card's rise and its icon fire
            // together rather than a frame apart.
            style={{ transitionDelay: `${LEAD_IN + i * STAGGER}ms` }}
            onMouseEnter={() => iconRefs.current[i]?.replay()}
          >
            <span className={styles.iconSlot} aria-hidden="true">
              <LottieIcon
                ref={(el) => {
                  iconRefs.current[i] = el;
                }}
                animationData={value.icon}
                size={32}
              />
            </span>
            <h3 className={styles.cardTitle}>{value.title}</h3>
            <p className={styles.cardBody}>{value.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default wrapperHOC(Values, {
  componentName: "Values-CareerFinal",
  showForChina: true,
});
