import { Helmet } from "react-helmet";
import wrapperHOC from "@Utils/wrapperHOC";
import FooterDesktop from "@Components/FooterV2/FooterDesktop";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import WhyPartners from "./components/WhyPartners/WhyPartners";
import Steps from "./components/Steps/Steps";
import Tools from "./components/Tools/Tools";
import Audience from "./components/Audience/Audience";
import Video from "./components/Video/Video";
import Testimonials from "./components/Testimonials/Testimonials";
import Faq from "./components/Faq/Faq";
import Cta from "./components/Cta/Cta";
import styles from "./ListWithUs.module.scss";

const ListWithUs = () => (
  <div className={styles.page}>
    <Helmet title="List your property with amber | Amber">
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
    <Hero />
    <WhyPartners />
    <Steps />
    <Tools />
    <Audience />
    <Video />
    <Testimonials />
    <Faq />
    <Cta />
    <FooterDesktop />
  </div>
);

export default wrapperHOC(ListWithUs, {
  componentName: "ListWithUs-Page",
  showForChina: true,
});
