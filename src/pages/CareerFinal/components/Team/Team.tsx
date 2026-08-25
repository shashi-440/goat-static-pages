import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Team.module.scss";
import mirnaImg from "../../assets/team-merna.jpg";
import solomonImg from "../../assets/team-solomon.jpg";

interface Member {
  name: string;
  role: string;
  /**
   * Optional. Only two of the eleven have a photo in the repo today; the rest
   * fall back to an initials avatar. Drop a JPG into ../../assets and add the
   * import to give someone a real photo — no other change needed.
   */
  photo?: string;
  quote: string;
}

const MEMBERS: Member[] = [
  {
    name: "Akshat",
    role: "Product",
    quote:
      "I joined Amber as an intern, and over time I've had the chance to take on bigger problems, more ownership and eventually lead a team. The growth here has come from being trusted to figure things out, not waiting for a title.",
  },
  {
    name: "Sourabh Awesakar",
    role: "Data",
    quote:
      "At Amber, data isn't something we look at after a decision is made, it helps us make the decision in the first place. What excites me most is using data and AI to solve real business problems at scale.",
  },
  {
    name: "Asmita",
    role: "Operations",
    quote:
      "My favourite part of the day is probably the people I get to work with. There's always something new happening, and the team makes even the busiest days feel collaborative and fun.",
  },
  {
    name: "Anubhav",
    role: "Supply",
    quote:
      "What made me join Amber was the scale of the problem we were solving, but what made me stay was the ownership. You get the freedom to build, experiment and see the impact of your work really quick.",
  },
  {
    name: "Prathamesh Wakde",
    role: "AI Engineering",
    quote:
      "AI has the potential to change how students discover, choose and book their homes, and we're only scratching the surface. What excites me is getting to build that future from the ground up.",
  },
  {
    name: "Rajratna",
    role: "Marketing",
    quote:
      "My journey with Amber actually started as a customer, so I experienced the product before I ever worked here. Joining the team felt like a chance to help build a brand I already had a real connection with.",
  },
  {
    name: "Summer Xia",
    role: "China",
    quote:
      "I've seen Amber grow from being relatively new in China to becoming a much stronger presence in the market. There's still a huge opportunity ahead, especially as more students look for trusted support when moving abroad.",
  },
  {
    name: "Trang Kim",
    role: "Southeast Asia",
    quote:
      "What stands out about Amber is how global the team is while still feeling very connected. You work with people across markets and cultures, but there's still a strong sense that everyone is building towards the same goal.",
  },
  {
    name: "Jools",
    role: "UK",
    quote:
      "Partnerships at Amber have evolved from simple relationships into long-term collaborations built around shared growth. What I've enjoyed most is seeing those partnerships scale alongside the business.",
  },
  {
    name: "Mirna Abdo",
    role: "Egypt",
    photo: mirnaImg,
    quote:
      "What interested me most about Amber was the opportunity to work with a global team solving a very real problem for students. There's a lot of room to learn, contribute and make an impact from day one.",
  },
  {
    name: "Solomon",
    role: "Nigeria",
    photo: solomonImg,
    quote:
      "Working at Amber has given me the chance to collaborate with people across markets, teams and cultures. That exposure has helped me grow professionally while also understanding how a truly global business operates.",
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

/**
 * First letters of the first two words — "Sourabh Awesakar" → "SA", "Jools" → "J".
 * Used for the initials avatar when someone has no photo yet.
 */
const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

/**
 * Six fixed tints, picked by name length so a given person always gets the same
 * colour across renders (server and client) without needing a random seed.
 */
const AVATAR_TINTS = [
  "#E9D5FF",
  "#FDE68A",
  "#BFDBFE",
  "#C7F0DB",
  "#FBCFE8",
  "#FED7AA",
];

interface TestimonialCardProps {
  member: Member;
  /** Set on the duplicated loop copy so screen readers read each quote once. */
  ariaHidden?: boolean;
}

const TestimonialCard = ({ member, ariaHidden = false }: TestimonialCardProps) => (
  <figure className={styles.card} aria-hidden={ariaHidden || undefined}>
    <blockquote className={styles.quote}>{member.quote}</blockquote>
    <figcaption className={styles.author}>
      {member.photo ? (
        <Image
          src={member.photo}
          alt=""
          className={styles.avatar}
          width={40}
          height={40}
        />
      ) : (
        // Decorative: the name is already in the caption below, so this is
        // hidden from assistive tech rather than read out as stray letters.
        <span
          aria-hidden="true"
          className={styles.avatarInitials}
          style={{
            background: AVATAR_TINTS[member.name.length % AVATAR_TINTS.length],
          }}
        >
          {initialsOf(member.name)}
        </span>
      )}
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
