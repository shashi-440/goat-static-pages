import Image from "@Components/Image";
import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import { KITS, PITCH, SERVICES } from "../../content";
import { SERVICE_ICONS } from "./serviceIcons";
import styles from "./Hero.module.scss";

const StarIcon = () => (
  <svg className={styles.star} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
  </svg>
);

/**
 * Transactional section — the service switcher, the personalised pitch rail and
 * the three kit cards.
 *
 * The mockup framed this as a floating white card on a slate-blue gradient, sized
 * to fixed pixel columns (1360 stage, 432 rail, 3 × 272 kits). Re-themed here to
 * the v2 pattern the other pages use: the section sits on the page's own
 * `--page-gutter` column and the tracks are fractional, so the layout holds at
 * any width instead of only at 1360.
 */
const Hero = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      <Reveal>
        <h1 className={styles.title}>Everything you need to move abroad</h1>
      </Reveal>

      {/* Service switcher. These are the sibling amber services; only Essential
          Kit is built in this sandbox, so the rest are inert anchors. */}
      <Reveal delay={80}>
        <nav className={styles.services} aria-label="amber services">
          {SERVICES.map((service) => {
            const Icon = SERVICE_ICONS[service.label];
            return (
              <a
                key={service.label}
                href={service.href}
                className={`${styles.service} ${service.current ? styles.serviceOn : ""}`}
                aria-current={service.current ? "page" : undefined}
              >
                <span className={styles.serviceIcon}>
                  <Icon />
                </span>
                <span className={styles.serviceLabel}>{service.label}</span>
              </a>
            );
          })}
        </nav>
      </Reveal>

      <Reveal delay={160} className={styles.card}>
        {/* Left rail — the personalised pitch. */}
        <aside className={styles.pitch}>
          <h2 className={styles.pitchTitle}>
            {PITCH.heading[0]}
            <br />
            {PITCH.heading[1]}
          </h2>
          <p className={styles.pitchBody}>{PITCH.body}</p>

          <div className={styles.booking}>
            <span className={styles.avatar} aria-hidden="true">
              {PITCH.booking.initial}
            </span>
            <span className={styles.bookingText}>
              <strong className={styles.bookingLine}>{PITCH.booking.line}</strong>
              <span className={styles.bookingSub}>{PITCH.booking.sub}</span>
            </span>
          </div>

          <div className={styles.trust}>
            <span className={styles.trustRating}>
              <StarIcon />
              {PITCH.trust.rating}
            </span>
            <span className={styles.trustLine}>{PITCH.trust.line}</span>
          </div>
        </aside>

        {/* Right — the three kits. */}
        <div className={styles.shop}>
          <div className={styles.kits}>
            {KITS.map((kit) => (
              <article
                key={kit.name}
                className={`${styles.kit} ${kit.recommended ? styles.kitRecommended : ""}`}
              >
                {/* The flag only renders on the recommended kit; the others get a
                    spacer so all three image tops still align. */}
                {kit.recommended ? (
                  <p className={styles.flag}>Recommended for your room</p>
                ) : (
                  <span className={styles.flagSpacer} aria-hidden="true" />
                )}

                <div className={styles.kitImage}>
                  <Image
                    src={kit.image}
                    alt={`${kit.name} — bedding, kitchen and bathroom essentials`}
                    width="100%"
                    height="100%"
                    isEagerLoad
                  />
                </div>

                <div className={styles.kitBody}>
                  <div className={styles.kitHead}>
                    <h3 className={styles.kitName}>{kit.name}</h3>
                    <span className={styles.kitRating}>
                      <StarIcon />
                      {kit.rating}
                      <span className={styles.kitReviews}>({kit.reviews})</span>
                    </span>
                  </div>

                  <p className={styles.itemCount}>{kit.itemCount}</p>
                  <ul className={styles.contents}>
                    {kit.contents.map((entry) => (
                      <li key={entry} className={styles.content}>
                        <span className={styles.contentDot} aria-hidden="true" />
                        {entry}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.kitFoot}>
                  <p className={styles.priceRow}>
                    <span className={styles.priceWas}>{kit.priceWas}</span>
                    <span className={styles.priceOff}>↓{kit.discount}</span>
                    <span className={styles.priceNow}>{kit.priceNow}</span>
                  </p>
                  <a
                    href="#"
                    className={`${styles.button} ${
                      kit.recommended ? styles.buttonPrimary : styles.buttonGhost
                    }`}
                  >
                    {kit.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default wrapperHOC(Hero, {
  componentName: "Essentials-Hero",
  showForChina: true,
});
