import { FC, ReactNode } from "react";
import CustomLink from "@Components/CustomLink";
import LazyImage from "@Components/Image";
import TrustPilotDynamicWidget from "@Components/TrustPilotDynamicWidget";
import formatClassNames from "@Utils/clientUtils/stringUtility/formatClassNames";
import getImagePath from "@Utils/getImagePath";

import AppDownload from "./components/AppDownload/AppDownload";
import FollowUs from "./components/FollowUs/FollowUs";
import ContactCard from "./components/ContactCard/ContactCard";
import type { FooterContent, FooterLink } from "./Footer";
import footerClasses from "./Footer.module.scss";
import classes from "./FooterMobile.module.scss";

interface FooterMobileProps {
  content: FooterContent;
  icons: Record<string, JSX.Element>;
  year: number;
}

const Chevron = (): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Section = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <details className={classes.section}>
    <summary className={classes.sectionHeading}>
      {heading}
      <span className={classes.chevron}>
        <Chevron />
      </span>
    </summary>
    {children}
  </details>
);

const LinkList = ({ items }: { items: FooterLink[] }) => (
  <>
    {items.map((item) => (
      <div
        className={formatClassNames(classes.listItem, item.hiddenForUsers && footerClasses.hiddenForUsers)}
        key={item.label}
      >
        <CustomLink href={item.href} target="_blank" rel="noreferrer" isExternal>
          {item.label}
        </CustomLink>
        {item.tag && <span>{item.tag}</span>}
      </div>
    ))}
  </>
);

/**
 * The footer below 1200px — a static stand-in for amber-user-website's FooterV2mobile.
 *
 * Production's FooterDesktop returns <FooterV2 /> when `isBelow(SCREEN_SIZE.LG)`, so a
 * desktop browser narrower than 1200px gets this stacked layout (centred logo,
 * Trustpilot band, app/payment row, Company / Discover / Support / Contact us
 * accordion) instead of five squeezed columns. Footer.tsx renders both layouts and
 * FooterMobile.module.scss picks one by width, so the right one paints before JS runs.
 *
 * Differences from production: the accordion is native <details> rather than React
 * state, and this layout emits no JSON-LD (no per-link schema, and FollowUs gets
 * withSchema={false}) — the desktop layout already emits it, and both layouts are
 * always in the DOM. For the same reason the shared pieces (AppDownload, ContactCard,
 * FollowUs, the Trustpilot widget) carry their data-testids twice; scope any selector
 * to the visible layout. The Trustpilot widget in the hidden layout stays unloaded:
 * it only joins Trustpilot's scan once it scrolls into view (see its own docblock).
 */
const FooterMobile: FC<FooterMobileProps> = ({ content, icons, year }) => (
  <div className={classes.container}>
    <div className={footerClasses.imageContainer}>
      <LazyImage
        src={getImagePath(content.logo.src)}
        className={footerClasses.amberImg}
        alt={content.logo.alt}
        width={content.logo.width}
        height={content.logo.height}
      />
      <div className={classes.subHeading}>{`amber © ${year}. ${content.copyright}`}</div>
    </div>

    <div className={classes.trustpilotWrapper}>
      <TrustPilotDynamicWidget />
    </div>

    <AppDownload />

    {content.columns.map((column) => (
      <Section heading={column.heading} key={column.heading}>
        <LinkList items={column.items} />
      </Section>
    ))}

    <Section heading={content.support.heading}>
      <LinkList items={content.support.items} />
    </Section>

    <Section heading={content.contact.heading}>
      {content.contact.items.map((item) => (
        <ContactCard key={item.label} icon={icons[item.icon]} label={item.label} link={item.link} />
      ))}
      <div className={classes.followUs}>
        <FollowUs withSchema={false} />
      </div>
    </Section>
  </div>
);

export default FooterMobile;
