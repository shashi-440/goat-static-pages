import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
// Navbar is shared with About Us v2 rather than copied, so the v2 pages keep one
// source of truth for the scroll/hover interactions. The document furniture —
// hero, body renderer and closing seal — is shared with /terms-v2.
import Navbar from "../AboutUsV2/components/Navbar/Navbar";
import LegalHero from "@Components/LegalDoc/LegalHero";
import LegalDoc from "@Components/LegalDoc/LegalDoc";
import LegalSeal from "@Components/LegalDoc/LegalSeal";
import PRIVACY_CONTENT from "./content/policy";
import styles from "./PrivacyV2.module.scss";

const PrivacyV2 = () => (
  <div className={styles.page}>
    <Helmet title="Privacy Policy | amber">
      <meta
        name="description"
        content="How amber collects, uses, stores and shares your information — and the rights you have over it."
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
    <LegalHero
      title="Privacy Policy"
      subtitle="What we collect, why we collect it, and the rights you have over it"
    />
    <LegalDoc content={PRIVACY_CONTENT} />
    <LegalSeal />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(PrivacyV2, {
  componentName: "PrivacyV2-Page",
  showForChina: true,
});
