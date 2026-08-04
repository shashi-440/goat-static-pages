import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
// Navbar, Reveal and TitleStamp are shared with About Us v2 rather than copied,
// so both pages keep one source of truth for the scroll/hover interactions.
// AboutUsV2 is left untouched (its files must stay byte-identical to upstream).
import Navbar from "../AboutUsV2/components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import SupportChannels from "./components/SupportChannels/SupportChannels";
import CopilotInput from "./components/CopilotInput/CopilotInput";
import styles from "./ContactUsV2.module.scss";

const ContactUsV2 = () => (
  <div className={styles.page}>
    <Helmet title="Contact Us | Amber">
      <meta
        name="description"
        content="Get in touch with Amber — reach our student and partner support teams on WhatsApp, email or a phone call."
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
    <SupportChannels />
    <FooterDesktop />

    {/* Copilot ask field, docked to the bottom-centre of the viewport so it
        stays reachable from anywhere on the page. */}
    <div className={styles.copilotDock}>
      <CopilotInput />
    </div>
  </div>
);

export default wrapperHOC(ContactUsV2, {
  componentName: "ContactUsV2-Page",
  showForChina: true,
});
