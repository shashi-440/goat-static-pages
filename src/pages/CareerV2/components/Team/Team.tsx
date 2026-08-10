import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Team.module.scss";
import harshalImg from "../../assets/team-harshal.jpg";
import davidImg from "../../assets/team-david.jpg";
import bhanuImg from "../../assets/team-bhanu.jpg";
import mernaImg from "../../assets/team-merna.jpg";
import danImg from "../../assets/team-dan.jpg";
import solomonImg from "../../assets/team-solomon.jpg";
import signatureImg from "../../assets/quote-signature.png";
// Flattened PNG exports — Figma exports these flags as separate layer SVGs
// (base circle, bands, chakra), so a single SVG is only ever one layer.
import indiaFlag from "../../assets/flag-india.png";
import ukFlag from "../../assets/flag-uk.png";
import egyptFlag from "../../assets/flag-egypt.png";
import singaporeFlag from "../../assets/flag-singapore.png";
import nigeriaFlag from "../../assets/flag-nigeria.png";

interface Member {
  name: string;
  role: string;
  photo: string;
  flag: string;
  country: string;
  quote: string;
}

const MEMBERS: Member[] = [
  {
    name: "Harshal Maniyar",
    role: "Sr. Director of Product Management",
    photo: harshalImg,
    flag: indiaFlag,
    country: "India",
    quote:
      "“ Ownership isn't something you wait for here. You create it. When you're trusted to take the lead, you learn faster, think bigger and make a real impact.",
  },
  {
    name: "David Seymour",
    role: "Chief Product Officer",
    photo: davidImg,
    flag: ukFlag,
    country: "United Kingdom",
    quote:
      "“ The pace here is unlike anywhere I've worked. Decisions happen in days, not quarters, and you can see your work reach students almost immediately.",
  },
  {
    name: "Merna Abdo",
    role: "Business development Manager",
    photo: mernaImg,
    flag: egyptFlag,
    country: "Egypt",
    quote:
      "“ I work with partners across different markets, and no two conversations are alike. You learn to listen first and build from what people actually need.",
  },
  {
    name: "Bhanu Majajan",
    role: "Director of Supply",
    photo: bhanuImg,
    flag: indiaFlag,
    country: "India",
    quote:
      "“ We're building in 80+ countries at once, which means every problem is new. That's exactly what makes it worth solving.",
  },
  {
    name: "Dan Teo",
    role: "Global Operations Leader",
    photo: danImg,
    flag: singaporeFlag,
    country: "Singapore",
    quote:
      "“ Running operations across time zones means the handover never really stops. It takes a team that trusts each other to make that feel effortless.",
  },
  {
    name: "Solomon Ajibode",
    role: "Business Development Manager",
    photo: solomonImg,
    flag: nigeriaFlag,
    country: "Nigeria",
    quote:
      "“ Opening up a new market is equal parts research and relationships. Getting to do both, and to own the outcome, is why I stayed.",
  },
];

// Max vertical tilt (deg) — reached near the very top / bottom edge.
// Same hover hint as the AboutUsV2 "Why amber Exists" flip cards.
const MAX_TILT = 12;

// Cards visible at once; the track slides ONE card per click, matching
// AboutUsV2's amber Story carousel.
const PER_VIEW = 3;

// Most dots the control row will ever show. Beyond this the dots window rather
// than the row growing — matches the five-dot control in the Figma designs.
const MAX_DOTS = 5;

interface MemberCardProps {
  member: Member;
  /** Stagger, in ms, so the cards land one after another on first scroll-in. */
  delay?: number;
}

/**
 * Portrait card that flips on its horizontal axis to the person's testimonial —
 * the same rotateX flip, cursor-following tilt and +/x toggle as AboutUsV2's
 * WhyAmberExists cards. Flipped face follows Figma 2675:16173: white card, dark
 * quote, pink signature, dark round close button bottom-right.
 */
const MemberCard = ({ member, delay = 0 }: MemberCardProps) => {
  const [flipped, setFlipped] = useState(false);
  const [shown, setShown] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fade + rise the card in when the carousel first scrolls into view. This lives
  // on the card rather than wrapping it in a <Reveal>, because `.flipCard` is a
  // flex child with a computed basis — an extra wrapper element would break the
  // one-card-per-click track maths.
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect(); // once, then stay visible
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Vertical tilt that follows the cursor's height: hovering near the top tips
  // the card one way, near the bottom the opposite way — hinting the flip.
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || flipped) return;
    const r = el.getBoundingClientRect();
    const py = (e.clientY - r.top) / r.height - 0.5; // -0.5 (top) … 0.5 (bottom)
    el.style.setProperty("--tilt-x", `${-py * MAX_TILT * 2}deg`);
  };
  const handleLeave = () => {
    cardRef.current?.style.setProperty("--tilt-x", "0deg");
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.flipCard} ${shown ? styles.cardShown : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className={styles.tilt}>
        <div className={`${styles.flipInner} ${flipped ? styles.isFlipped : ""}`}>
          {/* FRONT — portrait, name plate, plus */}
          <div className={`${styles.face} ${styles.front}`}>
            <Image
              src={member.photo}
              alt={member.name}
              className={styles.photo}
              width="100%"
              height="100%"
            />
            <div className={styles.scrim} aria-hidden="true" />
            <div className={styles.plate}>
              <div className={styles.identity}>
                <img
                  src={member.flag}
                  alt={member.country}
                  className={styles.flag}
                  width={36}
                  height={36}
                />
                <div className={styles.names}>
                  <p className={styles.name}>{member.name}</p>
                  <p className={styles.role}>{member.role}</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.toggle}
                aria-label={`Read ${member.name}'s story`}
                aria-expanded={flipped}
                onClick={() => setFlipped(true)}
              >
                <span className={styles.plus} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* BACK — testimonial, signature, close */}
          <div className={`${styles.face} ${styles.back}`}>
            <div className={styles.quoteBody}>
              <p className={styles.quoteText}>{member.quote}</p>
              <img src={signatureImg} alt="" className={styles.quoteSignature} />
            </div>
            <div className={styles.quoteFooter}>
              <button
                type="button"
                className={styles.toggle}
                aria-label={`Close ${member.name}'s story`}
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

/**
 * "Meet the People Behind amber" carousel (Figma 2675:16147). Carousel mechanics
 * mirror AboutUsV2's amber Story: PER_VIEW cards in view, one card per step,
 * arrows disable at the ends rather than wrapping.
 */
const Team = () => {
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, MEMBERS.length - PER_VIEW);

  const goPrev = () => setIndex((prev) => Math.max(0, prev - 1));
  const goNext = () => setIndex((prev) => Math.min(maxIndex, prev + 1));

  // One dot per scroll position, capped at MAX_DOTS. Past the cap the dots become
  // a sliding window centred on the active position (iOS page-indicator style) so
  // the row stays a fixed width and every position is still reachable. Below the
  // cap the row is simply as wide as there are positions — no filler, so the dots
  // never imply more content than exists.
  const positions = maxIndex + 1;
  const dotCount = Math.min(positions, MAX_DOTS);
  const dotStart = Math.max(0, Math.min(index - Math.floor(dotCount / 2), positions - dotCount));

  return (
    <section className={styles.section}>
      {/* The section background is a gradient — white at the top, near black at the
          bottom — so the section as a whole cannot carry data-nav-theme="dark" or
          the header would flip while still over the white part. This zero-impact
          marker covers the section from the portrait cards down, which is what the
          shared Navbar detects. */}
      <div className={styles.darkZone} data-nav-theme="dark" aria-hidden="true" />

      <Reveal className={styles.header}>
        <h2 className={styles.title}>Meet the People Behind amber</h2>
        <p className={styles.subtitle}>The people behind our vision, culture and growth.</p>
      </Reveal>

      {/* No <Reveal> wrapper here: that revealed the whole carousel as one unit,
          so every card appeared at once. Each card now observes itself and is
          staggered, so they land left to right. */}
      <div className={styles.viewport}>
        <div
          className={styles.track}
          // Slide by a single card: one card-width + one gap per step.
          style={{
            transform: `translateX(calc(${-index} * (100% + var(--gap)) / var(--per-view)))`,
          }}
        >
          {MEMBERS.map((member, i) => (
            // Only the cards in the first view are staggered; the rest are
            // off-screen anyway and should be ready by the time they slide in.
            <MemberCard key={member.name} member={member} delay={Math.min(i, PER_VIEW) * 130} />
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.dots}>
          {Array.from({ length: dotCount }).map((_, n) => {
            const i = dotStart + n;
            return (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to position ${i + 1}`}
                aria-current={i === index}
              />
            );
          })}
        </div>
        <button
          type="button"
          className={styles.navButton}
          onClick={goPrev}
          aria-label="Previous team member"
          disabled={index === 0}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className={styles.navButton}
          onClick={goNext}
          aria-label="Next team member"
          disabled={index === maxIndex}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 3L11 8L6 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default wrapperHOC(Team, {
  componentName: "Team-CareerV2",
  showForChina: true,
});
