import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
// Navbar is shared with the other v2 pages rather than copied, so the scroll and
// hover behaviour stays in one place.
import Navbar from "../AboutUsV2/components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Comparison from "./components/Comparison/Comparison";
import styles from "./Essentials.module.scss";

const Essentials = () => (
  <div className={styles.page}>
    <Helmet title="amber Essentials | Amber">
      <meta
        name="description"
        content="Rooms come empty. Yours won’t — bedding, crockery and toiletries delivered free before you land, with sizes pre-set to your room type."
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

    <Navbar ctaLabel="Get your kit" ctaHref="#" ctaSecondaryUntilScroll />
    <Hero />
    <Comparison />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(Essentials, {
  componentName: "Essentials-Page",
  showForChina: true,
});
