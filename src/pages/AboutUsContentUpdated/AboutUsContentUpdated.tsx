import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Mission from "./components/Mission/Mission";
import WhyAmberExists from "./components/WhyAmberExists/WhyAmberExists";
import AmberStory from "./components/AmberStory/AmberStory";
import CrewCTA from "./components/CrewCTA/CrewCTA";
import styles from "./AboutUsContentUpdated.module.scss";

const AboutUsContentUpdated = () => (
  <div className={styles.page}>
    <Helmet title="About Us — Content updated | Amber">
      <meta
        name="description"
        content="Shaping the future of global student housing — amber helps students find a place to call home in 250+ cities worldwide."
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
    <WhyAmberExists />
    <AmberStory />
    <CrewCTA />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(AboutUsContentUpdated, {
  componentName: "AboutUsContentUpdated-Page",
  showForChina: true,
});
