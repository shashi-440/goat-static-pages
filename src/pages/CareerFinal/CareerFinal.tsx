import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
// Navbar and Reveal are shared with About Us v2 rather than copied, so the v2
// pages keep one source of truth for the scroll/hover interactions.
import Navbar from "../AboutUsV2/components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Benefits from "./components/Benefits/Benefits";
import Values from "./components/Values/Values";
import Globe from "./components/Globe/Globe";
import Team from "./components/Team/Team";
import Gallery from "./components/Gallery/Gallery";
import CrewCTA from "./components/CrewCTA/CrewCTA";
import styles from "./CareerFinal.module.scss";

const CareerFinal = () => (
  <div className={styles.page}>
    <Helmet title="Careers | Amber">
      <meta
        name="description"
        content="We help students find home, before they find everything else. Explore open roles at Amber — a team of curious builders across 80+ countries helping students find a place to call home."
      />
      <meta name="robots" content="index,follow" />
      {/* Instrument Sans — the design font, loaded only on this page */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
      />
    </Helmet>

    {/* "Career" is dropped from the links here — this *is* the career page — and
        the CTA becomes "Apply now", secondary until the page is scrolled. */}
    <Navbar
      links={[
        { label: "Blogs", href: "/blog" },
        { label: "About Us", href: "/about-us-v2" },
      ]}
      ctaLabel="Apply now"
      ctaHref="#open-roles"
      ctaSecondaryUntilScroll
    />
    <Hero />
    <Globe />
    <Benefits />
    <Values />
    <Team />
    <Gallery />
    <CrewCTA />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(CareerFinal, {
  componentName: "CareerFinal-Page",
  showForChina: true,
});
