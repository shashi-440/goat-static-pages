import { useEffect, useState } from "react";
import Image from "@Components/Image";
import CustomLink from "@Components/CustomLink";
import config from "@Config/index";
// The header keeps the v2 shell the other pages already use — same fixed bar,
// same 1280px-aligned gutter, same frosted-glass-on-scroll treatment — so this
// page reads as part of the set. Only the contents are this page's own:
// the announcement rail above it, and Support / Login instead of Blogs /
// Career / Visit amber.
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
 * Navbar — Figma node 2141:3647.
 *
 * ⚠️  THE ANNOUNCEMENT RAIL IS GONE, and with it the slide-up. There used to be a
 * 42px rail above the bar ("Download amber's UK PBSA Demand & Pricing Update…"), and
 * the two travelled as one fixed stack that translated up by exactly the rail's
 * measured height on first scroll, so the rail left the viewport and the bar took the
 * top edge. Removed by request.
 *
 * That machinery went with it — the ref, the measured height, the resize listener and
 * the transform existed only to move the rail. `scrolled` stays, because it also
 * drives the bar's glass effect. The page's own top padding may now be 42px too tall;
 * this component no longer has an opinion about it.
 *
 * The Figma frame draws only the 64px bar, so this is now closer to the node than it
 * was. The scroll-in CTA is still carried over from List With Us.
 */
const Header = () => {
  // `true` once the user has scrolled past the very top — the glass effect
  // (blur, tint, shadow) only appears after this; at the top the bar is plain.
  const [scrolled, setScrolled] = useState(false);
  // `true` once the hero is half past the top of the viewport — that is when the
  // CTA opens out in the bar, by which point the hero's own CTA has gone.
  const [ctaShown, setCtaShown] = useState(false);

  useEffect(() => {
    // Read live rather than cached: the hero's own scroll effect changes its
    // height over the first 420px, so a value measured on mount would be stale.
    const hero = document.querySelector<HTMLElement>("[data-pwu-hero]");

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

  return (
    <header className={styles.stack}>
      <nav
        className={`${navStyles.navbar} ${styles.navbar} ${scrolled ? navStyles.scrolled : ""}`}
      >
        <CustomLink
          href="/"
          className={`${navStyles.brand} ${navStyles.above}`}
          dataTestId="partner-with-us-logo"
        >
          <Image
            src={logoDark}
            alt="amber"
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
            dataTestId="partner-with-us-nav-cta"
            tabIndex={ctaShown ? undefined : -1}
            aria-hidden={!ctaShown || undefined}
          >
            Partner with us
          </CustomLink>
        </div>
      </nav>
    </header>
  );
};

export default wrapperHOC(Header, {
  componentName: "Header-PartnerWithUs",
  showForChina: true,
});
