import { useEffect, useState } from "react";
import Image from "@Components/Image";
import CustomLink from "@Components/CustomLink";
import config from "@Config/index";
import styles from "./Navbar.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

const logoDark = `${config.IMAGE_STATIC_ASSETS_COMPONENTS_PATH}/Header/assets/amber-logo-dark.svg`;
const logoLight = `${config.IMAGE_STATIC_URL}/images/logo/amber-logo-light.svg`;

const NAV_LINKS = [
  { label: "Blogs", href: "/blog" },
  { label: "Career", href: "/careers" },
];

const Navbar = () => {
  // `true` when a dark-themed section is currently behind the header.
  const [onDark, setOnDark] = useState(false);
  // `true` once the user has scrolled past the very top — the glass effect
  // (blur, tint, shadow) only appears after this; at the top the header is plain.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Sections that opt into the dark header treatment are marked with the
    // attribute data-nav-theme="dark" (see WhyAmberExists & CrewCTA sections).
    const darkSections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-nav-theme="dark"]'),
    );

    // A dark section is "behind the header" while its top has scrolled above the
    // 64px header line and its bottom is still below it. We track that (plus the
    // scrolled flag) on scroll, rAF-throttled.
    const HEADER = 64;
    let raf = 0;
    const check = () => {
      raf = 0;
      setScrolled(window.scrollY > 8);
      const covering = darkSections.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= HEADER && r.bottom >= HEADER;
      });
      setOnDark(covering);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ""} ${
        onDark ? styles.onDark : ""
      }`}
    >
      <CustomLink
        href="/"
        className={`${styles.brand} ${styles.above}`}
        dataTestId="about-us-v2-logo"
      >
        <Image
          src={onDark ? logoLight : logoDark}
          alt="Amber"
          className={styles.logo}
          width={100}
          height={24}
          isEagerLoad
        />
      </CustomLink>

      <div className={`${styles.links} ${styles.above}`}>
        {NAV_LINKS.map((link) => (
          <CustomLink key={link.label} href={link.href} className={styles.link}>
            {link.label}
          </CustomLink>
        ))}
        <CustomLink href="/" className={styles.tryButton} dataTestId="about-us-v2-try-amber">
          Try amber
        </CustomLink>
      </div>
    </nav>
  );
};

export default wrapperHOC(Navbar, {
  componentName: "Navbar-AboutUsV2",
  showForChina: true,
});
