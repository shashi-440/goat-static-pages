import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
// ⚠️  IMPORTED, NOT COPIED. This is List With Us's own section, rendered here as-is so
// the two pages cannot drift: "exact same design and content" is a guarantee when there
// is one component, and a hope when there are two. It brings its own <section>, its own
// <h2> and its own 545KB of tinted Lottie marks. Cross-page imports are already how this
// sandbox shares Reveal and InlineLottie — and that component itself borrows its
// placeholder face from THIS page's assets, so the traffic already goes both ways.
import WhyPartners from "../ListWithUs/components/WhyPartners/WhyPartners";
import Steps from "./components/Steps/Steps";
import Benefits from "./components/Benefits/Benefits";
import Audience from "./components/Audience/Audience";
import Testimonials from "./components/Testimonials/Testimonials";
import Faq from "./components/Faq/Faq";
import Cta from "./components/Cta/Cta";
import styles from "./PartnerWithUs.module.scss";

/**
 * Partner with Us — Figma node 2141:3646.
 *
 * Sibling of List With Us: the same section machinery (shrinking hero photo,
 * stat bento, self-playing step rail, sticky-rail tab section) aimed at
 * education agents and partner organisations rather than property owners. The
 * design drops that page's video section and rebuilds "who we work with" as a
 * five-entry list rather than photo tiles, with the partner marks inside it.
 */
/**
 * The testimonial shown under the stats panel, replacing the Fresh quote that section
 * carries for List With Us. An operator talking about filling voids across a portfolio
 * says nothing to an education consultant, and consultants are who this page is for.
 *
 * ⚠️  ⚠️  NOT APPROVED, AND NOW ATTRIBUTED TO A REAL COMPANY. IDP Education is a real
 * consultancy and this quote is an amber draft — nobody at IDP has said it, and the
 * person named does not exist. Requested for the comp, so it is here; it is a fabricated
 * endorsement from a named third party and cannot go to a staging URL, a deck, or a
 * screenshot that leaves the team, let alone to production.
 *
 * Before this is shown outside the team, ONE of these has to happen:
 *   · IDP approve this wording and supply a real person, title and headshot; or
 *   · the attribution goes back to a role plus a stand-in company (it was
 *     "Education consultant / Acme Education", matching the Steps mock-up above); or
 *   · the quote is replaced with one from a partner who has actually signed off.
 */
const CONSULTANT_VOICE = {
  quote:
    "Accommodation was always the gap in what we could offer. We would get a student " +
    "through their offer and their visa, and then they would ask where they were going " +
    "to live. Now we send them one link and amber takes it from there — the search, the " +
    "booking, and all the questions that come after it.",
  name: "Ananya Sharma",
  role: "Senior Counsellor, IDP Education",
};

const PartnerWithUs = () => (
  <div className={styles.page}>
    <Helmet title="Partner with amber | amber">
      <meta
        name="description"
        content="Become an official amber partner and give your students global access to 1M+ beds across 16,000+ properties in 25+ countries — with a dedicated dashboard, white-label booking and amber Plus services."
      />
      <meta name="robots" content="index,follow" />
      {/* Instrument Sans is the design font; Geist / Geist Mono are used by the
          amber connect mock-ups. Loaded only on this page. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap"
      />
    </Helmet>

    <Header />
    {/* Hero also carries the university logo strip — see Figma node 2141:4368. */}
    <Hero />
    {/* Replaces this page's own `Scale` bento — the four stat cards and the tall bed-
        inventory panel. That component is still on disk, unreferenced, if it is wanted
        back. */}
    <WhyPartners
      heading="Housing, solved at global scale."
      voice={CONSULTANT_VOICE}
    />
    <Steps />
    <Benefits />
    {/* "Who we work with" — and the partner marks now sit inside it, in its
        heading column, rather than in a band of their own underneath. */}
    <Audience />
    <Testimonials />
    <Faq />
    <Cta />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(PartnerWithUs, {
  componentName: "PartnerWithUs-Page",
  showForChina: true,
});
