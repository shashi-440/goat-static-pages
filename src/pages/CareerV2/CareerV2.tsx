import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
// Navbar and Reveal are shared with About Us v2 rather than copied, so the v2
// pages keep one source of truth for the scroll/hover interactions.
import Navbar from "../AboutUsV2/components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Mission from "./components/Mission/Mission";
import Benefits from "./components/Benefits/Benefits";
import CoreValues from "./components/CoreValues/CoreValues";
import Team from "./components/Team/Team";
import CrewCTA from "./components/CrewCTA/CrewCTA";
import styles from "./CareerV2.module.scss";

const CareerV2 = () => (
  <div className={styles.page}>
    <Helmet title="Careers | Amber">
      <meta
        name="description"
        content="Build the future of student living. Explore open roles at Amber — a team of curious builders across 80+ countries helping students find a place to call home."
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
    <Mission />
    <Benefits />
    <CoreValues />
    <Team />
    <CrewCTA />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(CareerV2, {
  componentName: "CareerV2-Page",
  showForChina: true,
});
