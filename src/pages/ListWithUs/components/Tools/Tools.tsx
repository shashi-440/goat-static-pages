import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import mock from "../mock/mock.module.scss";
import styles from "./Tools.module.scss";
import panelAnalytics from "../../assets/panel-analytics.jpg";
import panelPromos from "../../assets/panel-promos.jpg";
import panelReviews from "../../assets/panel-reviews.jpg";
import enquiryIcon from "../../assets/icons/enquiry.svg";
import triDown from "../../assets/icons/tri-down.svg";
import triUp from "../../assets/icons/tri-up.svg";
import starBadge from "../../assets/icons/star-badge.svg";
import starFilled from "../../assets/icons/star-filled.svg";
import starEmpty from "../../assets/icons/star-empty.svg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Tools to manage your property" — Figma node 2483:9240.
 *
 * The three media panels stack and scroll; the list on the left holds its place
 * beside them. Whichever panel currently fills most of the viewport is the one
 * the list points at — that entry opens to show its description and the other
 * two collapse back to a label, which is the design's "tab · active" variant
 * applied one at a time. The entries stay clickable and scroll to their panel.
 */

const BOOKINGS_BY_MONTH = [46, 62, 54, 78, 70, 96, 84, 108];
const BOOKINGS_HIGHLIGHT_FROM = 6;
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A"];

const CAMPAIGNS = [
  { name: "Summer stay offer", note: "Sept intake · London", status: "SCHEDULED", tone: "blue" },
  { name: "Returning guest rate", note: "All properties", status: "ACTIVE", tone: "green" },
  { name: "Referral boost", note: "Ended 12 Jul", status: "ENDED", tone: "grey" },
];

const REVIEWS = [
  { name: "Patrick John", note: "Urbanest Tower Bridge · Google", stars: 5 },
  { name: "Sarah Mitchell", note: "Chapter Spitalfields · Facebook", stars: 3 },
  { name: "James Chen", note: "iQ Shoreditch · Ambassador", stars: 4 },
  { name: "Emily Watson", note: "Unite Students · Google", stars: 2 },
];

const TABS = [
  {
    id: "analytics",
    label: "Real-time analytics",
    body: "Get instant insights into performance trends so you can act quickly and make informed business decisions.",
    image: panelAnalytics,
  },
  {
    id: "promotions",
    label: "Customisable promotions & offers",
    body: "Run early-bird pricing, seasonal offers and returning-guest rates across any part of your portfolio.",
    image: panelPromos,
  },
  {
    id: "reviews",
    label: "Guest reviews & ratings",
    body: "See every review as it lands, across Google, Facebook and amber's own student ambassadors.",
    image: panelReviews,
  },
];

/**
 * Height of the navbar, which is the only part of the header stack still fixed
 * once the announcement rail has scrolled out. Everything reads against this
 * line: the sticky list rests on it, a click scrolls its panel to it, and a
 * panel's progress is how far it has travelled past it.
 */
const HEADER_OFFSET = 104;

const badgeTone = (tone: string) => {
  if (tone === "blue") return mock.badgeBlue;
  if (tone === "grey") return mock.badgeGrey;
  return mock.badgeGreen;
};

const Stars = ({ filled }: { filled: number }) => (
  <span className={styles.stars}>
    {[0, 1, 2, 3, 4].map((i) => (
      <img key={i} src={i < filled ? starFilled : starEmpty} alt="" className={styles.star} />
    ))}
  </span>
);

const AnalyticsCard = () => (
  <div className={styles.card}>
    <div className={mock.crumb}>
      <span className={mock.crumbL}>INSIGHTS</span>
      <span className={mock.crumbR}>LAST 30 DAYS</span>
    </div>

    <div className={styles.cardTabs}>
      <span className={styles.cardTab}>
        <span className={styles.cardTabLabelActive}>OVERVIEW</span>
        <span className={styles.cardTabUnderline} />
      </span>
      <span className={styles.cardTab}>
        <span className={styles.cardTabInner}>
          <img src={enquiryIcon} alt="" className={styles.cardTabIcon} />
          <span className={styles.cardTabLabel}>ENQUIRY ANALYTICS</span>
        </span>
      </span>
    </div>

    <span className={mock.rule} />

    <div className={`${styles.stats} ${styles.sp14}`}>
      <div className={mock.stat}>
        <span className={mock.label}>Total bookings</span>
        <span className={mock.statValue}>4,849</span>
        <span className={mock.delta}>
          <img src={triDown} alt="" className={mock.deltaIcon} />
          <span className={`${mock.deltaValue} ${mock.deltaDown}`}>3%</span>
          <span className={mock.deltaNote}>vs last week</span>
        </span>
        <span className={`${mock.bar} ${mock.barViolet} ${styles.fullBar}`} />
      </div>
      <div className={mock.stat}>
        <span className={mock.label}>Invoiced</span>
        <span className={mock.statValue}>243</span>
        <span className={mock.delta}>
          <img src={triUp} alt="" className={mock.deltaIcon} />
          <span className={`${mock.deltaValue} ${mock.deltaUp}`}>1%</span>
          <span className={mock.deltaNote}>vs last week</span>
        </span>
        <span className={`${mock.bar} ${mock.barTeal} ${styles.fullBar}`} />
      </div>
    </div>

    <span className={`${mock.rule} ${styles.sp14}`} />

    <span className={`${styles.sectionLabel} ${styles.sp14}`}>BOOKINGS BY MONTH</span>

    <div className={styles.chart}>
      {BOOKINGS_BY_MONTH.map((height, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`${styles.chartBar} ${
            i >= BOOKINGS_HIGHLIGHT_FROM ? styles.chartBarOn : styles.chartBarOff
          }`}
          style={{ height, "--i": i } as React.CSSProperties}
        />
      ))}
    </div>

    <div className={styles.months}>
      {MONTHS.map((month, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span className={styles.month} key={i}>
          {month}
        </span>
      ))}
    </div>

    <span className={`${mock.rule} ${styles.sp14}`} />

    <span className={`${styles.cardCta} ${styles.sp12}`}>VIEW FULL REPORT</span>
  </div>
);

const PromosCard = () => (
  <div className={styles.card}>
    <div className={styles.promoCrumb}>
      <span className={styles.promoLabel}>CAMPAIGNS</span>
      <span className={styles.promoNew}>New</span>
    </div>

    <span className={`${mock.rule} ${styles.sp12}`} />

    <div className={styles.featured}>
      <div className={mock.row}>
        <span className={styles.featuredLabel}>EARLY BIRD 2026/27</span>
        <span className={`${mock.badge} ${mock.badgeGreen}`}>ACTIVE</span>
      </div>
      <div className={styles.featuredValue}>
        <span className={mock.statValue}>15% off</span>
        <span className={styles.featuredNote}>· all studios · until 31 Aug</span>
      </div>
    </div>

    <span className={`${mock.rule} ${styles.sp14}`} />

    <div className={`${mock.th} ${styles.sp10} ${styles.thSpaced}`}>
      <span>CAMPAIGN</span>
      <span>STATUS</span>
    </div>

    {CAMPAIGNS.map((campaign, i) => (
      <div className={styles.listGroup} key={campaign.name}>
        <span className={mock.rule} />
        <div className={styles.listRow} style={{ "--i": i } as React.CSSProperties}>
          <div className={mock.entry}>
            <span className={mock.entryTitle}>{campaign.name}</span>
            <span className={mock.entryNote}>{campaign.note}</span>
          </div>
          <span className={`${mock.badge} ${badgeTone(campaign.tone)}`}>{campaign.status}</span>
        </div>
      </div>
    ))}
    <span className={mock.rule} />
  </div>
);

const ReviewsCard = () => (
  <div className={styles.card}>
    <div className={mock.crumb}>
      <span className={mock.crumbL}>REVIEWS</span>
      <span className={mock.crumbR}>THIS MONTH</span>
    </div>

    <span className={`${mock.rule} ${styles.sp12}`} />

    <div className={`${styles.stats} ${styles.sp14}`}>
      <div className={mock.stat}>
        <span className={mock.label}>Average rating</span>
        <span className={styles.ratingValue}>
          <img src={starBadge} alt="" className={styles.ratingStar} />
          <span className={mock.statValue}>4.7</span>
        </span>
        <span className={mock.delta}>
          <img src={triDown} alt="" className={mock.deltaIcon} />
          <span className={`${mock.deltaValue} ${mock.deltaDown}`}>16%</span>
          <span className={mock.deltaNote}>vs last week</span>
        </span>
        <span className={`${mock.bar} ${mock.barViolet} ${styles.fullBar}`} />
      </div>
      <div className={mock.stat}>
        <span className={mock.label}>Total ratings</span>
        <span className={mock.statValue}>12</span>
        <span className={mock.delta}>
          <img src={triUp} alt="" className={mock.deltaIcon} />
          <span className={`${mock.deltaValue} ${mock.deltaUp}`}>15%</span>
          <span className={mock.deltaNote}>vs last week</span>
        </span>
        <span className={`${mock.bar} ${mock.barTeal} ${styles.fullBar}`} />
      </div>
    </div>

    <span className={`${mock.rule} ${styles.sp14}`} />

    <div className={`${mock.th} ${styles.sp10} ${styles.thSpaced}`}>
      <span>REVIEW</span>
      <span>RATING</span>
    </div>

    {REVIEWS.map((review, i) => (
      <div className={styles.listGroup} key={review.name}>
        <span className={mock.rule} />
        <div className={styles.listRow} style={{ "--i": i } as React.CSSProperties}>
          <div className={mock.entry}>
            <span className={mock.entryTitle}>{review.name}</span>
            <span className={mock.entryNote}>{review.note}</span>
          </div>
          <Stars filled={review.stars} />
        </div>
      </div>
    ))}
    <span className={mock.rule} />
  </div>
);

const CARDS: Record<string, () => JSX.Element> = {
  analytics: AnalyticsCard,
  promotions: PromosCard,
  reviews: ReviewsCard,
};

const Tools = () => {
  const [active, setActive] = useState(0);
  // One flag per panel. Set when the panel is reached, and cleared for all
  // three once the section is entirely off screen — so the mocks introduce
  // themselves again on the next visit, but hold still while you are reading.
  const [revealed, setRevealed] = useState<boolean[]>(() => TABS.map(() => false));
  const activeRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  /** Last slack written to the rail, so a scroll frame only touches style on change. */
  const slackRef = useRef(-1);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const fillRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      raf = 0;
      const body = bodyRef.current;
      const rail = railRef.current;
      if (!body || !rail) return;

      const rect = body.getBoundingClientRect();
      const railHeight = rail.offsetHeight;

      // The rail is let go at the moment the last panel's top edge arrives at
      // the same line the rail rests on — the two are level right then, so the
      // column reads as belonging beside that card, and from there they travel
      // up together still level. Left alone, sticky holds until the body's
      // bottom catches the rail's, which keeps the column parked near the top
      // while the last card sits lower down, out of line with it.
      //
      // Slack beneath the rail ends the stick early: sticky may not carry an
      // element's margin box out of its container, so a bottom margin of the
      // difference between the two heights releases it exactly there. Skipped
      // when the layout stacks and the rail is no longer sticky, where the
      // margin would just be a gap.
      const sticky = window.getComputedStyle(rail).position === "sticky";
      const lastPanel = panelRefs.current[panelRefs.current.length - 1];
      const lastHeight = lastPanel ? lastPanel.offsetHeight : 0;
      const slack = sticky
        ? Math.max(0, Math.min(lastHeight - railHeight, rect.height - railHeight))
        : 0;
      if (slack !== slackRef.current) {
        slackRef.current = slack;
        rail.style.marginBottom = slack ? `${slack}px` : "";
      }

      // The lines run over exactly that pinned stretch, so the last one lands
      // full at the same moment the section is released and starts to travel.
      const travel = Math.max(1, rect.height - railHeight - slack);
      const stage = Math.min(1, Math.max(0, (HEADER_OFFSET - rect.top) / travel));

      // Split evenly between the entries, so each carries the same share of the
      // scroll and no entry can run out of room.
      const count = TABS.length;
      const current = Math.min(count - 1, Math.floor(stage * count));

      fillRefs.current.forEach((fill, i) => {
        if (!fill) return;

        // Only the entry being read carries a line. An entry already passed
        // holds its full width but fades out, so the handover is one line
        // giving way to the next rather than a row of finished lines stacking
        // up; the width reset happens behind the fade and is never seen.
        // Written straight to the node because this runs on every scroll frame.
        const filled = Math.min(1, Math.max(0, stage * count - i));
        fill.style.transform = `scaleX(${i === current ? filled : Number(i < current)})`;
        fill.style.opacity = i === current ? "1" : "0";
      });

      // Only the index is React state, and it changes a handful of times per
      // pass rather than once a frame.
      if (current !== activeRef.current) {
        activeRef.current = current;
        setActive(current);
      }
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const panels = panelRefs.current;
    if (!panels.some(Boolean)) return undefined;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Nothing to play, but the mocks still have to be legible, so mark them
    // shown rather than leaving them in their starting state.
    if (reduced || typeof IntersectionObserver === "undefined") {
      setRevealed(TABS.map(() => true));
      return undefined;
    }

    // Panels stay observed rather than being dropped once they fire. The flag
    // already being set is what stops a replay while you are moving about
    // inside the section; clearing it is what allows one.
    const panelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = panels.indexOf(entry.target as HTMLDivElement);
          if (i < 0) return;
          setRevealed((prev) => {
            if (prev[i]) return prev;
            const next = prev.slice();
            next[i] = true;
            return next;
          });
        });
      },
      { threshold: 0.25 },
    );
    panels.forEach((panel) => panel && panelObserver.observe(panel));

    // Rearms the set the moment the section is completely off screen. A zero
    // threshold means "not one pixel of it showing", and the observer does not
    // care whether it went off the top or the bottom, so coming back from
    // either direction replays. The reset itself happens out of sight.
    const section = sectionRef.current;
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) return;
          setRevealed((prev) => (prev.some(Boolean) ? TABS.map(() => false) : prev));
        });
      },
      { threshold: 0 },
    );
    if (section) sectionObserver.observe(section);

    return () => {
      panelObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const goTo = useCallback((i: number) => {
    const panel = panelRefs.current[i];
    if (!panel) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: panel.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
      behavior: reduced ? "auto" : "smooth",
    });
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.inner}>
        <Reveal as="h2" className={styles.heading}>
          Tools to manage your property
        </Reveal>

        <div className={styles.body} ref={bodyRef}>
          <div className={styles.rail} ref={railRef}>
            {/* Not a tablist: the panels are all on the page at once and scroll
                position, not this control, decides which one is being read. */}
            <nav className={styles.tabs} aria-label="Property management tools">
              {TABS.map((tab, i) => {
                const isActive = i === active;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    aria-current={isActive || undefined}
                    className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                    onClick={() => goTo(i)}
                  >
                    <span className={styles.tabLabel}>{tab.label}</span>
                    <span className={styles.tabBody}>{tab.body}</span>
                    <span className={styles.tabTrack} aria-hidden="true">
                      <span
                        className={styles.tabFill}
                        ref={(node) => {
                          fillRefs.current[i] = node;
                        }}
                      />
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className={styles.panels}>
            {TABS.map((tab, i) => {
              const Card = CARDS[tab.id];
              return (
                <div
                  key={tab.id}
                  className={`${styles.panel} ${revealed[i] ? styles.alive : ""}`}
                  ref={(node) => {
                    panelRefs.current[i] = node;
                  }}
                >
                  {/* isNotLazy so the photo is simply there: the shared Image
                      otherwise fades and scales it in once it loads, and these
                      are the backdrop rather than something to announce. At
                      ~100KB each they cost little to load with the page. */}
                  <Image
                    src={tab.image}
                    alt=""
                    className={styles.panelImage}
                    width="100%"
                    height="100%"
                    isNotLazy
                  />
                  <span className={styles.panelWash} aria-hidden="true" />
                  <div className={`${mock.bezel} ${styles.bezel}`}>
                    <Card />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default wrapperHOC(Tools, {
  componentName: "Tools-ListWithUs",
  showForChina: true,
});
