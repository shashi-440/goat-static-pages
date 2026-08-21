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

interface Member {
  name: string;
  role: string;
  photo: string;
  quote: string;
}

const MEMBERS: Member[] = [
  {
    name: "Harshal Maniyar",
    role: "Product Management",
    photo: harshalImg,
    quote:
      "Ownership isn't something you wait for here. You create it. When you're trusted to take the lead, you learn faster, think bigger and make a real impact.",
  },
  {
    name: "David Seymour",
    role: "Product",
    photo: davidImg,
    quote:
      "The pace here is unlike anywhere I've worked. Decisions happen in days, not quarters, and you can see your work reach students almost immediately.",
  },
  {
    name: "Merna Abdo",
    role: "Business Development",
    photo: mernaImg,
    quote:
      "I work with partners across different markets, and no two conversations are alike. You learn to listen first and build from what people actually need.",
  },
  {
    name: "Bhanu Majajan",
    role: "Supply",
    photo: bhanuImg,
    quote:
      "We're building in 80+ countries at once, which means every problem is new. That's exactly what makes it worth solving.",
  },
  {
    name: "Dan Teo",
    role: "Global Operations",
    photo: danImg,
    quote:
      "Running operations across time zones means the handover never really stops. It takes a team that trusts each other to make that feel effortless.",
  },
  {
    name: "Solomon Ajibode",
    role: "Business Development",
    photo: solomonImg,
    quote:
      "Opening up a new market is equal parts research and relationships. Getting to do both, and to own the outcome, is why I stayed.",
  },
];

// Three columns, dealt round-robin so neighbouring cards in a column are from
// different people rather than three of the same team in a row.
const COLUMNS: Member[][] = [
  MEMBERS.filter((_, i) => i % 3 === 0),
  MEMBERS.filter((_, i) => i % 3 === 1),
  MEMBERS.filter((_, i) => i % 3 === 2),
];

// Seconds for one full loop. The outer columns travel up, the middle one down;
// the middle is deliberately slower so the three never sync into a single block.
const DURATIONS = [38, 52, 44];

interface TestimonialCardProps {
  member: Member;
  /** Set on the duplicated loop copy so screen readers read each quote once. */
  ariaHidden?: boolean;
}

const TestimonialCard = ({ member, ariaHidden = false }: TestimonialCardProps) => (
  <figure className={styles.card} aria-hidden={ariaHidden || undefined}>
    <blockquote className={styles.quote}>{member.quote}</blockquote>
    <figcaption className={styles.author}>
      <Image
        src={member.photo}
        alt=""
        className={styles.avatar}
        width={40}
        height={40}
      />
      <div className={styles.authorText}>
        <p className={styles.name}>{member.name}</p>
        <p className={styles.role}>{member.role}</p>
      </div>
    </figcaption>
  </figure>
);

/**
 * "Meet the People Behind Amber" — three columns of testimonials drifting
 * vertically, outer columns up and the middle one down.
 *
 * The loop is a pure CSS translateY on a track holding the column's cards
 * TWICE. The animation moves the track by exactly -50% (or +50%), so the moment
 * it wraps, copy two sits precisely where copy one began and the seam is
 * invisible. This is why the cards are duplicated rather than the track being
 * re-ordered in JS — no timers, no scroll listeners, and it survives SSR.
 *
 * The top and bottom fade is a `mask-image`, not an overlay. The section's
 * background is flat white now, but masking is still the right tool: it fades
 * the cards to genuine transparency, so the columns stay correct if the backdrop
 * ever changes again.
 */
const Team = () => (
  <section className={styles.section}>
    <Reveal className={styles.header}>
      <h2 className={styles.title}>Meet the People Behind Amber</h2>
      <p className={styles.subtitle}>The people behind our vision, culture and growth.</p>
    </Reveal>

    <div className={styles.columns}>
      {COLUMNS.map((column, colIndex) => (
        <div
          key={colIndex}
          className={`${styles.column} ${colIndex === 1 ? styles.columnDown : styles.columnUp}`}
          style={{ "--duration": `${DURATIONS[colIndex]}s` } as React.CSSProperties}
        >
          <div className={styles.track}>
            {/* Rendered twice — see the -50% wrap above. Both copies are direct
                flex children of the same track, so the two halves are exactly
                equal and -50% lands copy two on copy one's start. Wrapping the
                duplicate in its own element would make it a single child and
                break that symmetry. The duplicate is decorative, so each of its
                cards is hidden from assistive tech individually. */}
            {column.map((member) => (
              <TestimonialCard key={member.name} member={member} />
            ))}
            {column.map((member) => (
              <TestimonialCard key={`${member.name}-loop`} member={member} ariaHidden />
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default wrapperHOC(Team, {
  componentName: "Team-CareerFinal",
  showForChina: true,
});
