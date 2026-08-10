import { useEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import CustomLink from "@Components/CustomLink";
import config from "@Config/index";
// The header keeps the v2 shell the other pages already use — same fixed bar,
// same 1280px-aligned gutter, same frosted-glass-on-scroll treatment — so this
// page reads as part of the set. Only the contents are this page's own:
// the announcement rail above it, and Support / Login instead of Blogs /
// Career / Try amber.
import navStyles from "../../../AboutUsV2/components/Navbar/Navbar.module.scss";
// The bar's CTA IS the hero's CTA — same class, not a copy of its rules, so the
// two pills can't drift apart.
import heroStyles from "../Hero/Hero.module.scss";
import styles from "./Header.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

const logoDark = `${config.IMAGE_STATIC_ASSETS_COMPONENTS_PATH}/Header/assets/amber-logo-dark.svg`;

const NAV_LINKS = [
  { label: "Support", href: "/contact-us" },
  { label: "Login", href: "/login" },
];

/**
 * Announcement rail + navbar — Figma nodes 2456:6003 and 2456:6008.
 *
 * Rail and navbar travel together as one fixed stack (42px + 64px = 106px, the
 * page's top padding), so the rail never slides under the fixed bar.
 */
const Header = () => {
  // `true` once the user has scrolled past the very top — the glass effect
  // (blur, tint, shadow) only appears after this; at the top the bar is plain.
  // It also drives the rail: the whole stack slides up by exactly the rail's
  // height, so the rail leaves the viewport and the navbar takes the top edge.
  const [scrolled, setScrolled] = useState(false);
  // `true` once the hero is half past the top of the viewport — that is when the
  // CTA opens out in the bar, by which point the hero's own CTA has gone.
  const [ctaShown, setCtaShown] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  // Measured rather than hard-coded at 42px — below ~1180px the rail's sentence
  // wraps to two lines and gets taller, and the slide has to clear all of it.
  const [railHeight, setRailHeight] = useState(0);

  useEffect(() => {
    // Read live rather than cached: the hero's own scroll effect changes its
    // height over the first 420px, so a value measured on mount would be stale.
    const hero = document.querySelector<HTMLElement>("[data-lwu-hero]");

    let raf = 0;
    const check = () => {
      raf = 0;
      setScrolled(window.scrollY > 8);
      if (hero) {
        const rect = hero.getBoundingClientRect();
        setCtaShown(rect.top + rect.height / 2 <= 0);
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const measure = () => setRailHeight(railRef.current?.offsetHeight || 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <header
      className={styles.stack}
      style={scrolled && railHeight ? { transform: `translateY(-${railHeight}px)` } : undefined}
    >
      <div
        className={styles.rail}
        ref={railRef}
        // Off-screen once it has slid away, so it is not a tab stop either.
        aria-hidden={scrolled || undefined}
      >
        <p className={styles.railText}>
          Download <strong className={styles.railStrong}>amber&apos;s UK PBSA Demand &amp; Pricing Update</strong>{" "}
          (Jan&apos;26 vs Mar&apos;26) for demand signals, amber&apos;s pricing recommendations, and more.
        </p>
        <CustomLink
          href="/"
          className={styles.railCta}
          dataTestId="list-with-us-rail-cta"
          tabIndex={scrolled ? -1 : undefined}
        >
          Get now
        </CustomLink>
      </div>

      <nav
        className={`${navStyles.navbar} ${styles.navbar} ${scrolled ? navStyles.scrolled : ""}`}
      >
        <CustomLink
          href="/"
          className={`${navStyles.brand} ${navStyles.above}`}
          dataTestId="list-with-us-logo"
        >
          <Image
            src={logoDark}
            alt="Amber"
            className={navStyles.logo}
            width={100}
            height={24}
            isEagerLoad
          />
        </CustomLink>

        <div className={`${navStyles.links} ${navStyles.above}`}>
          {NAV_LINKS.map((link) => (
            <CustomLink
              key={link.label}
              href={link.href}
              className={`${navStyles.link} ${styles.link}`}
            >
              {link.label}
            </CustomLink>
          ))}

          {/* Repeats the hero's CTA, but only from the hero's halfway point —
              before that the hero is still showing its own. Inert while
              collapsed: no clicks, no tab stop. */}
          <CustomLink
            href="/"
            className={`${heroStyles.cta} ${styles.navCta} ${
              ctaShown ? styles.navCtaShown : ""
            }`}
            dataTestId="list-with-us-nav-cta"
            tabIndex={ctaShown ? undefined : -1}
            aria-hidden={!ctaShown || undefined}
          >
            List on amber
          </CustomLink>
        </div>
      </nav>
    </header>
  );
};

export default wrapperHOC(Header, {
  componentName: "Header-ListWithUs",
  showForChina: true,
});
