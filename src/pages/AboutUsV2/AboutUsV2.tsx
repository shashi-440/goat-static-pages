import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Mission from "./components/Mission/Mission";
import WhyAmberExists from "./components/WhyAmberExists/WhyAmberExists";
import AmberStory from "./components/AmberStory/AmberStory";
import CrewCTA from "./components/CrewCTA/CrewCTA";
import styles from "./AboutUsV2.module.scss";

const AboutUsV2 = () => (
  <div className={styles.page}>
    <Helmet title="About Us | amber">
      <meta
        name="description"
        content="amber is building the future of global student housing — helping millions of students find verified homes near leading universities worldwide."
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

    <Navbar
      links={[
        { label: "How it works", href: "/how-it-works-v2" },
        { label: "Career", href: "/career-v2" },
      ]}
    />
    <Hero />
    <Mission />
    <WhyAmberExists />
    <AmberStory />
    <CrewCTA />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(AboutUsV2, {
  componentName: "AboutUsV2-Page",
  showForChina: true,
});
