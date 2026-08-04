import { FC } from "react";
import CustomLink from "@Components/CustomLink";
import LazyImage from "@Components/Image";
import TrustPilotDynamicWidget from "@Components/TrustPilotDynamicWidget";
import formatClassNames from "@Utils/clientUtils/stringUtility/formatClassNames";
import getImagePath from "@Utils/getImagePath";
import themeVariables from "@Theme/exportColor.module.scss";
import EnvelopeIcon from "@Icons/EnvelopeIcon";
import PhoneIcon from "@Icons/PhoneIcon";
import WhatsAppIcon from "@Icons/WhatsAppIcon";

import HelmetServer from "@Components/HelmetServer";

import classes from "./Footer.module.scss";
import getSiteNavSchema from "./util";
import AppDownload from "./components/AppDownload/AppDownload";
import FollowUs from "./components/FollowUs/FollowUs";
import ContactCard from "./components/ContactCard/ContactCard";
import contentJson from "./footerContent.json";

interface FooterLink {
  label: string;
  href: string;
  gaKey: string;
  tag?: string;
  hiddenForUsers?: boolean;
  testId?: string;
}
interface FooterColumn {
  heading: string;
  testId: string;
  tagHasTestId?: boolean;
  items: FooterLink[];
}
interface FooterContent {
  logo: { src: string; alt: string; width: string; height: string };
  copyright: string;
  columns: FooterColumn[];
  support: { heading: string; testId: string; items: FooterLink[] };
  contact: { heading: string; testId: string; items: { icon: string; label: string; link: string }[] };
}

// resolveJsonModule infers a narrow literal union per array element, which loses
// the optional keys. Widening once here keeps the JSX below readable.
const content = contentJson as unknown as FooterContent;

/**
 * Structured static port of amber-user-website's FooterDesktop.
 *
 * Same DOM tree, same class names (Footer.module.scss is a byte copy of
 * FooterDesktop.module.scss), same per-link JSON-LD — so it renders pixel-identical
 * to production. What differs, and why:
 *
 *   - Copy comes from footerContent.json (English) rather than Tolgee `t()`.
 *   - Contact phone is the UK default; the original picks it from the Redux
 *     `country` code.
 *   - No China variant, no gtag click events, no CSP nonce.
 *   - No sub-LG swap to the mobile FooterV2 — this sandbox is desktop-only, matching
 *     how /about-us-v2 is registered upstream.
 *
 * Editing links or labels means editing footerContent.json, not this file.
 */

const ICONS: Record<string, JSX.Element> = {
  envelope: EnvelopeIcon({ fill: themeVariables.primary5 }),
  phone: PhoneIcon({ fill: themeVariables.primary5 }),
  whatsapp: WhatsAppIcon({ fill: "#25D366" }),
};

// Routed through HelmetServer so the schema is hoisted to the end of <body>,
// matching where amber-user-website emits it.
const NavSchema = ({ name, url }: { name: string; url: string }): JSX.Element => (
  <HelmetServer>
    <script type="application/ld+json" suppressHydrationWarning>
      {getSiteNavSchema(name, url)}
    </script>
  </HelmetServer>
);

const Footer: FC = () => {
  const year = new Date().getFullYear();

  return (
    <section className={classes.footerContainer}>
      <div className={classes.container} data-testid="footer-section">
        <div className={classes.mainDesktopContainer}>
          {/* {Section 1} */}
          <div className={classes.leftContainer}>
            <LazyImage
              dataTestId="footer-Amber-logo"
              src={getImagePath(content.logo.src)}
              className={classes.amberImg}
              alt={content.logo.alt}
              width={content.logo.width}
              height={content.logo.height}
            />
            <div
              data-testid="footer-amber-rights-reserved"
              className={classes.subHeading}
            >{`amber © ${year}. ${content.copyright}`}</div>
            <div className={classes.trustpilotWrapperDesktop}>
              <TrustPilotDynamicWidget />
            </div>
            <AppDownload isDesktop />
          </div>

          {/* {Section 2} */}
          <div className={classes.subContainer}>
            {content.columns.map((column) => (
              <div className={classes.child} key={column.heading}>
                <div className={classes.sectionOneContainer}>
                  <div data-testid={column.testId} className={classes.sectionHeading}>
                    {column.heading}
                  </div>
                </div>
                {column.items.map((item) => (
                  <div
                    className={formatClassNames(
                      classes.listItem,
                      item.hiddenForUsers && classes.hiddenForUsers,
                    )}
                    key={item.label}
                  >
                    <NavSchema name={item.label} url={item.href} />
                    <CustomLink
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      isExternal
                      dataTestId={item.label}
                    >
                      {item.label}
                    </CustomLink>
                    {item.tag &&
                      (column.tagHasTestId ? (
                        <span data-testid="footer-option-tag">{item.tag}</span>
                      ) : (
                        <span>{item.tag}</span>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* {Section 3} */}
          <div className={classes.supportSection}>
            <div style={{ cursor: "default" }}>
              <div data-testid={content.support.testId} className={classes.sectionHeading}>
                {content.support.heading}
              </div>
            </div>
            {content.support.items.map((item) => (
              <div className={classes.listItem} key={item.label}>
                <NavSchema name={item.gaKey} url={item.href} />
                <CustomLink
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  isExternal
                  dataTestId={item.testId}
                >
                  {item.label}
                </CustomLink>
              </div>
            ))}
          </div>

          {/* {Section 4} */}
          <div className={classes.contactUsSection}>
            <div data-testid={content.contact.testId} className={classes.sectionText}>
              {content.contact.heading}
            </div>
            {content.contact.items.map((item) => (
              <ContactCard
                key={item.label}
                icon={ICONS[item.icon]}
                label={item.label}
                link={item.link}
              />
            ))}
            <FollowUs isMobile={false} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
