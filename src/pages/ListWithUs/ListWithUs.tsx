import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import GlobeTravel from "./components/GlobeTravel/GlobeTravel";
import WhyPartners from "./components/WhyPartners/WhyPartners";
import Features from "./components/Features/Features";
import Steps from "./components/Steps/Steps";
import Tools from "./components/Tools/Tools";
import Audience from "./components/Audience/Audience";
import Testimonials from "./components/Testimonials/Testimonials";
import Faq from "./components/Faq/Faq";
import Cta from "./components/Cta/Cta";
import styles from "./ListWithUs.module.scss";

const ListWithUs = () => (
  <div className={styles.page}>
    <Helmet title="List your property with amber | amber">
      <meta
        name="description"
        content="List your property in front of millions of students. Zero listing fees, a dedicated account team and student demand from 160+ countries."
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
    {/* Hero also carries the partner logo wall — see Figma node 2483:9807. */}
    {/* The globe lives here, not inside a section: it is a single fixed layer that
        parks over the hero's slot and glides into the "Why partners" slot on scroll.
        See GlobeTravel for why there is only one instance. */}
    <GlobeTravel />

    <Hero />
    {/* ⚠️  EVERYTHING BELOW THE HERO SITS IN ONE STACKING CONTEXT ABOVE THE GLOBE, and that is what
        lets the hero reserve only as much height as the shrunken globe needs.

        The globe is a `position: fixed` layer at z-index 1, so it paints over static content —
        which meant the hero's slot had to reserve enough room that the shrinking globe could never
        reach the next section, and the difference between that reserve and the shrunken globe was
        dead white space. Raising this block above the layer removes the constraint: the globe slides
        UNDER the content as the page scrolls, so the reserve can match the shrunken size exactly.

        The background is load-bearing too — without it the globe would show through the gaps between
        sections that do not set one of their own. */}
    <div className={styles.belowHero}>
      <WhyPartners />
      {/* The five things a partner gets, on the same card rail Partner With Us uses. Sits here
          rather than lower down because it answers the questions "Why partners list with amber"
          raises, before the page moves on to how listing works. */}
      <Features />
      <Steps />
      <Tools />
      <Audience />
      {/* `Video` — "Begin your journey with amber", the Grow with us player — was here,
          between Audience and Testimonials. Removed from the page; the component is still in
          `components/Video/` with its assets, so putting it back is this line plus its import. */}
      <Testimonials />
      <Faq />
      <Cta />
      <FooterDesktop />
    </div>
  </div>
);

export default wrapperHOC(ListWithUs, {
  componentName: "ListWithUs-Page",
  showForChina: true,
});
