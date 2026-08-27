import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import InventoryGlobe from "./InventoryGlobe";
import SupportChat from "./SupportChat";
import BookingCard from "./BookingCard";
import PerformanceCard from "./PerformanceCard";
import Receipt from "./Receipt";
import mock from "../mock/mock.module.scss";
import styles from "./Features.module.scss";
import flagIn from "../../assets/flags/in.png";
import flagNg from "../../assets/flags/ng.png";
import flagCn from "../../assets/flags/cn.png";
import flagVn from "../../assets/flags/vn.png";
import agentAvatar from "../../assets/avatar-2.png";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "What you get when you list" — a horizontal rail of five feature cards.
 *
 * ── The shape is Partner With Us's `Benefits`, deliberately ─────────────────
 * Copy at the TOP of a grey card, art below it running off the card's bottom edge. That is the
 * sibling page's pattern and it is ported rather than reinvented, so the two pages share one
 * card idiom.
 *
 * ⚠️  It is also deliberately NOT this page's other rail. `Tools` puts a gradient tile on top
 * with the copy underneath; this one is a grey card with the copy on top. Two rails one after
 * another on the same page need to be told apart at a glance, and the difference is structural
 * rather than decorative — they read as different kinds of thing, which they are: `Tools` shows
 * a product's surfaces, this shows what a partner gets.
 *
 * ── No chevrons, matching `Tools` ──────────────────────────────────────────
 * Partner With Us's version has a disc pair beside the heading. They are left out here because
 * they were removed from `Tools` on this page, and one rail with arrows beside one without
 * reads as an oversight rather than a choice. The peek of the next card at the window's edge is
 * the affordance, and the viewport scrolls natively — trackpad, wheel, touch and keyboard.
 *
 * ── The art ────────────────────────────────────────────────────────────────
 * Five drawn panels in this page's own `mock` language (`../mock`), not screenshots and not new
 * primitives. Each shows ONE thing and stops: a market split, a fee line, a booking's state, a
 * performance row, a support reply. The lesson from `Tools` applies — a panel that tries to be
 * a whole dashboard reads as filler, and at card width its type is unreadable anyway.
 *
 * None of them repeats a `Tools` chip. That section already shows a listing toggle, a campaign
 * slider, a bookings chart and a review breakdown; these are the five things a partner gets
 * rather than the four screens they would use.
 */

/* ------------------------------------------------------------------ the art */

const MARKETS = [
  { flag: flagIn, name: "India", share: 28 },
  { flag: flagNg, name: "Nigeria", share: 14 },
  { flag: flagCn, name: "China", share: 11 },
  { flag: flagVn, name: "Vietnam", share: 9 },
];

/**
 * Source markets, with real flags.
 *
 * The percentages are ILLUSTRATIVE like every other figure on this page, but they are ordered
 * and they sum to less than 100 — a four-row split that added up to exactly 100 would be
 * claiming these are the only markets, and the copy beside it says the opposite.
 */
/**
 * The demand card's art: a turning globe pinned with student avatars, with the drawn market
 * panel below as its fallback.
 *
 * ── Mounted only once the card is on screen ────────────────────────────────
 * ⚠️  This is the page's SECOND Mapbox map and map loads are BILLED — the hero runs the first.
 * So it is gated on an IntersectionObserver rather than mounted with the section: a reader who
 * never scrolls this far never loads a map. `rootMargin` starts it a little before it arrives so
 * the tiles are in by the time it is looked at.
 *
 * The fallback is not a nicety. A globe needs a third-party script, a live token and WebGL2, and
 * a card that renders an empty hole when any of those is missing is worse than one showing a
 * list — so `InventoryGlobe` reports failure and this swaps to exactly what the card had before.
 */
const DemandArt = () => {
  const box = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [failed, setFailed] = useState(false);
  // Identity-stable, or the globe's effect would tear down and rebuild the map on every render.
  const onFail = useCallback(() => setFailed(true), []);

  useEffect(() => {
    const node = box.current;
    if (!node || typeof IntersectionObserver !== "function") {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className={styles.globeBox}>
      {seen && !failed ? <InventoryGlobe onFail={onFail} /> : <MarketsArt />}
    </div>
  );
};

const MarketsArt = () => (
  <div className={`${mock.panel} ${styles.art}`}>
    <div className={mock.crumb}>
      <span className={mock.crumbL}>SOURCE MARKETS</span>
      <span className={mock.crumbR}>160+ COUNTRIES</span>
    </div>
    <span className={mock.rule} />

    {MARKETS.map((m) => (
      <div className={styles.marketRow} key={m.name}>
        <img src={m.flag} alt="" className={styles.flag} />
        <span className={styles.marketName}>{m.name}</span>
        <span className={styles.marketTrack}>
          <span className={styles.marketFill} style={{ width: `${(m.share / 28) * 100}%` }} />
        </span>
        <span className={styles.marketPct}>{m.share}%</span>
      </div>
    ))}
  </div>
);

/**
 * The fee sheet.
 *
 * The two zeroes are the point, so they are the only ink with weight on them. The commission
 * row is NOT given a number: this page does not publish a rate anywhere else, and inventing one
 * in a mock-up is the kind of detail that gets quoted back.
 */
/**
 * The fee panel is now a receipt — see Receipt.tsx for why, and for the rule about what may go on
 * it. `FeesArt` was three rows of label-and-value in a `mock.panel`; it read as a spreadsheet
 * fragment and left half the card empty.
 */
const FeesArt = () => <Receipt />;

/**
 * Both of these were a header, a rule and three or four rows in a `mock.panel`, and both filled
 * about 40% of their card — see the notes in BookingCard.tsx and PerformanceCard.tsx for what
 * replaced them and why. `TRAIL` and `METRICS` moved into those files with the markup.
 */
const BookingArt = () => <BookingCard />;

const PerformanceArt = () => <PerformanceCard />;

const CARDS = [
  {
    id: "demand",
    label: "Access global demand",
    body: "Put your rooms in front of millions of students searching across key education markets worldwide.",
    art: <DemandArt />,
    // The globe goes edge to edge; every other panel keeps the left inset. A picture of the
    // earth with a margin down one side reads as the planet floating in a box.
    bleed: true,
  },
  {
    id: "fees",
    // ⚠️  `bleed` HERE MEANS "THE MEDIA WINDOW SPANS THE CARD'S FULL WIDTH", which this panel uses to
    // CENTRE rather than to bleed. Without it the window is inset 28px on the left and flush on the
    // right, so a panel with symmetric margins sits 46px from the card's left edge and 18px from its
    // right — visibly off-centre. Full width plus the panel's own equal margins is what centres it.
    bleed: true,
    label: "Zero listing fees",
    body: "Get started without upfront listing costs. You pay for outcomes, not visibility.",
    art: <FeesArt />,
  },
  {
    id: "bookings",
    // ⚠️  `bleed` HERE MEANS "THE MEDIA WINDOW SPANS THE CARD'S FULL WIDTH", which this panel uses to
    // CENTRE rather than to bleed. Without it the window is inset 28px on the left and flush on the
    // right, so a panel with symmetric margins sits 46px from the card's left edge and 18px from its
    // right — visibly off-centre. Full width plus the panel's own equal margins is what centres it.
    bleed: true,
    label: "Fully integrated bookings",
    body: "No chasing enquiries, calls, or overflowing inboxes. amber takes students from discovery through to confirmed booking.",
    art: <BookingArt />,
  },
  {
    id: "performance",
    // ⚠️  `bleed` HERE MEANS "THE MEDIA WINDOW SPANS THE CARD'S FULL WIDTH", which this panel uses to
    // CENTRE rather than to bleed. Without it the window is inset 28px on the left and flush on the
    // right, so a panel with symmetric margins sits 46px from the card's left edge and 18px from its
    // right — visibly off-centre. Full width plus the panel's own equal margins is what centres it.
    bleed: true,
    label: "Track performance",
    body: "Monitor demand, bookings, conversion and property performance with clear, actionable insights.",
    art: <PerformanceArt />,
  },
  {
    id: "support",
    label: "Support when you need it",
    body: "From onboarding to ongoing growth, our team is available 24/7 to help you succeed.",
    art: <SupportChat />,
    // ⚠️  NOT bleed. This was briefly `bleed: true` on the reasoning that the thread is the whole
    // art — and it put the bubbles hard against the card's left edge, because the card carries no
    // left padding of its own (`.copy` and `.media` apply the inset separately). The thread
    // already handles its own right and bottom edges with `padding-right` / `padding-bottom`; the
    // left inset is the card's job, exactly as on Partner With Us, where this card does not bleed
    // either. Only the globe does.
  },
];

/** How many cards sit across the measure while they still fit, and the gap between them. */
const ACROSS = 3;
const GAP = 24;

/**
 * A card's width. Fixed once there are more cards than fit, so the extra ones overflow into a
 * scrollable track instead of every card getting thinner as entries are added.
 */
const cardWidth = (count: number) =>
  count > ACROSS ? "356px" : `calc((100% - ${GAP * (ACROSS - 1)}px) / ${ACROSS})`;

const Features = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      <Reveal as="h2" className={styles.heading}>
        What you get when you list
      </Reveal>

      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ "--card-w": cardWidth(CARDS.length) } as React.CSSProperties}
        >
          {CARDS.map((card, i) => (
            <Reveal as="article" className={styles.card} key={card.id} delay={i * 70}>
              <div className={styles.copy}>
                <h3 className={styles.cardTitle}>{card.label}</h3>
                <p className={styles.cardBody}>{card.body}</p>
              </div>

              {/* Inset on the left and top only, so the panel runs off the card's bottom edge.
                  That crop is what says the frame is a window onto a bigger product rather than
                  a small picture of one. */}
              <div
                className={`${styles.media} ${card.bleed ? styles.mediaBleed : ""}`}
              >
                {card.art}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default wrapperHOC(Features, {
  componentName: "Features-ListWithUs",
  showForChina: true,
});
