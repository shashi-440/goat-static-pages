import { useState } from "react";
import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import CarouselControls from "../../../CareerV2/components/CarouselControls/CarouselControls";
import styles from "./Teams.module.scss";
// PLACEHOLDER ART — these are the crew photos already in the repo, standing in
// for the per-team images. Drop the real team photos into CareerV3/assets and
// swap the `photo` field below; nothing else needs to change.
import crew1 from "../../../CareerV2/assets/crew-1.jpg";
import crew2 from "../../../CareerV2/assets/crew-2.jpg";
import crew3 from "../../../CareerV2/assets/crew-3.jpg";
import crew4 from "../../../CareerV2/assets/crew-4.jpg";

interface TeamEntry {
  name: string;
  line: string;
  detail: string;
  photo: string;
}

/**
 * Only the four teams the copy keeps — Sales and Finance/HR/Legal were struck
 * through in the source content, so they are intentionally not here.
 */
const TEAMS: TeamEntry[] = [
  {
    name: "Product",
    line: "The Product team simplifies decisions",
    detail:
      "Turning a wall of listings, prices and paperwork into one clear next step, for someone booking a home in a country they have never been to.",
    photo: crew1,
  },
  {
    name: "Engineering",
    line: "The Engineers build tools students rely on",
    detail:
      "Search, booking, payments and verification that have to hold up at intake season, in 80+ countries, on whatever connection a student happens to have.",
    photo: crew2,
  },
  {
    name: "Operations",
    line: "The Operations team ensures everything runs smoothly",
    detail:
      "Every booking has a real move-in date behind it. Ops is why the keys are there when the student is, and why the exceptions get caught before they become someone's bad week.",
    photo: crew3,
  },
  {
    name: "Marketing",
    line: "The Marketing team reaches students at the right time",
    detail:
      "Finding students at the moment the housing question actually starts, and answering it honestly enough that they trust us with the decision.",
    photo: crew4,
  },
];

/**
 * Section 5 — how people actually work here.
 *
 * One team at a time: the list on the left doubles as the carousel nav, and
 * selecting a team swaps the photo and copy on the right. Same interaction as
 * the Benefits carousel below, so the two read as one system.
 */
const Teams = () => {
  const [active, setActive] = useState(0);

  // Wrap at both ends so the arrows never dead-end.
  const go = (next: number) => setActive((next + TEAMS.length) % TEAMS.length);

  const current = TEAMS[active];

  return (
    <section className={styles.section}>
      <Reveal className={styles.header}>
        <h2 className={styles.title}>And it takes more than one team to make it happen</h2>
      </Reveal>

      <div className={styles.body}>
        <div className={styles.grid}>
          <ul className={styles.list}>
            {TEAMS.map((team, i) => (
              <li key={team.name}>
                <button
                  type="button"
                  className={`${styles.listButton} ${i === active ? styles.listActive : ""}`}
                  onClick={() => go(i)}
                  aria-current={i === active}
                >
                  <span className={styles.listIndex}>0{i + 1}</span>
                  <span className={styles.listName}>{team.name}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.mediaColumn}>
            {/* Keyed on the active team so the image re-mounts and re-runs its
                fade each time the slide changes. */}
            <div className={styles.media} key={current.name}>
              <Image
                src={current.photo}
                alt={`The ${current.name} team at amber`}
                className={styles.image}
                width="100%"
                height="100%"
              />
            </div>
          </div>

          <div className={styles.copy} key={`copy-${current.name}`}>
            <p className={styles.copyLine}>{current.line}</p>
            <p className={styles.copyDetail}>{current.detail}</p>
          </div>
        </div>

        <CarouselControls
          count={TEAMS.length}
          active={active}
          onSelect={go}
          onPrev={() => go(active - 1)}
          onNext={() => go(active + 1)}
          // `dark` is the grey-chip-on-white treatment (named for the band it
          // was built against); `light` uses white chips, which would vanish on
          // this white section.
          theme="dark"
          label="team"
        />
      </div>

      <Reveal as="p" className={styles.outro} delay={80}>
        All working towards the same outcome.
      </Reveal>
    </section>
  );
};

export default wrapperHOC(Teams, {
  componentName: "Teams-CareerV3",
  showForChina: true,
});
