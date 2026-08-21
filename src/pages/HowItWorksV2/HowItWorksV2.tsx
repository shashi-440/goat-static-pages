import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
// Navbar and Reveal are shared with About Us v2 rather than copied, so the v2
// pages keep one source of truth for the scroll/hover interactions. AboutUsV2
// itself is left untouched (its files must stay byte-identical to upstream).
import Navbar from "../AboutUsV2/components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Steps from "./components/Steps/Steps";
import WhyBook from "./components/WhyBook/WhyBook";
import styles from "./HowItWorksV2.module.scss";

const HowItWorksV2 = () => (
  <div className={styles.page}>
    <Helmet title="How It Works | amber">
      <meta
        name="description"
        content="See how amber works — search verified student homes, book in minutes, and move in with support at every step."
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
        { label: "Blogs", href: "/blog" },
        { label: "About us", href: "/about-us-v2" },
      ]}
    />
    <Hero />
    <Steps />
    <WhyBook />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(HowItWorksV2, {
  componentName: "HowItWorksV2-Page",
  showForChina: true,
});
