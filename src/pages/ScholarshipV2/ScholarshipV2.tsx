import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
// Navbar and Reveal are shared with About Us v2 rather than copied, so the v2
// pages keep one source of truth for the scroll/hover interactions.
import Navbar from "../AboutUsV2/components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import CreatorMarquee from "./components/CreatorMarquee/CreatorMarquee";
import Intro from "./components/Intro/Intro";
import Manifesto from "./components/Manifesto/Manifesto";
import Categories from "./components/Categories/Categories";
import Steps from "./components/Steps/Steps";
import Ambassadors from "./components/Ambassadors/Ambassadors";
import Faq from "./components/Faq/Faq";
import Cta from "./components/Cta/Cta";
import styles from "./ScholarshipV2.module.scss";

const ScholarshipV2 = () => (
  <div className={styles.page}>
    <Helmet title="amberscholar | amber">
      <meta
        name="description"
        content="amberscholar 2026 — apply for the $50,000 amber Dream Fund and get the goal you believe in funded."
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

    <Navbar />
    <Hero />
    <CreatorMarquee />
    <Intro />
    <Manifesto />
    <Categories />
    <Steps />
    <Ambassadors />
    <Faq />
    <Cta />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(ScholarshipV2, {
  componentName: "ScholarshipV2-Page",
  showForChina: true,
});
