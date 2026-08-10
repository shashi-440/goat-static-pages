import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
// Navbar is shared with About Us v2; the document furniture — hero, body renderer
// and closing seal — is shared with /privacy-v2.
import Navbar from "../AboutUsV2/components/Navbar/Navbar";
import LegalHero from "@Components/LegalDoc/LegalHero";
import LegalDoc from "@Components/LegalDoc/LegalDoc";
import LegalSeal from "@Components/LegalDoc/LegalSeal";
import TERMS_CONTENT from "./content/terms";
import styles from "./TermsV2.module.scss";

const TermsV2 = () => (
  <div className={styles.page}>
    <Helmet title="Terms and Conditions | amber">
      <meta
        name="description"
        content="The terms of use that apply when you access or use amberstudent.com and its related sites and apps."
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
      title="Terms and Conditions"
      subtitle="The terms that apply when you browse, enquire or book through amber"
    />
    <LegalDoc content={TERMS_CONTENT} />
    <LegalSeal />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(TermsV2, {
  componentName: "TermsV2-Page",
  showForChina: true,
});
