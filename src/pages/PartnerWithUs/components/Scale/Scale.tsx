import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import CountUp from "../../../AboutUsV2/components/CountUp/CountUp";
import mock from "../mock/mock.module.scss";
import styles from "./Scale.module.scss";
import scaleBg from "../../assets/scale-bg.jpg";
import room1 from "../../assets/thumbs/room-1.jpg";
import room2 from "../../assets/thumbs/room-2.jpg";
import room3 from "../../assets/thumbs/room-3.jpg";
import room4 from "../../assets/thumbs/room-4.jpg";
import room5 from "../../assets/thumbs/room-5.jpg";
import student1 from "../../assets/student-avatar-1.png";
import student2 from "../../assets/student-avatar-2.png";
import student3 from "../../assets/student-avatar-3.png";
import student4 from "../../assets/student-avatar-4.png";
import student5 from "../../assets/student-avatar-5.png";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Housing, solved at global scale." bento — Figma node 2141:3681.
 *
 * A 2-column grid, mirrored from the List With Us bento: the 2x2 of stat cards
 * comes first and the tall card holding the full amber-connect mock over a photo
 * sits on the right. Every mock panel is clipped short and faded out at the
 * bottom so the numbers below it stay the focus — that fade is the `.fade`
 * layer, not an image.
 */

// COVERAGE panel — students placed per market. The leading row takes the blue dot.
const COVERAGE = [
  { country: "United Kingdom", value: "4,820" },
  { country: "Australia", value: "3,140" },
  { country: "Ireland", value: "1,265" },
  { country: "Canada", value: "980" },
  { country: "Germany", value: "740" },
];

// PROPERTY FEED panel — listings arriving on the feed.
const PROPERTY_FEED = [
  { thumb: room1, tag: "LONDON · 42 BEDS", title: "Studio & en-suite rooms" },
  { thumb: room2, tag: "MANCHESTER · 18 BEDS", title: "Shared apartments" },
  { thumb: room3, tag: "DUBLIN · 26 BEDS", title: "En-suite cluster flats" },
  { thumb: room4, tag: "BERLIN · 34 BEDS", title: "Studio apartments" },
];

// HOUSING MIX panel. `width` is each fill's share of the 230px track in the node;
// the two segments of the share bar above are 158px and 70px of it.
const HOUSING_MIX = [
  { label: "Off-campus", value: "70%", accent: true },
  { label: "On-campus", value: "30%", accent: false },
  { label: "Purpose-built (PBSA)", value: "41%", accent: false },
  { label: "Private rental", value: "29%", accent: false },
];

// STUDENTS HELPED panel — the tracked rows below the avatar row.
const STUDENTS_HELPED = [
  { label: "Bookings confirmed", value: "92%", width: "92%", tone: mock.barBlue },
  { label: "Repeat bookings", value: "41%", width: "41%", tone: mock.barViolet },
  { label: "Avg. reply time", value: "2 min", width: "79%", tone: mock.barTeal },
];

const STUDENT_AVATARS = [student1, student2, student3, student4, student5];

// BED INVENTORY panel on the tall card.
const BED_INVENTORY = [
  { thumb: room1, tag: "LONDON · STUDIO", title: "Private studios with kitchenette", beds: "412K BEDS" },
  { thumb: room2, tag: "MANCHESTER · SHARED", title: "2–6 bed shared apartments", beds: "386K BEDS" },
  { thumb: room3, tag: "DUBLIN · EN-SUITE", title: "Cluster flats, shared kitchen", beds: "244K BEDS" },
  { thumb: room4, tag: "BARCELONA · 21 BEDS", title: "Shared apartments, city centre", beds: "186K BEDS" },
  { thumb: room5, tag: "TORONTO · 44 BEDS", title: "Studios near campus", beds: "152K BEDS" },
];

const BED_CHIPS = ["STUDIO", "EN-SUITE", "SHARED", "2–6 BED"];

const Scale = () => {
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
          Housing, solved at global scale.
        </Reveal>

        <div className={styles.bento}>
          {/* 2x2 of stat cards — the left column in this design. */}
          <div className={styles.grid}>
            <div className={styles.gridRow}>
              {/* ------------------------------------------------ 240+ */}
              <div className={styles.card}>
                <div className={`${mock.panel} ${styles.cardPanel}`}>
                  <div className={mock.crumb}>
                    <span className={mock.crumbL}>COVERAGE</span>
                    <span className={mock.crumbR}>240 CITIES</span>
                  </div>
                  <span className={mock.rule} />
                  <div className={styles.rows}>
                    {COVERAGE.map((item, i) => (
                      <div className={`${mock.row} ${styles.dealRow}`} key={item.country}>
                        <span className={styles.rowLeft}>
                          <span className={`${mock.dot} ${i === 0 ? mock.dotActive : ""}`} />
                          <span className={mock.name}>{item.country}</span>
                        </span>
                        <span className={`${mock.value} ${mock.valueMuted}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* The cards carry no scroll-reveal — only their figures animate. */}
                <div className={styles.cardHead}>
                  <CountUp
                    className={`${styles.cardNumber} ${styles.cardNumberBlue}`}
                    target={240}
                    suffix="+"
                  />
                  <span className={styles.cardLabel}>Cities</span>
                </div>

                <span className={styles.cardFade} aria-hidden="true" />
              </div>

              {/* --------------------------------------------- 16,000+ */}
              <div className={styles.card}>
                <div className={`${mock.panel} ${styles.cardPanel}`}>
                  <div className={mock.crumb}>
                    <span className={mock.crumbL}>PROPERTY FEED</span>
                    <span className={mock.crumbR}>LIVE</span>
                  </div>
                  <span className={mock.rule} />
                  <div className={styles.feed}>
                    {PROPERTY_FEED.map((item, i) => (
                      <div className={styles.feedItem} key={item.tag}>
                        {i > 0 ? <span className={mock.rule} /> : null}
                        <div className={`${styles.feedRow} ${styles.dealRow}`}>
                          <Image
                            src={item.thumb}
                            alt=""
                            className={`${mock.thumb} ${mock.thumbSm}`}
                            width={28}
                            height={28}
                            isNotLazy
                          />
                          <div className={`${mock.entry} ${styles.feedText}`}>
                            <span className={mock.entryTag}>{item.tag}</span>
                            <span className={mock.entryTitle}>{item.title}</span>
                          </div>
                          <span className={`${mock.badge} ${mock.badgeGreen}`}>ADDED</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 16,000+ stays static: CountUp is integer-based and a comma
                    grouping would be lost on the way up. */}
                <div className={styles.cardHead}>
                  <span className={styles.cardNumber}>16,000+</span>
                  <span className={styles.cardLabel}>Properties across the globe</span>
                </div>

                <span className={styles.cardFade} aria-hidden="true" />
              </div>
            </div>

            <div className={styles.gridRow}>
              {/* ------------------------------------------------- 70% */}
              <div className={styles.card}>
                <div className={`${mock.panel} ${styles.cardPanel}`}>
                  <div className={mock.crumb}>
                    <span className={mock.crumbL}>HOUSING MIX</span>
                    <span className={mock.crumbR}>250M STUDENTS</span>
                  </div>
                  <span className={mock.rule} />
                  <div className={styles.rows}>
                    {/* Off-campus / on-campus split as one 6px bar, 158:70 in the
                        node. Both segments sweep in with the rest of the charts. */}
                    <div className={styles.shareBar}>
                      <span
                        className={`${styles.shareSeg} ${styles.shareSegOff} ${styles.trackFill}`}
                        style={{ flexBasis: "158px" }}
                      />
                      <span
                        className={`${styles.shareSeg} ${styles.shareSegOn} ${styles.trackFill}`}
                        style={{ flexBasis: "70px", transitionDelay: "45ms" }}
                      />
                    </div>
                    {HOUSING_MIX.map((item) => (
                      <div className={`${mock.row} ${styles.dealRow}`} key={item.label}>
                        <span className={styles.rowLeft}>
                          <span className={`${mock.dot} ${item.accent ? mock.dotActive : ""}`} />
                          <span className={mock.name}>{item.label}</span>
                        </span>
                        <span className={`${mock.value} ${mock.valueMuted}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.cardHead}>
                  <CountUp className={styles.cardNumber} target={70} suffix="%" />
                  <span className={styles.cardLabel}>Students living off-campus</span>
                </div>

                <span className={styles.cardFade} aria-hidden="true" />
              </div>

              {/* ------------------------------------------------ 160+ */}
              <div className={styles.card}>
                <div className={`${mock.panel} ${styles.cardPanel}`}>
                  <div className={mock.crumb}>
                    <span className={mock.crumbL}>SOURCE COUNTRIES</span>
                    <span className={mock.crumbR}>THIS YEAR</span>
                  </div>
                  <span className={mock.rule} />
                  <div className={mock.row}>
                    <span className={styles.avatarRow}>
                      <span className={styles.avatars}>
                        {STUDENT_AVATARS.map((src, i) => (
                          <Image
                            src={src}
                            alt=""
                            // eslint-disable-next-line react/no-array-index-key
                            key={i}
                            className={styles.avatar}
                            width={26}
                            height={26}
                            isNotLazy
                          />
                        ))}
                      </span>
                      <span className={`${mock.value} ${mock.valueInk}`}>160+</span>
                    </span>
                    <span className={`${mock.badge} ${mock.badgeGreen}`}>+12% YOY</span>
                  </div>
                  {STUDENTS_HELPED.map((item, i) => (
                    <div className={styles.helped} key={item.label}>
                      <span className={mock.rule} />
                      <div className={mock.row}>
                        <span className={mock.label}>{item.label}</span>
                        <span className={`${mock.value} ${mock.valueMuted}`}>{item.value}</span>
                      </div>
                      <span className={mock.track}>
                        <span
                          className={`${mock.bar} ${item.tone} ${styles.trackFill}`}
                          style={{
                            display: "block",
                            width: item.width,
                            transitionDelay: `${i * 45}ms`,
                          }}
                        />
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.cardHead}>
                  <CountUp className={styles.cardNumber} target={160} suffix="+" />
                  <span className={styles.cardLabel}>Student source countries</span>
                </div>

                <span className={`${styles.cardFade} ${styles.cardFadeLow}`} aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* ------------------------------- tall card: full mock over a photo */}
          <div className={styles.hero}>
            {/* isNotLazy: the shared Image otherwise fades and scales itself in
                from opacity 0 / scale(0.9) once loaded. The backdrop should just
                be there — the motion in this card belongs to the chart. */}
            <Image
              src={scaleBg}
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
                      <span className={mock.crumbL}>BED INVENTORY</span>
                      <span className={mock.crumbR}>1M+ AVAILABLE</span>
                    </div>
                    <span className={mock.rule} />
                  </div>

                  <div className={styles.heroStats}>
                    <div className={mock.stat}>
                      <span className={mock.label}>Beds available</span>
                      <span className={mock.statValue}>1M+</span>
                      <span className={`${mock.bar} ${mock.barViolet} ${styles.fullBar}`} />
                    </div>
                    <div className={mock.stat}>
                      <span className={mock.label}>Cities live</span>
                      <span className={mock.statValue}>240</span>
                      <span className={`${mock.bar} ${mock.barTeal} ${styles.fullBar}`} />
                    </div>
                  </div>

                  <div className={mock.row}>
                    <span className={styles.chips}>
                      {BED_CHIPS.map((chip, i) => (
                        <span
                          className={`${mock.chip} ${i === 0 ? mock.chipActive : ""}`}
                          key={chip}
                        >
                          {chip}
                        </span>
                      ))}
                    </span>
                    <span className={mock.chipNote}>+ 6 MORE</span>
                  </div>

                  <div className={styles.panelBottom}>
                    {BED_INVENTORY.map((item) => (
                      <div className={styles.inventory} key={item.tag}>
                        <span className={mock.rule} />
                        <div className={`${styles.inventoryRow} ${styles.dealRow}`}>
                          <Image
                            src={item.thumb}
                            alt=""
                            className={`${mock.thumb} ${mock.thumbMd}`}
                            width={32}
                            height={32}
                            isNotLazy
                          />
                          <div className={`${mock.entry} ${styles.inventoryText}`}>
                            <span className={mock.entryTag}>{item.tag}</span>
                            <span className={mock.name}>{item.title}</span>
                          </div>
                          <span className={`${mock.badge} ${mock.badgeGreen}`}>{item.beds}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1M+ stays static too: CountUp is integer-based, so counting
                    0 → 1 would read as a glitch rather than a tally. */}
                <div className={styles.head}>
                  <span className={styles.headNumber}>1M+</span>
                  <span className={styles.headLabel}>Beds to choose from</span>
                </div>

                <span className={styles.heroFade} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default wrapperHOC(Scale, {
  componentName: "Scale-PartnerWithUs",
  showForChina: true,
});
