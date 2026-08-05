import { useRef, useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Team.module.scss";
import harshalImg from "../../assets/team-harshal.jpg";
import davidImg from "../../assets/team-david.jpg";
import bhanuImg from "../../assets/team-bhanu.jpg";
import signatureImg from "../../assets/quote-signature.png";
// Flattened PNG exports — Figma exports these flags as separate layer SVGs
// (base circle, bands, chakra), so a single SVG is only ever one layer.
import indiaFlag from "../../assets/flag-india.png";
import ukFlag from "../../assets/flag-uk.png";

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
    name: "Bhanu Majajan",
    role: "Director of Supply",
    photo: bhanuImg,
    flag: indiaFlag,
    country: "India",
    quote:
      "“ We're building in 80+ countries at once, which means every problem is new. That's exactly what makes it worth solving.",
  },
  // --- PLACEHOLDER ROSTER -------------------------------------------------
  // Figma only supplies three portraits, so these seven reuse them in rotation
  // and their names / roles / quotes are written copy, not supplied content.
  // Replace the photo + text as each real profile lands; the card needs nothing
  // else. See "Two things worth knowing" in the README.
  {
    name: "Priya Raghavan",
    role: "VP of Engineering",
    photo: davidImg,
    flag: indiaFlag,
    country: "India",
    quote:
      "“ We ship to students in 80+ countries, so nothing is theoretical here. You feel the impact of a release the same week you write it.",
  },
  {
    name: "Tom Whitfield",
    role: "Head of Partnerships",
    photo: harshalImg,
    flag: ukFlag,
    country: "United Kingdom",
    quote:
      "“ Universities do not partner with a logo, they partner with people. Being trusted to build those relationships directly is the whole job.",
  },
  {
    name: "Ananya Desai",
    role: "Director of Design",
    photo: bhanuImg,
    flag: indiaFlag,
    country: "India",
    quote:
      "“ Design here is not decoration. You are shaping the first thing a nervous student sees when they are moving to a country they have never visited.",
  },
  {
    name: "Marcus Bell",
    role: "Head of Student Experience",
    photo: davidImg,
    flag: ukFlag,
    country: "United Kingdom",
    quote:
      "“ Every escalation is somebody's move-in week. That keeps the team honest about what actually matters.",
  },
  {
    name: "Neha Kulkarni",
    role: "Director of Operations",
    photo: harshalImg,
    flag: indiaFlag,
    country: "India",
    quote:
      "“ Operations at this scale is a puzzle that changes every intake season. I have never once been bored.",
  },
  {
    name: "Rohan Iyer",
    role: "Head of Data",
    photo: bhanuImg,
    flag: indiaFlag,
    country: "India",
    quote:
      "“ We have data on millions of student journeys. Turning that into a better first week for someone is the most satisfying part.",
  },
  {
    name: "Sarah Ellison",
    role: "Head of Brand",
    photo: davidImg,
    flag: ukFlag,
    country: "United Kingdom",
    quote:
      "“ We get to build a brand students genuinely trust with one of the biggest decisions of their lives. That is rare.",
  },
];

// Max vertical tilt (deg) — reached near the very top / bottom edge.
// Same hover hint as the AboutUsV2 "Why Amber Exists" flip cards.
const MAX_TILT = 12;

// Cards visible at once; the track slides ONE card per click, matching
// AboutUsV2's Amber Story carousel.
const PER_VIEW = 3;

interface MemberCardProps {
  member: Member;
}

/**
 * Portrait card that flips on its horizontal axis to the person's testimonial —
 * the same rotateX flip, cursor-following tilt and +/x toggle as AboutUsV2's
 * WhyAmberExists cards. Flipped face follows Figma 2675:16173: white card, dark
 * quote, pink signature, dark round close button bottom-right.
 */
const MemberCard = ({ member }: MemberCardProps) => {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
      className={styles.flipCard}
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
 * "Meet the People Behind Amber" carousel (Figma 2675:16147). Carousel mechanics
 * mirror AboutUsV2's Amber Story: PER_VIEW cards in view, one card per step,
 * arrows disable at the ends rather than wrapping.
 */
const Team = () => {
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, MEMBERS.length - PER_VIEW);

  const goPrev = () => setIndex((prev) => Math.max(0, prev - 1));
  const goNext = () => setIndex((prev) => Math.min(maxIndex, prev + 1));

  return (
    <section className={styles.section}>
      <Reveal className={styles.header}>
        <h2 className={styles.title}>Meet the People Behind Amber</h2>
        <p className={styles.subtitle}>The people behind our vision, culture and growth.</p>
      </Reveal>

      <Reveal className={styles.viewport} delay={120}>
        <div
          className={styles.track}
          // Slide by a single card: one card-width + one gap per step.
          style={{
            transform: `translateX(calc(${-index} * (100% + var(--gap)) / var(--per-view)))`,
          }}
        >
          {MEMBERS.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </div>
      </Reveal>

      <div className={styles.controls}>
        <div className={styles.dots}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
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
