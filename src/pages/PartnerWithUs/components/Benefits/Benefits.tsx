import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import mock from "../mock/mock.module.scss";
import styles from "./Benefits.module.scss";
import panelDashboard from "../../assets/panel-dashboard.jpg";
import panelWhitelabel from "../../assets/panel-whitelabel.jpg";
import panelPlus from "../../assets/panel-plus.jpg";
import mockupDashboard from "../../assets/mockup-dashboard.png";
import mockupWhitelabel from "../../assets/mockup-whitelabel.png";
import mockupPlus from "../../assets/mockup-plus.png";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Everything you get as a partner." — Figma node 2141:4038.
 *
 * The three media panels stack and scroll; the list on the left holds its place
 * beside them. Whichever panel currently fills most of the viewport is the one
 * the list points at — that entry takes the design's "tab · active" look while
 * the other two grey back, and every description stays readable throughout. The
 * entries stay clickable and scroll to their panel.
 *
 * Matches the List With Us rail: the Figma frame draws the inactive entries as
 * label-only, but collapsing them reflows the column each time the active entry
 * moves, so all three keep their copy and only the colour changes.
 *
 * Each panel is a real product screenshot inside a glass frame over a photo,
 * rather than a drawn mock-up like the bento and the step rail.
 *
 * NOTE: the Figma file puts the white-label sentence ("Sell amber's inventory
 * under your own brand…") under the Dedicated Dashboard label, where it does not
 * match either the label or the dashboard screenshot beside it. The copy is on
 * the White Label entry here and the dashboard has its own line; confirm the
 * final wording with the partnerships team before this goes upstream.
 */
const TABS = [
  {
    id: "dashboard",
    label: "Dedicated Dashboard",
    body: "Track every lead, listing and booking in one place, with live availability and payouts.",
    image: panelDashboard,
    mockup: mockupDashboard,
    alt: "The amber partner dashboard listing student leads with their status and destination city",
  },
  {
    id: "white-label",
    label: "White Label",
    body: "Sell amber's inventory under your own brand — your logo, your domain, your booking flow.",
    image: panelWhitelabel,
    mockup: mockupWhitelabel,
    alt: "A university-branded off-campus housing page powered by amber",
  },
  {
    id: "amber-plus",
    label: "amber Plus Services",
    body: "Forex, flights, SIM cards, airport pickup and student essentials, bookable alongside the room.",
    image: panelPlus,
    mockup: mockupPlus,
    alt: "The amber Plus marketplace offering forex, flights, SIM cards and airport pickup",
  },
];

/**
 * Height of the navbar, which is the only part of the header stack still fixed
 * once the announcement rail has scrolled out. Everything reads against this
 * line: the sticky list rests on it, a click scrolls its panel to it, and a
 * panel's progress is how far it has travelled past it.
 */
const HEADER_OFFSET = 104;

const Benefits = () => {
  const [active, setActive] = useState(0);
  // One flag per panel. Set when the panel is reached, and cleared for all
  // three once the section is entirely off screen — so the panels introduce
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

    // Nothing to play, but the panels still have to be legible, so mark them
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
          Everything you get as a partner.
        </Reveal>

        <div className={styles.body} ref={bodyRef}>
          <div className={styles.rail} ref={railRef}>
            {/* Not a tablist: the panels are all on the page at once and scroll
                position, not this control, decides which one is being read. */}
            <nav className={styles.tabs} aria-label="What you get as an amber partner">
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
            {TABS.map((tab, i) => (
              <div
                key={tab.id}
                className={`${styles.panel} ${revealed[i] ? styles.alive : ""}`}
                ref={(node) => {
                  panelRefs.current[i] = node;
                }}
              >
                {/* isNotLazy so the photo is simply there: the shared Image
                    otherwise fades and scales it in once it loads, and these
                    are the backdrop rather than something to announce. */}
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
                  {/* The screenshots are pre-cropped to the frame's 577x364
                      window, so they sit top-anchored and fill it exactly —
                      the design shows only the top of each product page. */}
                  <Image
                    src={tab.mockup}
                    alt={tab.alt}
                    className={styles.mockup}
                    width="100%"
                    height="100%"
                    isNotLazy
                  />
                </div>
              </div>
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
