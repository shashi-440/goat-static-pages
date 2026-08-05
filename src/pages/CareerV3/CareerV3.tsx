import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
// Navbar and Reveal are shared with About Us v2 rather than copied, so the v2/v3
// pages keep one source of truth for the scroll/hover interactions.
import Navbar from "../AboutUsV2/components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Origin from "./components/Origin/Origin";
import Journey from "./components/Journey/Journey";
import Map from "./components/Map/Map";
import Teams from "./components/Teams/Teams";
import Benefits from "./components/Benefits/Benefits";
import CrewCTA from "./components/CrewCTA/CrewCTA";
import styles from "./CareerV3.module.scss";

/**
 * Career page, v3.
 *
 * Section order follows the copy deck: tagline → why amber exists → the
 * founder's framing of the work → where we operate → the teams → what you get →
 * closing CTA. The EVP block sits after the teams carousel, matching the "user
 * scrolls" beats in the deck rather than the order the sections were numbered in.
 *
 * Shares its assets and its Navbar / Reveal / ScrollText / CarouselControls /
 * LottieIcon components with Career v2 rather than duplicating them, so v2 stays
 * the single source of truth for those interactions.
 */
const CareerV3 = () => (
  <div className={styles.page}>
    <Helmet title="Careers | Amber">
      <meta
        name="description"
        content="We help students find home, before they find everything else. Grow fast, own big things, and do it with a team that's got your back — explore open roles at amber."
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
    <Origin />
    <Journey />
    <Map />
    <Teams />
    <Benefits />
    <CrewCTA />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(CareerV3, {
  componentName: "CareerV3-Page",
  showForChina: true,
});
