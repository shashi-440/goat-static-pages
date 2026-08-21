import { useState } from "react";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
// Same counter About Us uses — counts up once on first scroll into view, renders
// the final value server-side so the number is never missing.
import CountUp from "../../../AboutUsV2/components/CountUp/CountUp";
import styles from "./Intro.module.scss";
// The three faces already on this page, in the winners marquee. Reused rather than sourced
// anew: these are real amberscholar applicants, which is exactly what the stat counts.
import face1 from "../../assets/winner-1.jpg";
import face2 from "../../assets/winner-2.jpg";
import face3 from "../../assets/winner-3.jpg";
// Flags from the List With Us set — the MIT-licensed lipis/flag-icons 1x1 rasters, square so
// they mask to a circle without cropping the artwork (see the note in DemandMap/network.ts).
// Imported across pages rather than copied in, so there is one set of these binaries in the
// repo and not two; this page already shares Reveal and CountUp with About Us the same way.
import flagIn from "../../../ListWithUs/assets/flags/in.png";
import flagCn from "../../../ListWithUs/assets/flags/cn.png";
import flagBr from "../../../ListWithUs/assets/flags/br.png";
// Same host the headline's mark uses — a <span>, dynamically imported lottie-web, parks on the
// finished frame so the row is never missing its third visual.
import InlineLottie from "../InlineLottie/InlineLottie";
import currency from "../../assets/lottie/currency.json";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Each stat carries a stack of overlapping circles.
 *
 * ── Why all three, and why all the same shape ───────────────────────────────
 * The obvious version gives faces to "Applicants" and stops, because that is the one with an
 * obvious picture. Three columns where one has a visual and two do not reads as two of them
 * being unfinished. So all three get a stack, and every stack is the same size, count and
 * overlap — what changes is only what is INSIDE the circles: faces, flags, marks. The row
 * then reads as one set rather than as a picture plus two numbers.
 *
 * The third is the exception and earns it: there is no photograph of a granted scholarship, so
 * where the other two show a stack of circles it plays a mark instead. It still occupies the
 * same 32px-high box — see `.stack` — because the three figures below have to stay on one line,
 * and a taller visual in one column would push that column's number down on its own.
 */
interface Stat {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  /** Overlapping circles. Mutually exclusive with `lottie`. */
  stack?: string[];
  /** An animated mark in place of the circles. */
  lottie?: unknown;
  /** Read out in place of the visual, which is decorative. */
  stackLabel: string;
}

const STATS: Stat[] = [
  {
    target: 33,
    suffix: "K+",
    label: "Applicants",
    stack: [face1, face2, face3],
    stackLabel: "Past amberscholar applicants",
  },
  {
    target: 220,
    suffix: "+",
    label: "Nationalities",
    // THREE, like the other two stacks. It was four, and that one extra circle made this
    // stack wider than its neighbours and gave the row of three no rhythm — the middle column
    // looked heavier for a reason that carried no meaning. Nigeria was the one dropped, which
    // also retires the pale-flag problem noted on `.chip`.
    //
    // Three of the largest source markets, not a ranking: the stat is the count, and the flags
    // only have to say "from everywhere", which three can do and twenty cannot.
    stack: [flagIn, flagCn, flagBr],
    stackLabel: "Applicants from over 220 nationalities",
  },
  {
    target: 45,
    prefix: "$",
    suffix: "k+",
    label: "Scholarships Granted",
    // No photograph exists of a granted scholarship, so this one plays a mark. It replaced
    // three line icons in tinted circles (cap / rocket / bulb): fine strokes on pale grey,
    // which next to a column of saturated flags read as three empty discs.
    lottie: currency,
    stackLabel: "Scholarships granted from the amber Dream Fund",
  },
];

/** Stats row + programme intro copy — Figma node 2097:3651. */
const Intro = () => {
  /**
   * Which column the pointer is in, or null.
   *
   * Needed only because of the animated mark. The two circle stacks fan out in pure CSS off
   * `.stat:hover`, but the mark has to be TOLD to replay, and `InlineLottie` already replays on
   * its own `pointerenter` — which would mean the third column only responded to a 32px target
   * while its neighbours responded to the whole column. Driving it from the same hover the CSS
   * uses is what keeps the three consistent.
   */
  const [hovered, setHovered] = useState<number | null>(null);

  return (
  <section className={styles.section}>
    <Reveal className={styles.inner}>
      <div className={styles.stats}>
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={styles.stat}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Decorative as a picture, so the images carry no alt and the group carries one
                label. Three separate alts would have a screen reader read out three flags
                before reaching the number they illustrate. */}
            <span className={styles.stack} role="img" aria-label={stat.stackLabel}>
              {stat.lottie ? (
                // 32px box, art magnified 2.4x by transform so it costs no layout.
                //
                // The box has to stay 32 to keep this column's figure level with the other two:
                // each column sizes itself, so a taller visual here would push this number down
                // on its own. The magnification is therefore the only lever on apparent size.
                //
                // 2.4 is MEASURED, not chosen. The comp's ink occupies 46% of its 1000px square
                // — at 1.55x that rendered 27x23px next to 32px circles, which is why it read as
                // small. 2.4x puts the ink at roughly 42x36, so it carries the same weight as
                // the stacks beside it. It overflows the 32px box by ~2px top and bottom, which
                // the 16px gap under the stack absorbs.
                //
                // `autoPlay` off and `play` controlled: this row sits below the fold, so a
                // self-starting one-shot would run unseen and then sit finished forever.
                <InlineLottie
                  data={stat.lottie}
                  size={32}
                  scale={2.4}
                  autoPlay={false}
                  play={hovered === i}
                />
              ) : (
                stat.stack?.map((src) => (
                  <span className={styles.chip} key={src}>
                    <img className={styles.chipArt} src={src} alt="" />
                  </span>
                ))
              )}
            </span>

            <CountUp
              target={stat.target}
              prefix={stat.prefix}
              suffix={stat.suffix}
              className={styles.value}
            />
            <span className={styles.label}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.copy}>
        <p className={styles.paragraph}>
          amberscholar 2026 is for students and dreamers who have the hunger in them! Because at
          amber, we don&apos;t just accommodate students, we accommodate their dreams too.
        </p>
        <p className={styles.paragraph}>
          That&apos;s why we&apos;ve created the <strong>$50,000</strong> amber Dream Fund!
        </p>
        <p className={styles.paragraph}>
          If you have a big goal, a bold idea, or a dream you truly believe in, this is your chance
          to win funding from the <strong>$50,000</strong> Dream Fund pool and take it further.
        </p>
      </div>
    </Reveal>
  </section>
  );
};

export default wrapperHOC(Intro, {
  componentName: "Intro-ScholarshipV2",
  showForChina: true,
});
