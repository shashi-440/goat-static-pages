import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
// Navbar and Reveal are shared with About Us v2 rather than copied, so the v2 pages
// keep one source of truth for the scroll/hover interactions.
import Navbar from "../AboutUsV2/components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Channels from "./components/Channels/Channels";
import styles from "./ContactUsV2Card.module.scss";

/**
 * Contact Us, photo + two-column channels variant.
 *
 * A third cut of /contact-us-v2. The original stacks a small label above each set of
 * channels in one narrow column; /contact-us-v2-alt lays them on the photo in a
 * panel. This one gives each group's name its own column at display size, with the
 * rows running down beside it, under a photo that carries nothing on top of it.
 *
 * Not the shared SupportChannels section: that one is the single-column cut. This
 * layout is local to this page so the two can be compared side by side.
 */
const ContactUsV2Card = () => (
  <div className={styles.page}>
    <Helmet title="Contact Us (channel card) | amber">
      <meta
        name="description"
        content="WhatsApp, email or a call — whichever you prefer, someone answers."
      />
      {/* noindex: a variant of /contact-us-v2, not a page of its own. */}
      <meta name="robots" content="noindex,nofollow" />
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
    <Channels />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(ContactUsV2Card, {
  componentName: "ContactUsV2Card-Page",
  showForChina: true,
});
