import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Tools.module.scss";
import triUp from "../../assets/icons/tri-up.svg";
import starFilled from "../../assets/icons/star-filled.svg";
import starEmpty from "../../assets/icons/star-empty.svg";
/**
 * A real photograph in the listing chip's thumbnail slot.
 *
 * It is the same frame `Steps` uses for Chapter Spitalfields, deliberately — the two sections
 * name the same property, and a listing row whose thumbnail is a grey square is the single
 * clearest tell that a mock-up was drawn rather than captured.
 */
import thumbChapter from "../../assets/step-thumb-1.jpg";
/**
 * The review author's avatar.
 *
 * A PHOTOGRAPH, where this was initials in a tinted circle. Initials are what an interface
 * falls back to when it has no picture of someone — so a mock-up that shows them is quietly
 * saying this account has never been filled in, and every avatar in the illustration being a
 * fallback is one of the tells that reads as unfinished.
 *
 * This is one of the three hero portraits, freed when the h1's avatar cluster was removed. It
 * is the same crop the hero used, so the face is already framed for a small circle.
 */
import reviewerAvatar from "../../assets/avatar-1.png";
/**
 * The amber connect lockup, for LIGHT grounds.
 *
 * ⚠️  The source ships two files whose names are the wrong way round from how they read:
 * `amber-connect-logo.svg` carries the wordmark in #0A0A0A and is the one for a white
 * section, while `amber-connect-logo-dark.svg` is #F5F5F5 — the DARK-BACKGROUND variant, not
 * the dark-ink one. Only the light-ground file is in the repo, since every band that shows
 * this is white; the other is in the same source folder if a dark section ever needs it.
 */
import amberConnect from "../../assets/logos/amber-connect.svg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Tools to manage your property" — a horizontal rail of cards: a gradient tile with one
 * small piece of amber connect floating on it, and the copy underneath.
 *
 * ── Why the art is a CHIP and not a dashboard ───────────────────────────────
 * Each tile used to hold a full connect panel — a 319px card with a crumb, a featured block,
 * a column header and three or four data rows — first at native size, then scaled to 83%.
 * Both were wrong, and scaling was the worse of the two: it shrank 11px type to 9px, so the
 * art was simultaneously the busiest thing on the page and the least legible. A whole
 * dashboard is not a picture of a feature, it is a picture of an application.
 *
 * So each card carries ONE FRAGMENT instead: the listing that just published, the offer
 * that is running, the number that moved, the review that landed. Three rows, ~244px, at a
 * type size nobody has to lean in for — and the tile's ground stays visible around it, which
 * is what makes it read as a product surface rather than a screenshot pasted on a colour.
 *
 * These are drawn for this section rather than borrowed from `../mock`: those classes are
 * tuned to a 319px panel, and at chip scale their paddings and rules are all a size too big.
 *
 * ── Why a rail ─────────────────────────────────────────────────────────────
 * This section was a 424px tab column beside a stack of tall media panels, pinned and
 * pointing at whichever panel filled the viewport. That shape is fixed at three: every entry
 * costs a screen of vertical page, so a fourth tool meant four screens before the next
 * section. A rail costs the same height whether it holds three cards or nine — entries go in
 * `CARDS` and the track gets longer. Same move, mechanics and reasoning as Partner With Us's
 * `Benefits`, so the two pages share one rail idiom.
 */

/**
 * ── WHY THESE ARE BUILT THE WAY THEY ARE ────────────────────────────────────
 * The first pass at these chips was a label, a big number and a badge. That is a STAT
 * WIDGET, not a product surface — it reports a value, and reporting a value is what every
 * generic dashboard illustration does, which is exactly why it read as filler.
 *
 * What separates the reference's floating fragments from that is AFFORDANCE: each one shows
 * a control a person could reach for — a composer with a send button, a file chip, a set of
 * mode pills. You can tell it is software because you can tell what you would touch.
 *
 * So every chip here carries exactly one live control and nothing decorative:
 *
 *   · Listings  -> a publish TOGGLE, over a real photograph of the property.
 *   · Boost     -> a discount SLIDER with its handle off-centre.
 *   · Analytics -> a range SELECT, and a chart with a value called out on it.
 *   · Reviews   -> a rating BREAKDOWN, which is the thing you actually read a 4.7 from.
 *
 * One control, not three: a chip with a toggle and a slider and a dropdown is a settings
 * panel, and we are back to drawing an application.
 */

const Stars = ({ filled }: { filled: number }) => (
  <span className={styles.chipStars}>
    {[0, 1, 2, 3, 4].map((i) => (
      <img
        key={i}
        src={i < filled ? starFilled : starEmpty}
        alt=""
        className={styles.chipStar}
      />
    ))}
  </span>
);

const Caret = () => (
  <svg
    className={styles.caret}
    width="8"
    height="5"
    viewBox="0 0 8 5"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/* ------------------------------------------------------------- the four chips */

const ListingChip = () => (
  <div className={styles.chip}>
    <div className={styles.chipRow}>
      {/* Not lazy and not the shared `Image`: it is 40px, it is inside the art, and the
          shared component's fade-and-scale entrance would have it swim into place after
          the card has already arrived. */}
      <img src={thumbChapter} alt="" className={styles.chipThumb} />
      <span className={styles.chipStack}>
        <span className={styles.chipTitle}>Chapter Spitalfields</span>
        <span className={styles.chipNote}>London · 24 rooms</span>
      </span>
    </div>

    <span className={styles.chipRule} />

    <div className={styles.chipBetween}>
      <span className={styles.chipMeta}>Published</span>
      {/* Drawn ON, because the row above it is a live listing. A toggle drawn off would be
          a card advertising a property that is not visible. */}
      <span className={styles.toggle} aria-hidden="true">
        <span className={styles.toggleKnob} />
      </span>
    </div>
  </div>
);

const BoostChip = () => (
  <div className={styles.chip}>
    <div className={styles.chipBetween}>
      <span className={styles.chipMeta}>Early bird 2026/27</span>
      <span className={styles.chipLive}>
        <i className={styles.chipDot} />
        Live
      </span>
    </div>

    <div className={styles.chipOffer}>
      <span className={styles.chipValue}>15%</span>
      <span className={styles.chipUnit}>off</span>
    </div>

    {/* The handle sits at 15 of a 0–30 range, so the control agrees with the number above it
        — a slider parked at a value its own label contradicts is the kind of detail that
        makes a mock-up feel invented. */}
    <span className={styles.slider} aria-hidden="true">
      <span className={styles.sliderFill} />
      <span className={styles.sliderKnob} />
    </span>

    <span className={styles.chipNote}>Sept intake · all studios</span>
  </div>
);

const AnalyticsChip = () => (
  <div className={styles.chip}>
    <div className={styles.chipBetween}>
      <span className={styles.chipMeta}>Bookings</span>
      <span className={styles.chipSelect}>
        30 days
        <Caret />
      </span>
    </div>

    <div className={styles.chipFigure}>
      <span className={styles.chipValue}>4,849</span>
      <span className={styles.chipDelta}>
        <img src={triUp} alt="" className={styles.chipDeltaIcon} />
        12%
      </span>
    </div>

    {/* An area chart rather than eight divs. Bars at this size are a row of stubs; a curve
        reads as a trend, which is what the copy beside it promises. `preserveAspectRatio` is
        default, so the path stretches to the chip's measure and needs no JS to size.

        The gradient id is namespaced. SVG ids are GLOBAL to the document, not scoped by the
        CSS module, and this chip renders once per page today but the rail is built to grow. */}
    <svg className={styles.area} viewBox="0 0 224 58" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lwuToolsArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c64f2" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1c64f2" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 44C16 42 24 30 42 32C60 34 68 42 86 38C104 34 112 20 130 22C148 24 156 15 174 11C192 7 206 13 224 6V58H0V44Z"
        fill="url(#lwuToolsArea)"
      />
      <path
        d="M0 44C16 42 24 30 42 32C60 34 68 42 86 38C104 34 112 20 130 22C148 24 156 15 174 11C192 7 206 13 224 6"
        stroke="#1c64f2"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="224" cy="6" r="3" fill="#fff" stroke="#1c64f2" strokeWidth="1.8" />
    </svg>
  </div>
);

const REVIEW_SPLIT = [
  { stars: 5, share: 68 },
  { stars: 4, share: 21 },
  { stars: 3, share: 8 },
];

const ReviewChip = () => (
  <div className={styles.chip}>
    <div className={styles.chipBetween}>
      <div className={styles.chipFigure}>
        <span className={styles.chipValue}>4.7</span>
        <Stars filled={5} />
      </div>
      <span className={styles.chipNote}>312 reviews</span>
    </div>

    {/* The breakdown, not another headline number. A 4.7 on its own is a claim; the split
        under it is the evidence, and it is what a partner actually opens this screen to read. */}
    <span className={styles.bars} aria-hidden="true">
      {REVIEW_SPLIT.map((row) => (
        <span className={styles.barRow} key={row.stars}>
          <span className={styles.barNum}>{row.stars}</span>
          <span className={styles.barTrack}>
            <span className={styles.barFill} style={{ width: `${row.share}%` }} />
          </span>
          <span className={styles.barPct}>{row.share}%</span>
        </span>
      ))}
    </span>

    <span className={styles.chipRule} />

    <div className={styles.chipRow}>
      <img src={reviewerAvatar} alt="" className={styles.chipAvatar} />
      <span className={styles.chipStack}>
        <span className={styles.chipTitle}>Patrick John</span>
        <span className={styles.chipNote}>Urbanest Tower Bridge</span>
      </span>
    </div>
  </div>
);

/**
 * ⚠️  ORDER IS THE WORKFLOW, not a ranking. It runs the way a partner meets these tools:
 * get the listing up, push it, read what it did, answer what came back. Analytics used to
 * lead, which meant the section opened on a report about a listing the reader has not been
 * shown how to create.
 *
 * ── `tone` is the tile's ground ─────────────────────────────────────────────
 * One supplied gradient per card: deep blue, iris, prism, mint. `tone` names the class
 * DIRECTLY, which is why the values read as class names rather than as colours — the
 * alternative was a lookup object mapping "mint" to `styles.tileMint`, which is a second
 * place to edit every time a ground is added. The default (no `tone`) is `.tile`'s own blue.
 *
 * ⚠️  Three of the four are PALE, and the chip on them is white — so the deep blue on the
 * first card is load-bearing rather than decorative. It is what stops the row reading as a
 * wash, and it is on the FIRST card so the section opens on the saturated one. If the
 * grounds are ever reshuffled, keep a deep one at the start.
 */
const CARDS = [
  {
    id: "listings",
    label: "Manage listings",
    body: "Create and update listings easily through our integrated content management system.",
    art: <ListingChip />,
  },
  {
    id: "promotions",
    label: "Boost your listings",
    // ⚠️  DRAFT SECOND SENTENCE. The brief for this entry arrived as "Use our" and stopped
    // mid-phrase, so the rest is written from what the chip beside it shows — Connect's
    // campaigns, with an early-bird offer running. Replace with the intended wording; the
    // label and the chip are the parts that were specified.
    body: "Use our campaign tools to run early-bird pricing, seasonal offers and returning-guest rates across any part of your portfolio.",
    art: <BoostChip />,
    tone: "tileIris",
  },
  {
    id: "analytics",
    label: "Analytics",
    body: "Get instant insights into performance trends so you can act quickly and make informed business decisions.",
    art: <AnalyticsChip />,
    tone: "tilePrism",
  },
  {
    id: "reviews",
    label: "Guest reviews & ratings",
    body: "See every review as it lands, across Google, Facebook and amber's own student ambassadors.",
    art: <ReviewChip />,
    tone: "tileMint",
  },
];

/** How many cards sit across the measure while they still fit, and the gap between them. */
const ACROSS = 3;
const GAP = 24;

/**
 * A card's width. Fixed once there are more cards than fit, so the extra ones overflow into
 * a scrollable track instead of every card getting thinner as entries are added.
 */
const cardWidth = (count: number) =>
  count > ACROSS ? "356px" : `calc((100% - ${GAP * (ACROSS - 1)}px) / ${ACROSS})`;

const Tools = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      <div className={styles.head}>
        <Reveal as="h2" className={styles.heading}>
          Tools to manage your property
        </Reveal>

        {/* `amber connect` is the product these chips are pieces OF, and the section never
            said so — it read as four unnamed features. On the right of the heading rather
            than inside a sentence, which is where amber puts this attribution elsewhere (the
            "Powered by amber+" lockup on Move-In Ready).

            `alt` names the PRODUCT only: "Powered by" is this paragraph's own text, so
            repeating it in the alt would have a screen reader say it twice.

            Width and height are the file's own 155x28 so the box is reserved before the SVG
            lands and the heading row cannot jump; `.poweredLogo` then drives the rendered
            size off height alone. */}
        <p className={styles.poweredBy}>
          Powered by{" "}
          <img
            src={amberConnect}
            alt="amber connect"
            className={styles.poweredLogo}
            width={155}
            height={28}
          />
        </p>
      </div>

      {/* ── NO CHEVRONS, AND THEREFORE NO STATE ────────────────────────────
          The rail had a pair of disc buttons and the machinery to drive them: a scroll
          listener throttled to a frame, a measured card pitch, a stop count derived from the
          track's real scroll distance, and three pieces of state for the index and the two
          disabled edges. All of it existed to move a track that the browser already moves.

          They are gone, so the rail is now CSS: a scroll-snapping overflow container. A
          trackpad, a wheel, a touch drag and the keyboard all still scroll it, and the peek
          of the next card at the window's edge is the affordance — which is what it was doing
          anyway, since the chevrons sat up beside the heading rather than on the track.

          ⚠️  If chevrons ever come back, they need all of that machinery back with them: the
          buttons cannot be driven off an index alone, because a native swipe moves the track
          without going through any handler and leaves the back button greyed out while the
          track is plainly scrolled in. Partner With Us's Benefits still has the working
          version to copy. */}
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ "--card-w": cardWidth(CARDS.length) } as React.CSSProperties}
        >
          {CARDS.map((card, i) => (
            <Reveal as="article" className={styles.railCard} key={card.id} delay={i * 80}>
              {/* Art first, copy under it, and the art is a self-contained tile rather than
                  the top half of a grey card. The chip is centred on the tile with the ground
                  visible all round it — nothing is cropped, because at this size there is
                  nothing worth cropping. */}
              <div
                className={`${styles.tile} ${card.tone ? styles[card.tone] : ""}`}
              >
                {card.art}
              </div>

              <div className={styles.copy}>
                <h3 className={styles.cardTitle}>{card.label}</h3>
                <p className={styles.cardBody}>{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default wrapperHOC(Tools, {
  componentName: "Tools-ListWithUs",
  showForChina: true,
});
