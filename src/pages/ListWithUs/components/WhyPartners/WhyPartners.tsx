import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
// The Lottie host the hero's headline mark uses — a <span>, with lottie-web dynamically imported so
// it stays out of the server bundle.
import InlineLottie from "../../../ScholarshipV2/components/InlineLottie/InlineLottie";
// ── THE MARKS ──────────────────────────────────────────────────────────────
// The Career page's Values set, recoloured to FIVE colours sampled off a reference:
//
//   indigo #6466E9    purple #845EEE    blue #487EF7    teal #55B5A6    sky #4BA3E3
//
// ⚠️  THE COLOUR IS BAKED INTO EACH FILE, so it travels with the ICON and not with the position. The
// arrangement matters: over the 5x2 grid, row one runs the palette in order and row two is the same
// order rotated by two, so no two neighbours share a colour in either direction. REORDERING
// `FIGURES` BREAKS THAT and cannot be fixed in CSS — the files would have to be regenerated.
//
// Generated from the original $neutral7 exports rather than from an earlier all-blue set, so a colour
// is never a tint of a tint. That blue set is still on disk, unused.
//
// ⚠️  545KB OF JSON for ten decorative marks (`users-ai` alone is 144KB). Worth knowing before this
// grows: it used to sit behind a variant switch so it only loaded on demand, and that switch is gone
// — this is now on the page unconditionally.
import lottieShieldKey from "../../assets/lottie/tinted/shield-key-indigo.json";
import lottieAiChip from "../../assets/lottie/tinted/ai-chip-purple.json";
import lottieSearch from "../../assets/lottie/tinted/search-blue.json";
import lottieGlobe from "../../assets/lottie/tinted/globe-teal.json";
import lottieUsersAi from "../../assets/lottie/tinted/users-ai-sky.json";
import lottieUserAi from "../../assets/lottie/tinted/user-ai-blue.json";
import lottieRocket from "../../assets/lottie/tinted/rocket-teal.json";
import lottieGraduation from "../../assets/lottie/tinted/graduation-sky.json";
import lottieFlash from "../../assets/lottie/tinted/flash-indigo.json";
import lottieStopwatch from "../../assets/lottie/tinted/stopwatch-speed-purple.json";
// ⚠️  A PLACEHOLDER FACE from Partner With Us's testimonials — see the note on `VOICE`. Imported
// across pages rather than copied in, the way this page already borrows `Reveal` and `InlineLottie`.
import voiceAvatar from "../../../PartnerWithUs/assets/testimonial-avatar-2.png";
import styles from "./WhyPartners.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Why partners list with amber" — ten figures in one panel, each with a coloured mark.
 *
 * ── WHAT THIS USED TO BE ───────────────────────────────────────────────────
 * ⚠️  THERE WAS A VARIANT SWITCH HERE, and it is gone along with the treatment it toggled. The other
 * variant implemented Figma node 5985:12536 literally: a 5x2 grid of ruled `Article` cells, each with
 * a one-line title merging the figure with its label, a sentence at 60% black, and a 108px line
 * diagram pinned to the bottom. The switch existed so the two could be compared in the running page
 * rather than by rebuilding, and this is the one that was chosen.
 *
 * What came out with it: `Diagram.tsx`, `Diagram.module.scss` and the nineteen exported SVG fragments
 * in `assets/icons/connect` are now unreferenced, as are the ten drafted description sentences that
 * variant carried. Nothing was deleted — the files are on disk if that treatment is ever wanted back.
 *
 * Six treatments preceded the Figma one, and the shape of this section is the residue of all of them:
 * a bento of four figures with a dashboard panel each (did not scale to ten), a bare hairline grid
 * (read as a spreadsheet), a tinted panel with dashed dividers, a dark navy band with muted figures,
 * and the two Figma variants.
 *
 * ── The figures ────────────────────────────────────────────────────────────
 * ⚠️  ILLUSTRATIVE, as everywhere else on this page. Beds / properties / cities / countries came with
 * the original brief; visits / traffic growth / bookings / source countries / booking rate carried
 * over from an earlier bento treatment's cards; and average booking value is the only one never
 * handed over — it is the demand-weighted mean of `avgBooking` across `PROPERTIES` in
 * DemandMap/network.ts ($1,800; the plain mean is $1,716).
 */

interface Figure {
  /** The digits — the card's title. */
  value: string;
  /** The figure's name — the card's description. */
  label: string;
  /** The Lottie mark. Its colour is baked in; see the note above. */
  lottie: unknown;
}

/**
 * ⚠️  TWO DEPARTURES FROM THE FIGMA NODE'S LABELS, both deliberate:
 *   · "Cities of demand" -> "Countries of demand". The design says cities, but this is the
 *     source-market count and the grid already has "260+ Cities covered" three cells earlier — two
 *     contradictory city figures. Read as a typo.
 *   · "Bookings delivered *" -> the asterisk is dropped. There is no footnote anywhere in the node
 *     for it to point at, and a dangling asterisk on a money figure sends the reader hunting for a
 *     caveat that does not exist.
 */
const FIGURES: Figure[] = [
  { value: "2M+", label: "Beds listed", lottie: lottieShieldKey },
  { value: "5K+", label: "Properties live", lottie: lottieAiChip },
  { value: "260+", label: "Cities covered", lottie: lottieSearch },
  { value: "10+", label: "Countries live", lottie: lottieGlobe },
  { value: "160+", label: "Countries of demand", lottie: lottieUsersAi },

  { value: "9.2M+", label: "Monthly site visits", lottie: lottieUserAi },
  { value: "277%", label: "Web traffic growth", lottie: lottieRocket },
  { value: "$1Bn+", label: "Bookings delivered", lottie: lottieGraduation },
  { value: "$1.8K", label: "Avg. booking value", lottie: lottieFlash },
  { value: "2x", label: "Booking rate", lottie: lottieStopwatch },
];

/**
 * The mark's layout box.
 *
 * These Lottie comps are mostly empty canvas — their ink fills about 0.85 of the square — so the
 * VISIBLE mark is roughly 25px, which is what has to be judged. It was 22 when the cell was 80px
 * tall; opening the cell to 105px left it looking undersized, because a mark reads relative to the
 * room around it rather than in absolute px.
 */
const MARK_SIZE = 30;

/**
 * The testimonial the design puts inside the mat, under the panel.
 *
 * ⚠️  THE QUOTE IS VERBATIM AND REAL — the page's own partner testimonial, from
 * `ListWithUs/components/Testimonials`. It is used in FULL, all four sentences, because a longer
 * quote was wanted and inventing sentences for a named person is not an option. Searching the repo
 * for every quote over 110 characters turned up exactly one that is both long and about a
 * partnership; the three in Partner With Us are all two lines.
 *
 * ⚠️  THE AVATAR IS A PLACEHOLDER AND DOES NOT SHOW THIS PERSON. It is Geet Kaur's photo from Partner
 * With Us's testimonials, standing in because there is no headshot for Linsey Cullen in the repo.
 * A female placeholder for a female name is the less jarring mismatch, but it is still a mismatch —
 * SWAP IN THE REAL HEADSHOT BEFORE THIS SHIPS. The earlier version avoided this by drawing an initials
 * disc instead; that was replaced on request.
 *
 * ⚠️  THIS QUOTE NOW APPEARS TWICE ON THE PAGE — here and in the `Testimonials` carousel below, which
 * repeats it five times. Worth a decision: a different partner quote here, or drop it from below.
 *
 * The design's own testimonial was placeholder text: it names "Gurinder Pal Singh / Influencer" and
 * pastes one sentence into the paragraph twice. That sentence is verbatim Geet Kaur's from Partner
 * With Us, so the node borrowed it from there.
 */
const VOICE = {
  quote:
    "amber Student have supported us filling voids across the portfolio for many years. We worked " +
    "closely through Covid to reduce the impact of the pandemic on our students and continue to " +
    "work in partnership to provide excellent accommodation to a global audience. We look forward " +
    "to a positive ongoing relationship.",
  name: "Linsey Cullen",
  role: "Head of Customer Experience, Fresh",
};



/**
 * The heading is the ONE thing that differs between the two pages that render this.
 *
 * Partner With Us imports this component rather than copying it, so that every figure,
 * the panel, the mat and the quote stay identical on both pages by construction. Its
 * heading is the exception — that page calls the section "Housing, solved at global
 * scale." — so it comes in as a prop rather than forking the component. The default is
 * this page's own wording, so List With Us renders exactly as it did before the prop
 * existed.
 */
interface WhyPartnersProps {
  heading?: string;
  /**
   * The testimonial under the panel. Defaults to `VOICE` — the Fresh quote, which is a
   * PBSA operator and therefore this page's audience.
   *
   * Partner With Us overrides it: an operator talking about filling voids across a
   * portfolio says nothing to an education consultant, which is who that page is for.
   * Same reasoning as `heading` — one component, and the handful of things that must
   * differ per page come in as props rather than by forking it.
   */
  voice?: { quote: string; name: string; role: string };
}

const WhyPartners = ({
  heading = "Global reach, built for bookings",
  voice = VOICE,
}: WhyPartnersProps) => (
  <section className={styles.section}>
    <div className={styles.inner}>
      <Reveal as="h2" className={styles.heading}>
        {heading}
      </Reveal>

      {/* ⚠️  TWO ELEMENTS, AND THE OUTER ONE IS THE MAT. The hatched band around the panel cannot be
          drawn by the panel itself: a `box-shadow` can only be a flat colour, and a `::before` at
          `z-index: -1` paints ABOVE its own parent's background rather than behind it — the spec
          paints a stacking context's background first and negative children after. Both were tried;
          the second put the hatch straight over the figures.

          So the mat is a real PARENT with 8px of padding, and the panel's own background covers its
          middle for free. `Reveal` sits on the mat rather than the panel so the two animate as one
          piece instead of the panel sliding inside a static frame. */}
      <Reveal className={styles.frame}>
        <div className={styles.grid}>
          {FIGURES.map((figure, i) => (
            <div className={styles.card} key={figure.label}>
              {/* ⚠️  `autoPlay` WITH A STAGGERED `delay`, not the controlled `play` prop.
                  `InlineLottie` ignores `delay` on its controlled path, so a wave would otherwise
                  need ten timers here. Capped at the ninth so the last mark is not left waiting most
                  of a second.

                  ⚠️  These used to mount only when someone pressed the variant switch, so playing on
                  mount was always in view. With the switch gone this section can be below the fold on
                  load and the wave may run unseen — if that matters, drive `play` from an
                  IntersectionObserver on the section and stagger it with timers. */}
              <span className={styles.mark}>
                <InlineLottie
                  data={figure.lottie}
                  size={MARK_SIZE}
                  autoPlay
                  delay={Math.min(i, 8) * 60}
                />
              </span>

              <div className={styles.cardCopy}>
                <p className={styles.cardTitle}>{figure.value}</p>
                <p className={styles.cardLabel}>{figure.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* The testimonial sits INSIDE the mat, under the panel — the design's arrangement, and the
            reason it is here rather than in its own section. */}
        <div className={styles.voice}>
          <p className={styles.quote}>&ldquo;{voice.quote}&rdquo;</p>

          <div className={styles.avatarWrap}>
            {/* `alt=""` — decorative: the name is right beneath it in text, and this is a stand-in
                photo rather than a picture of the person named. `isNotLazy` because the shared Image
                otherwise fades itself in from opacity 0, and the whole block already arrives as one
                piece under `Reveal`. */}
            <Image
              src={voiceAvatar}
              alt=""
              className={styles.avatar}
              width={44}
              height={44}
              isNotLazy
            />
            <div className={styles.who}>
              <p className={styles.whoName}>{voice.name}</p>
              <p className={styles.whoRole}>{voice.role}</p>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default wrapperHOC(WhyPartners, {
  componentName: "WhyPartners-ListWithUs",
  showForChina: true,
});
