import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import CountUp from "../../../AboutUsV2/components/CountUp/CountUp";
import mock from "../mock/mock.module.scss";
import styles from "./WhyPartners.module.scss";
import bentoBg from "../../assets/bento-bg.jpg";
import bentoPhoto from "../../assets/bento-photo.jpg";
import thumbIq from "../../assets/bento-thumb-1.jpg";
import thumbVita from "../../assets/bento-thumb-2.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Why partners list with amber" bento — Figma node 2456:6039.
 *
 * A 2-column grid: one tall hero card holding the full amber-connect mock over a
 * photo, and a 2x2 of stat cards. Every mock panel is clipped short and faded
 * out at the bottom, so the numbers below it stay the focus — that fade is the
 * `.fade` layer, not an image.
 */

// Monthly booking volume — the last two months are the highlighted ones.
const VOLUME_BARS = [16, 20, 18, 24, 22, 28, 26, 32, 30, 36, 34, 42];
const VOLUME_HIGHLIGHT_FROM = 10;

// Monthly web visits.
const TRAFFIC_BARS = [10, 13, 12, 17, 20, 18, 24, 27, 25, 32];
const TRAFFIC_HIGHLIGHT_FROM = 8;

const SETTLEMENTS = [
  { thumb: thumbIq, tag: "IQ STERLING · LONDON", title: "128 bookings settled", amount: "$1.2M" },
  { thumb: thumbVita, tag: "VITA · MANCHESTER", title: "96 bookings settled", amount: "$840K" },
];

// Booking rate, partner properties vs a standard listing. `width` is the bar's
// share of the 230px track in the design.
const BOOKING_RATE = [
  { label: "Partner properties", value: "2.0x", width: "100%", accent: true },
  { label: "Standard listing", value: "1.0x", width: "49%", accent: false },
  { label: "Enquiry rate", value: "1.7x", width: "79%", accent: true },
  { label: "Repeat bookings", value: "1.4x", width: "65%", accent: false },
];

const SOURCE_MARKETS = [
  { country: "India", share: "28%" },
  { country: "Nigeria", share: "14%" },
  { country: "China", share: "11%" },
  { country: "Ghana", share: "9%" },
  { country: "Kenya", share: "7%" },
  { country: "Vietnam", share: "6%" },
];

const WhyPartners = () => {
  // The charts draw themselves in the first time the section is reached — bars
  // grow up from the baseline, progress fills sweep along their tracks — which
  // is the same beat as the figures counting up. Once done it stays put.
  const sectionRef = useRef<HTMLElement>(null);
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAlive(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAlive(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`${styles.section} ${alive ? styles.alive : ""}`}>
      <div className={styles.inner}>
      <Reveal as="h2" className={styles.heading}>
        Why partners list with amber
      </Reveal>

      <div className={styles.bento}>
        {/* Hero card — full mock over a photo backdrop. */}
        <div className={styles.hero}>
          {/* isNotLazy: the shared Image otherwise fades and scales itself in
              from opacity 0 / scale(0.9) once loaded. The backdrop should just
              be there — the motion in this card belongs to the chart. */}
          <Image
            src={bentoBg}
            alt=""
            className={styles.heroImage}
            width="100%"
            height="100%"
            isNotLazy
          />
          <span className={styles.heroWash} aria-hidden="true" />

          <div className={`${mock.bezel} ${styles.heroBezel}`}>
            <div className={styles.heroCard}>
              <div className={`${mock.panel} ${styles.heroPanel}`}>
                <div className={styles.panelTop}>
                  <div className={mock.crumb}>
                    <span className={mock.crumbL}>BOOKINGS DELIVERED</span>
                    <span className={mock.crumbR}>2025</span>
                  </div>
                  <span className={mock.rule} />
                </div>

                <div className={styles.heroStats}>
                  <div className={mock.stat}>
                    <span className={mock.label}>Gross bookings</span>
                    <span className={mock.statValue}>$100mil</span>
                    <span className={`${mock.bar} ${mock.barViolet} ${styles.fullBar}`} />
                  </div>
                  <div className={mock.stat}>
                    <span className={mock.label}>Properties</span>
                    <span className={mock.statValue}>74</span>
                    <span className={`${mock.bar} ${mock.barTeal} ${styles.fullBar}`} />
                  </div>
                </div>

                <div className={styles.panelBottom}>
                  <span className={mock.rule} />

                  <div className={mock.row}>
                    <span className={mock.label}>Monthly booking volume</span>
                    <span className={`${mock.badge} ${mock.badgeGreen}`}>+18% MOM</span>
                  </div>

                  <div className={styles.chart}>
                    {VOLUME_BARS.map((height, i) => (
                      <span
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        className={`${styles.chartBar} ${
                          i >= VOLUME_HIGHLIGHT_FROM ? styles.chartBarViolet : styles.chartBarVioletFaint
                        }`}
                        style={{ height }}
                      />
                    ))}
                  </div>

                  {SETTLEMENTS.map((item) => (
                    <div className={styles.settlement} key={item.tag}>
                      <span className={mock.rule} />
                      <div className={styles.settlementRow}>
                        <Image
                          src={item.thumb}
                          alt=""
                          className={mock.thumb}
                          width={32}
                          height={32}
                          isNotLazy
                        />
                        <div className={`${mock.entry} ${styles.settlementText}`}>
                          <span className={mock.entryTag}>{item.tag}</span>
                          <span className={mock.entryTitle}>{item.title}</span>
                        </div>
                        <span className={`${mock.badge} ${mock.badgeGreen}`}>{item.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* The cards carry no scroll-reveal — only their figures animate.
                  $1Bn+ stays static too: CountUp is integer-based, so counting
                  0 → 1 would read as a glitch rather than a tally. */}
              <div className={styles.head}>
                <span className={styles.headNumber}>$1Bn+</span>
                <span className={styles.headLabel}>
                  Bookings Delivered for 800+ property partners in 2025.
                </span>
              </div>

              <span className={styles.heroFade} aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* 2x2 of stat cards. */}
        <div className={styles.grid}>
          <div className={styles.gridRow}>
            <div className={styles.card}>
              <div className={`${mock.panel} ${styles.cardPanel}`}>
                <div className={mock.crumb}>
                  <span className={mock.crumbL}>BOOKING RATE</span>
                  <span className={mock.crumbR}>VS STANDARD</span>
                </div>
                <span className={mock.rule} />
                {BOOKING_RATE.map((item, i) => (
                  <div className={mock.cmp} key={item.label}>
                    <div className={mock.row}>
                      <span className={mock.label}>{item.label}</span>
                      <span
                        className={`${mock.value} ${item.accent ? mock.valueBlue : mock.valueMuted}`}
                      >
                        {item.value}
                      </span>
                    </div>
                    <span className={mock.track}>
                      <span
                        className={`${mock.bar} ${item.accent ? mock.barBlue : mock.barGrey} ${
                          styles.trackFill
                        } ${item.accent ? styles.trackFillAccent : ""}`}
                        // The row's delay staggers the hover ripple down the
                        // panel; width is the design's own value.
                        style={{ display: "block", width: item.width, transitionDelay: `${i * 45}ms` }}
                      />
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.cardHead}>
                <CountUp
                  className={`${styles.cardNumber} ${styles.cardNumberBlue}`}
                  target={2}
                  suffix="x"
                />
                <span className={styles.cardLabel}>Booking rate for partner properties</span>
              </div>

              <span className={styles.cardFade} aria-hidden="true" />
            </div>

            <div className={styles.card}>
              <div className={`${mock.panel} ${styles.cardPanel}`}>
                <div className={mock.crumb}>
                  <span className={mock.crumbL}>WEB TRAFFIC</span>
                  <span className={mock.crumbR}>MONTHLY</span>
                </div>
                <span className={mock.rule} />
                <div className={mock.row}>
                  <span className={mock.label}>Monthly visits</span>
                  <span className={`${mock.value} ${mock.valueInk}`}>9.2M+</span>
                </div>
                <div className={styles.chartSmall}>
                  {TRAFFIC_BARS.map((height, i) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      className={`${styles.chartBar} ${
                        i >= TRAFFIC_HIGHLIGHT_FROM ? styles.chartBarBlue : styles.chartBarBlueFaint
                      }`}
                      style={{ height }}
                    />
                  ))}
                </div>
                <span className={mock.rule} />
                <div className={mock.cmp}>
                  <div className={mock.row}>
                    <span className={mock.label}>Organic share</span>
                    <span className={`${mock.value} ${mock.valueBlue}`}>68%</span>
                  </div>
                  <span className={mock.track}>
                    <span
                      className={`${mock.bar} ${mock.barBlue} ${styles.trackFill}`}
                      style={{ display: "block", width: "68%" }}
                    />
                  </span>
                </div>
                <div className={mock.cmp}>
                  <div className={mock.row}>
                    <span className={mock.label}>Sessions / student</span>
                    <span className={`${mock.value} ${mock.valueTeal}`}>4.2</span>
                  </div>
                  <span className={mock.track}>
                    <span
                      className={`${mock.bar} ${mock.barTeal} ${styles.trackFill}`}
                      style={{ display: "block", width: "52%", transitionDelay: "45ms" }}
                    />
                  </span>
                </div>
              </div>

              <div className={styles.cardHead}>
                <CountUp className={styles.cardNumber} target={277} suffix="%" />
                <span className={styles.cardLabel}>Web traffic growth</span>
              </div>

              <span className={styles.cardFade} aria-hidden="true" />
            </div>
          </div>

          <div className={styles.gridRow}>
            <div className={styles.card}>
              <div className={`${mock.panel} ${styles.cardPanel}`}>
                <div className={mock.crumb}>
                  <span className={mock.crumbL}>SOURCE MARKETS</span>
                  <span className={mock.crumbR}>160+ COUNTRIES</span>
                </div>
                <span className={mock.rule} />
                <div className={styles.markets}>
                  {SOURCE_MARKETS.map((item) => (
                    <div className={`${mock.row} ${styles.marketRow}`} key={item.country}>
                      <span className={mock.label}>{item.country}</span>
                      <span className={`${mock.value} ${mock.valueInk}`}>{item.share}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.cardHead}>
                <CountUp className={styles.cardNumber} target={160} suffix="+" />
                <span className={styles.cardLabel}>Source countries of student demand</span>
              </div>

              <span className={styles.cardFade} aria-hidden="true" />
            </div>

            <div className={styles.photo}>
              <Image
                src={bentoPhoto}
                alt="Students outside their amber-listed accommodation"
                className={styles.photoImage}
                width="100%"
                height="100%"
                isNotLazy
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default wrapperHOC(WhyPartners, {
  componentName: "WhyPartners-ListWithUs",
  showForChina: true,
});
