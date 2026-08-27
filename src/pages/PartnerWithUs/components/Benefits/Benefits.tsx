import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import mock from "../mock/mock.module.scss";
import styles from "./Benefits.module.scss";
import InventoryGlobe from "./InventoryGlobe";
import IntegrationRows from "./IntegrationRows";
import SupportChat from "./SupportChat";
import mockupDashboard from "../../assets/mockup-dashboard.png";
import mockupWhitelabel from "../../assets/mockup-whitelabel.png";
import mockupPlus from "../../assets/mockup-plus.png";
import amberFlexLogo from "../../assets/amber-flex-logo.png";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Everything you get as a partner." — a horizontal rail of cards.
 *
 * ── Why this replaced the sticky rail ───────────────────────────────────────
 * This was a 424px tab column beside a stack of tall media panels, with the
 * column pinned and pointing at whichever panel filled the viewport. That shape
 * is fixed at THREE: every entry costs a full panel of vertical page — roughly a
 * screen each — so a fourth and fifth benefit turned the section into four
 * screens of scrolling before the next one, and the pinned column had to stay
 * level with a stack whose height it no longer matched. More entries are coming,
 * so the section had to stop paying a screen for each of them.
 *
 * A rail costs the same height whether it holds three cards or nine: entries are
 * added to `CARDS` and the track simply gets longer. The scroll mechanic is
 * deliberately the SAME one this page's Testimonials uses — a natively scrolling
 * viewport with chevrons that read the track's real position — so the page has one
 * horizontal-rail idiom rather than two. Testimonials pairs its chevrons with a
 * pill of dots; this rail does not (see the control block below).
 *
 * ── What was dropped, and why ──────────────────────────────────────────────
 * Each panel used to be a screenshot inside a glass bezel over a full-bleed
 * photograph (`panel-dashboard.jpg` and its two siblings, now unused). At panel
 * width that stack read as three layers; at card width the photo is a sliver
 * behind a frame behind a screenshot, and the screenshot — the only part that
 * says what the product does — is the one that loses. So the card carries the
 * screenshot alone, at a size where its UI is still legible, cropped by the
 * card's own edges.
 *
 * NOTE (carried over): the Figma file puts the white-label sentence ("Sell
 * amber's inventory under your own brand…") under the Dedicated Dashboard label,
 * where it matches neither that label nor the dashboard screenshot. The copy is
 * on the White Label entry here and the dashboard has its own line; confirm the
 * final wording with the partnerships team before this goes upstream.
 */
/**
 * A product screenshot in a browser window.
 *
 * The three real screenshots used to sit in a bare bezel, which read as a cropped
 * picture rather than as a product. A window frame says "this is a screen you would
 * actually be looking at" — and it costs one 26px bar.
 *
 * ── The pill carries no URL, deliberately ─────────────────────────────────
 * A written address would be the most convincing detail in the frame and it is the
 * one thing here that would be invented: none of these surfaces has a public domain
 * to quote, and `flex.amber.com` in a marketing visual is a claim about a product
 * that may not exist at that address. An empty pill reads as a browser without
 * asserting anything. The dots are grey rather than the traffic-light colours for the
 * same reason — this is a neutral frame, not an imitation of one vendor's browser.
 */
const Screenshot = ({ src, alt }: { src: string; alt: string }) => (
  <div className={styles.shot}>
    <div className={styles.chrome} aria-hidden="true">
      <span className={styles.dots}>
        <i />
        <i />
        <i />
      </span>
      <span className={styles.urlPill} />
    </div>

    <div className={styles.shotBody}>
      <Image
        src={src}
        alt={alt}
        className={styles.mockup}
        width={520}
        height={328}
        isNotLazy
      />
    </div>
  </div>
);

/* ------------------------------------------------- the three drawn mock-ups */

/**
 * Three of the six benefits have a real product screenshot. The other three do not
 * exist as a screen yet and are built rather than borrowed — a repeated screenshot
 * says the wrong thing about the product, and a card with no art breaks the row.
 * Each of the three is its own component, because each shows a different KIND of
 * thing:
 *
 *   · Global housing inventory  -> InventoryGlobe, a turning Mapbox globe.
 *   · Flexible integrations     -> IntegrationRows, the four ways in, connecting.
 *   · Student support, handled  -> SupportChat, the support thread running.
 *
 * The panel below is the globe's fallback only; it is no longer a pattern the other
 * cards use.
 */
/**
 * The inventory card's art: a turning Mapbox globe with the destinations pinned
 * using Mapbox's own `lodging` icon.
 *
 * The drawn panel below is kept as its FALLBACK rather than deleted. The globe
 * depends on a third-party script, a live token and WebGL2, and a benefit card
 * that renders an empty hole when any of those is missing is worse than one
 * showing a list — so `InventoryGlobe` reports failure and this swaps back to
 * exactly what the card had before.
 */
const InventoryCardArt = () => {
  const [failed, setFailed] = useState(false);
  // Identity-stable, or the globe's effect would tear down and rebuild the map on
  // every render of this card.
  const onFail = useCallback(() => setFailed(true), []);
  return failed ? <InventoryPanelArt /> : <InventoryGlobe onFail={onFail} />;
};

const InventoryPanelArt = () => (
  <div className={`${mock.panel} ${styles.drawn}`}>
    <div className={mock.crumb}>
      <span className={mock.crumbL}>INVENTORY</span>
      <span className={mock.crumbR}>1M+ BEDS</span>
    </div>
    <span className={mock.rule} />
    <div className={styles.drawnRows}>
      {[
        { city: "London", beds: "48,210" },
        { city: "Sydney", beds: "31,400" },
        { city: "Dublin", beds: "12,650" },
        { city: "Toronto", beds: "9,840" },
        { city: "Berlin", beds: "7,420" },
      ].map((row, i) => (
        <div className={mock.row} key={row.city}>
          <span className={styles.drawnLeft}>
            <span className={`${mock.dot} ${i === 0 ? mock.dotActive : ""}`} />
            <span className={mock.name}>{row.city}</span>
          </span>
          <span className={`${mock.value} ${mock.valueMuted}`}>{row.beds}</span>
        </div>
      ))}
    </div>
  </div>
);

/**
 * The benefits, in the order the partnerships brief lists them.
 *
 * ⚠️  ADDING ONE IS JUST AN ENTRY HERE. The rail's height does not change, the
 * card width switches to the peeking constant past three (see `cardWidth`), and
 * the chevrons re-derive their range from the length. Nothing else needs touching
 * — which is the whole reason this section stopped being a sticky rail.
 *
 * `art` is a node rather than an image path because half of these are drawn
 * rather than photographed; see the three components above.
 */
const CARDS = [
  {
    id: "inventory",
    label: "Global housing inventory",
    body: "Give students access to 1M+ beds across major destinations and countries.",
    art: <InventoryCardArt />,
    // The globe goes edge to edge; every other card's art keeps the left inset.
    bleed: true,
  },
  {
    id: "flex-dashboard",
    // The wordmark carries "amber flex"; only "Dashboard" is typed. Same reasoning as
    // the body copy below — the two-tone lockup is never approximated in a typeface.
    label: (
      <>
        <Image
          src={amberFlexLogo}
          alt="amber flex"
          className={styles.titleMark}
          width={220}
          height={40}
          isNotLazy
        />{" "}
        Dashboard
      </>
    ),
    // The trailing "via amber flex" clause is gone with the wordmark that replaced it:
    // the title above already carries the mark, so the sentence was naming the product
    // twice in three lines. Removing only the image would have left "…from one place,
    // via ." — the clause had to go with it.
    body: "Track referrals, bookings, status and earnings from one place.",
    art: (
      <Screenshot
        src={mockupDashboard}
        alt="The amber flex dashboard listing student referrals with their status and destination city"
      />
    ),
  },
  {
    id: "white-label",
    label: "White-label experiences",
    body: "Offer our housing inventory under your own brand and domain.",
    art: (
      <Screenshot
        src={mockupWhitelabel}
        alt="A university-branded off-campus housing page powered by amber"
      />
    ),
  },
  {
    id: "integrations",
    label: "Flexible integrations",
    body:
      "Start with a simple referral link or integrate deeper through widgets, APIs or white-label solutions.",
    art: <IntegrationRows />,
  },
  {
    id: "support",
    label: "Student support, handled",
    body:
      "Amber helps students through search, comparison, booking and post-booking support.",
    art: <SupportChat />,
  },
  {
    id: "amber-plus",
    label: "amber+ services",
    body:
      "Extend your offering with flights, forex, SIMs, airport transfers and other student essentials.",
    art: (
      <Screenshot
        src={mockupPlus}
        alt="The amber Plus marketplace offering forex, flights, SIM cards and airport pickup"
      />
    ),
  },
];

/** Treated as "at the end" within this many px, so a sub-pixel scrollLeft still counts. */
const EDGE = 2;

/** Cards that fit the 1280px measure whole, and the gap between them. */
const ACROSS = 3;
const GAP = 24;

/**
 * The card width, which depends on HOW MANY cards there are — the one thing about
 * this rail that cannot be settled in CSS alone.
 *
 * Up to `ACROSS` entries there is nothing to scroll to, so they divide the measure
 * and the row fills it: a fixed width here would leave a stripe of dead space to
 * the right and two greyed-out chevrons, which reads as broken rather than as
 * complete. From the moment there is one more than fits, the width becomes a
 * constant and the surplus turns into a PEEK of the next card at the viewport's
 * edge — the section's "there is more" signal, and the reason the width stops
 * being a fraction: dividing by the count would keep re-narrowing every card each
 * time an entry was added and the peek would never appear.
 */
const cardWidth = (count: number) =>
  count > ACROSS ? "356px" : `calc((100% - ${GAP * (ACROSS - 1)}px) / ${ACROSS})`;

/**
 * ⚠️  The twin of this lives in Testimonials, and the two must stay identical —
 * they are the same control in the same page. Kept local rather than shared
 * because two copies of a ten-line path is cheaper than a shared component
 * imported across sibling folders; if a third rail appears, lift both.
 *
 * Drawn rather than imported for the reason Testimonials gives: the exported
 * icons bake in the states the design happened to be showing — a pale #c9c9c9
 * back chevron beside a dark #202020 forward one — so as flat images the back one
 * stays greyed out even once it is usable. Taking the stroke from currentColor
 * hands that decision to the button, which knows whether it is disabled.
 */
const Chevron = ({ back = false }: { back?: boolean }) => (
  <svg
    className={styles.chev}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d={back ? "M11 2L5 8L11 14" : "M5 2L11 8L5 14"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * How far one card advances the track: a card's own width plus the gap after it.
 *
 * ⚠️  Measured off a real card, NOT derived from `scrollWidth`. It used to be
 * `(scrollWidth + gap) / count`, which was correct only while the track had no
 * padding of its own — the track now carries a gutter at each end so the first and
 * last cards can come to rest on the page's measure, and those two gutters land in
 * `scrollWidth` and inflate every pitch computed from it. One card's rect cannot go
 * wrong that way.
 */
const cardPitch = (node: HTMLDivElement) => {
  const track = node.firstElementChild as HTMLElement | null;
  const card = track?.firstElementChild as HTMLElement | null;
  if (!track || !card) return 0;
  const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
  return card.getBoundingClientRect().width + gap;
};

const Benefits = () => {
  const viewport = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  /** 0 while every card is on screen — that is when the controls are inert. */
  const [maxIndex, setMaxIndex] = useState(0);
  const maxIndexRef = useRef(0);
  // The chevrons read the track's real position rather than the dot index: the
  // viewport scrolls natively, so a trackpad swipe moves the cards without ever
  // going through goTo, and driving the chevrons off the index leaves the back
  // one greyed out while the track is plainly scrolled in from the start.
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  /** Pulls the dot index and both chevron states off wherever the track sits. */
  const sync = useCallback(() => {
    const node = viewport.current;
    if (!node) return;

    const furthest = node.scrollWidth - node.clientWidth;
    setAtStart(node.scrollLeft <= EDGE);
    setAtEnd(node.scrollLeft >= furthest - EDGE);

    const pitch = cardPitch(node);
    if (pitch <= 0) return;
    const nearest = Math.round(node.scrollLeft / pitch);
    setIndex(Math.min(Math.max(nearest, 0), maxIndexRef.current));
  }, []);

  const measure = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const pitch = cardPitch(node);
    // Derived from how far the track can actually SCROLL, not from how many cards
    // look visible. Counting visible cards was fine while the viewport ended at the
    // measure; now that it bleeds to both window edges its `clientWidth` includes
    // both gutters, so that count came out high and the last stop became unreachable.
    // Real scroll distance over one pitch is the number of stops, whatever the
    // padding and bleed happen to be.
    const furthest = node.scrollWidth - node.clientWidth;
    maxIndexRef.current = pitch > 0 ? Math.max(0, Math.ceil(furthest / pitch)) : 0;
    setMaxIndex(maxIndexRef.current);
    sync();
  }, [sync]);

  useEffect(() => {
    const node = viewport.current;
    measure();
    window.addEventListener("resize", measure);

    // Throttled to a frame: a swipe fires scroll far more often than the two
    // booleans and one index can actually change.
    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = window.requestAnimationFrame(() => {
          raf = 0;
          sync();
        });
    };
    if (node) node.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", measure);
      if (raf) window.cancelAnimationFrame(raf);
      if (node) node.removeEventListener("scroll", onScroll);
    };
  }, [measure, sync]);

  const goTo = (next: number) => {
    const node = viewport.current;
    const clamped = Math.min(Math.max(next, 0), maxIndex);
    setIndex(clamped);
    if (node) {
      const reduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      node.scrollTo({
        left: cardPitch(node) * clamped,
        behavior: reduced ? "auto" : "smooth",
      });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <Reveal as="h2" className={styles.heading}>
            Everything you get as a partner.
          </Reveal>

          {/* Chevrons only. There was a pill of dots beside them — Testimonials'
              other half — and it is gone: the rail's stops are not a fixed set of
              slides a reader would want to jump between, they are just how far
              along a row of cards you are, which the cards themselves already
              show. Dropped entirely while everything fits, when they have nothing
              to drive. */}
          {maxIndex > 0 && (
            <div className={styles.discs}>
              <button
                type="button"
                aria-label="Previous benefit"
                className={styles.disc}
                onClick={() => goTo(index - 1)}
                disabled={atStart}
              >
                <Chevron back />
              </button>
              <button
                type="button"
                aria-label="Next benefit"
                className={styles.disc}
                onClick={() => goTo(index + 1)}
                disabled={atEnd}
              >
                <Chevron />
              </button>
            </div>
          )}
        </div>

        <div className={styles.viewport} ref={viewport}>
          <div
            className={styles.track}
            style={{ "--card-w": cardWidth(CARDS.length) } as React.CSSProperties}
          >
            {CARDS.map((card, i) => (
              <Reveal as="article" className={styles.card} key={card.id} delay={i * 80}>
                <div className={styles.copy}>
                  <h3 className={styles.cardTitle}>{card.label}</h3>
                  <p className={styles.cardBody}>{card.body}</p>
                </div>

                {/* Inset on the left and top only, so the art runs off the card's
                    bottom edge — and, for the screenshots, its right edge too. That
                    crop is what says the frame is a window onto a bigger product
                    rather than a small picture of one. */}
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
};

export default wrapperHOC(Benefits, {
  componentName: "Benefits-PartnerWithUs",
  showForChina: true,
});
