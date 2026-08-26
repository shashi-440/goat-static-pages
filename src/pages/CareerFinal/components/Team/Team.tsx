import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Team.module.scss";
// Headshots, from Figma (Career Page Cleanup, node 3007:4592) where each is
// labelled with its owner's name and country. Head-cropped before committing the
// same way the globe pins were: the face located with macOS Vision, then a square
// 2.6x the face box centred on it and biased 12% of a face-height upward. The
// detected face runs from 11% of frame width (Asmita, a distant shot) to 32%
// (Sourabh), so a fixed crop rectangle would be wrong for most of them.
import akshatImg from "../../assets/people/akshat-mathur.jpg";
import sourabhImg from "../../assets/people/sourabh-awesakar.jpg";
import asmitaImg from "../../assets/people/asmita.jpg";
import anubhavImg from "../../assets/people/anubhav.jpg";
import prathmeshImg from "../../assets/people/prathmesh-wakde.jpg";
import rajratnaImg from "../../assets/people/rajratna.jpg";
import summerImg from "../../assets/people/summer-xia-t.jpg";
import trangImg from "../../assets/people/trang-kim.jpg";
// These two already existed for the globe; reused rather than re-exported.
import solomonImg from "../../assets/people/ajibode-solomon.jpg";
import mirnaImg from "../../assets/people/mirna-abdo.jpg";
// Country flags, the same 72x72 ISO-named set the globe cards use.
import flagIN from "../../assets/flags/in.png";
import flagCN from "../../assets/flags/cn.png";
import flagTH from "../../assets/flags/th.png";
import flagNG from "../../assets/flags/ng.png";
import flagEG from "../../assets/flags/eg.png";
import flagGB from "../../assets/flags/gb.png";

interface Member {
  name: string;
  /**
   * The DEPARTMENT, never the country. Five of these used to hold a country
   * (China, Southeast Asia, UK, Egypt, Nigeria) because no department was on
   * record — the flag carries the country now, so this line is free to say what
   * the person actually does.
   */
  department: string;
  /** Light-hearted second line, in brackets after the department. */
  funTitle: string;
  /** Country flag, shown as a small circular badge on the avatar. */
  flag: string;
  /** Country name, for the avatar's accessible description. */
  country: string;
  photo: string;
  quote: string;
}

// Ten people, each with a real headshot, their DEPARTMENT and their country flag.
//
// DEPARTMENTS. Six are on record: five came across from the previous `role` field
// (Product, Data, Supply, AI Engineering, Marketing) and Asmita's is from the
// Figma label, which reads "Asmita – IND – Operations". The other four had a
// COUNTRY in that field rather than a department, so there was nothing to carry
// over — Market Expansion, Partnerships, Business Development and Employee
// Experience are inferred from what each person's own quote is about, and want
// checking against the real org chart.
//
// Trang Kim is labelled "China" in Figma, but her quote is about Southeast Asia
// and the globe has her in Thailand — so Thailand is used here. Worth confirming.
//
// The fun titles are invented. They are meant to be affectionate and safe to
// publish; swap any that do not fit the person.
const MEMBERS: Member[] = [
  {
    name: "Akshat Mathur",
    department: "Product",
    funTitle: "serial idea sketcher",
    flag: flagIN,
    country: "India",
    photo: akshatImg,
    quote:
      "I joined Amber as an intern, and over time I've had the chance to take on bigger " +
      "problems, more ownership and eventually lead a team. The growth here has come from being " +
      "trusted to figure things out, not waiting for a title.",
  },
  {
    name: "Sourabh Awesakar",
    department: "Data",
    funTitle: "spreadsheet whisperer",
    flag: flagIN,
    country: "India",
    photo: sourabhImg,
    quote:
      "At Amber, data isn't something we look at after a decision is made, it helps us make the " +
      "decision in the first place. What excites me most is using data and AI to solve real " +
      "business problems at scale.",
  },
  {
    name: "Asmita",
    department: "Operations",
    funTitle: "chief plan-B officer",
    flag: flagIN,
    country: "India",
    photo: asmitaImg,
    quote:
      "My favourite part of the day is probably the people I get to work with. There's always " +
      "something new happening, and the team makes even the busiest days feel collaborative and " +
      "fun.",
  },
  {
    name: "Anubhav",
    department: "Supply",
    funTitle: "deadline negotiator",
    flag: flagIN,
    country: "India",
    photo: anubhavImg,
    quote:
      "What made me join Amber was the scale of the problem we were solving, but what made me " +
      "stay was the ownership. You get the freedom to build, experiment and see the impact of " +
      "your work really quick.",
  },
  {
    name: "Prathmesh Wakde",
    department: "AI Engineering",
    funTitle: "prompt tinkerer",
    flag: flagIN,
    country: "India",
    photo: prathmeshImg,
    quote:
      "AI has the potential to change how students discover, choose and book their homes, and " +
      "we're only scratching the surface. What excites me is getting to build that future from " +
      "the ground up.",
  },
  {
    name: "Rajratna",
    department: "Marketing",
    funTitle: "meme archivist",
    flag: flagIN,
    country: "India",
    photo: rajratnaImg,
    quote:
      "My journey with Amber actually started as a customer, so I experienced the product " +
      "before I ever worked here. Joining the team felt like a chance to help build a brand I " +
      "already had a real connection with.",
  },
  {
    name: "Summer Xia",
    department: "Market Expansion",
    funTitle: "food connoisseur",
    flag: flagCN,
    country: "China",
    photo: summerImg,
    quote:
      "I've seen Amber grow from being relatively new in China to becoming a much stronger " +
      "presence in the market. There's still a huge opportunity ahead, especially as more " +
      "students look for trusted support when moving abroad.",
  },
  {
    name: "Trang Kim",
    department: "Partnerships",
    funTitle: "karaoke regular",
    flag: flagTH,
    country: "Thailand",
    photo: trangImg,
    quote:
      "What stands out about Amber is how global the team is while still feeling very " +
      "connected. You work with people across markets and cultures, but there's still a strong " +
      "sense that everyone is building towards the same goal.",
  },
  {
    name: "Ajibode Solomon",
    department: "Business Development",
    funTitle: "pet peeve collector",
    flag: flagNG,
    country: "Nigeria",
    photo: solomonImg,
    quote:
      "Working at Amber has given me the chance to collaborate with people across markets, " +
      "teams and cultures. That exposure has helped me grow professionally while also " +
      "understanding how a truly global business operates.",
  },
  {
    name: "Mirna Abdo",
    department: "Employee Experience",
    funTitle: "desk-plant guardian",
    flag: flagEG,
    country: "Egypt",
    photo: mirnaImg,
    quote:
      "What interested me most about Amber was the opportunity to work with a global team " +
      "solving a very real problem for students. There's a lot of room to learn, contribute and " +
      "make an impact from day one.",
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
      {/* Avatar with the country flag as a badge. The wrapper is what the flag
          is positioned against — the <Image> itself is replaced wholesale by the
          lazy-load component, so anything absolutely positioned inside it would
          be at the mercy of that. */}
      <span className={styles.avatarWrap}>
        <Image
          src={member.photo}
          alt=""
          className={styles.avatar}
          width={40}
          height={40}
        />
        <img src={member.flag} alt="" className={styles.avatarFlag} />
      </span>
      <div className={styles.authorText}>
        <p className={styles.name}>{member.name}</p>
        {/* Department, then the light-hearted title in brackets. One line, two
            weights: the department is the real information and the aside sits
            behind it rather than competing. */}
        <p className={styles.role}>
          {member.department} <span className={styles.fun}>({member.funTitle})</span>
        </p>
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
