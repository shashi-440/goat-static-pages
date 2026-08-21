import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
// Navbar and Reveal are shared with About Us v2 rather than copied, so the v2 pages
// keep one source of truth for the scroll/hover interactions.
import Navbar from "../AboutUsV2/components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
// Lived with the ticket variant (GroupBookingV2) while both cuts were up, imported
// from there so the shared section couldn't drift. That page has been removed, so
// this section now belongs to this page.
import Steps from "./components/Steps/Steps";
import styles from "./GroupBookingV2Alt.module.scss";

/**
 * Group Booking.
 *
 * Started as the avatars variant, one of two cuts built for comparison: the group
 * appears as a row of faces rather than a 3D ticket, and the live total sits inside
 * the headline. The ticket cut (GroupBookingV2, /group-booking-v2) has since been
 * removed, so this is the only Group Booking page.
 */
const GroupBookingV2Alt = () => (
  <div className={styles.page}>
    <Helmet title="Group Booking (avatars) | amber">
      <meta
        name="description"
        content="Booking with friends? See what your group could save on student accommodation with amber."
      />
      {/* noindex: this is a variant of /group-booking-v2, not a page of its own. */}
      <meta name="robots" content="noindex,nofollow" />
      {/* Instrument Sans — the design font, loaded only on this page */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
      />
    </Helmet>

    {/* Secondary, so the hero's "Claim group discount" is the only filled pill on
        screen — two of them competed and neither read as the main action. */}
    <Navbar
      links={[
        { label: "How it works", href: "/how-it-works-v2" },
        { label: "Support", href: "/contact-us-v2-card" },
      ]}
      secondaryCta
    />
    <Hero />
    <Steps />
    {/* Remaining sections to come. */}
    <FooterDesktop />
  </div>
);

export default wrapperHOC(GroupBookingV2Alt, {
  componentName: "GroupBookingV2Alt-Page",
  showForChina: true,
});
