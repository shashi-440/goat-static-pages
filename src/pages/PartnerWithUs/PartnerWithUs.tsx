import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Scale from "./components/Scale/Scale";
import Steps from "./components/Steps/Steps";
import Benefits from "./components/Benefits/Benefits";
import { Partners } from "./components/LogoStrip/LogoStrip";
import Testimonials from "./components/Testimonials/Testimonials";
import Faq from "./components/Faq/Faq";
import Cta from "./components/Cta/Cta";
import styles from "./PartnerWithUs.module.scss";

/**
 * Partner with Us — Figma node 2141:3646.
 *
 * Sibling of List With Us: the same section machinery (shrinking hero photo,
 * stat bento, self-playing step rail, sticky-rail tab section) aimed at
 * education agents and partner organisations rather than property owners. The
 * design drops that page's "who we work with" and video sections and adds a
 * second logo strip.
 */
const PartnerWithUs = () => (
  <div className={styles.page}>
    <Helmet title="Partner with amber | amber">
      <meta
        name="description"
        content="Become an official amber partner and give your students global access to 1M+ beds across 16,000+ properties in 25+ countries — with a dedicated dashboard, white-label booking and amber Plus services."
      />
      <meta name="robots" content="index,follow" />
      {/* Instrument Sans is the design font; Geist / Geist Mono are used by the
          amber connect mock-ups. Loaded only on this page. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap"
      />
    </Helmet>

    <Header />
    {/* Hero also carries the university logo strip — see Figma node 2141:4368. */}
    <Hero />
    <Scale />
    <Steps />
    <Benefits />
    <Partners />
    <Testimonials />
    <Faq />
    <Cta />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(PartnerWithUs, {
  componentName: "PartnerWithUs-Page",
  showForChina: true,
});
