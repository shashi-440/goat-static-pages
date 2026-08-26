import { FC } from "react";
import CustomLink from "@Components/CustomLink";
import LazyImage from "@Components/Image";
import HelmetServer from "@Components/HelmetServer";
import getImagePath from "@Utils/getImagePath";
import EnvelopeIcon from "@Icons/EnvelopeIcon";
import PhoneIcon from "@Icons/PhoneIcon";
import WhatsAppIcon from "@Icons/WhatsAppIcon";
import getSiteNavSchema from "../Footer/util";
import contentJson from "../Footer/footerContent.json";
import classes from "./FooterV3.module.scss";

/**
 * A new footer, alongside the old one rather than replacing it.
 *
 * ── Why this is a second component and not an edit ──────────────────────────
 * `components/Footer` is a deliberate REPLICA: its stylesheet is a byte copy of
 * amber-user-website's `FooterDesktop.module.scss` and its DOM, class names and
 * per-link JSON-LD match production, so a page built in this sandbox can be pasted
 * back upstream and still render the real footer. Nine pages here render it. Editing
 * it would break that guarantee for all nine and silently diverge the sandbox from
 * production, which is the one thing this repo exists to avoid.
 *
 * ── The content is NOT duplicated ──────────────────────────────────────────
 * Both footers read the same `footerContent.json`. A second copy of the link table
 * would drift the moment anyone edited one of them, and two footers disagreeing
 * about amber's own sitemap is worse than an import reaching across a folder.
 *
 * ── What makes this one different from the replica ─────────────────────────
 * The old footer is a five-column grid where the fifth column is contact details in
 * boxes, with Trustpilot and a payment/app panel stacked under the wordmark. Four
 * unrelated things share one row and nothing is more important than anything else.
 *
 * This one has an order to it: WHO amber is (brand, trust), WHERE to go (four link
 * columns), HOW to reach a person (a full-width contact strip, because that is the
 * one thing a partner actually wants from a footer), then the small print. The
 * contact rows are lifted out of the column grid for exactly that reason — as a
 * fifth column they read as another list of links.
 *
 * ⚠️  NO RATING IS STATED. The old footer showed "TrustScore 4.8" from Trustpilot's
 * live widget; `footerContent.json` carries only a review COUNT, so a score here
 * would be a number nobody has verified. The count is real and is all this claims.
 */

interface FooterLink {
  label: string;
  href: string;
  gaKey: string;
  tag?: string;
  testId?: string;
}
interface FooterColumn {
  heading: string;
  testId: string;
  items: FooterLink[];
}
interface FooterContent {
  logo: { src: string; alt: string; width: string; height: string };
  copyright: string;
  columns: FooterColumn[];
  support: FooterColumn;
  contact: {
    heading: string;
    testId: string;
    items: { icon: string; label: string; link: string }[];
  };
  followUs: {
    label: string;
    items: { name: string; href: string; src: string; alt: string; testId: string }[];
  };
  trustpilot: { href: string; reviewsCount: { rounded: number; absolute: number } };
  appDownload: {
    getAppLabel: string;
    playStore: { href: string; src: string; alt: string; testId: string };
    appStore: { href: string; src: string; alt: string; testId: string };
    paymentPartners: { src: string; alt: string; width: string; height: string };
  };
}

// `resolveJsonModule` narrows each array element to a literal union, which drops the
// optional keys. Widening once here keeps the JSX below readable.
const content = contentJson as unknown as FooterContent;

/** The contact rows are keyed by an `icon` string in the JSON. Typed on `fill`, which
 *  is what these three icons take — not `color`. */
const CONTACT_ICONS: Record<string, FC<{ fill?: string }>> = {
  envelope: EnvelopeIcon,
  whatsapp: WhatsAppIcon,
  phone: PhoneIcon,
};

/** Every nav column, in reading order. `support` is one in all but name. */
const NAV_COLUMNS = [...content.columns, content.support];

const STORES = [
  { ...content.appDownload.appStore, name: "App Store" },
  { ...content.appDownload.playStore, name: "Google Play" },
];

const FooterV3: FC = () => (
  <footer className={classes.footer}>
    <div className={classes.inner}>
      {/* ── Brand and navigation ─────────────────────────────────────────── */}
      <div className={classes.top}>
        <div className={classes.brand}>
          <LazyImage
            src={content.logo.src}
            alt="amber"
            className={classes.logo}
            width={content.logo.width}
            height={content.logo.height}
            isNotLazy
          />
          <p className={classes.pitch}>
            Student housing in 240+ cities, booked with people on the other end.
          </p>

          {/* Count only — see the ⚠️ note at the top of this file on why there is no
              score here. */}
          <a
            className={classes.trust}
            href={content.trustpilot.href}
            target="_blank"
            rel="noreferrer"
          >
            <span className={classes.trustStar} aria-hidden="true">
              ★
            </span>
            Rated by {content.trustpilot.reviewsCount.rounded.toLocaleString("en-GB")}+
            students on Trustpilot
          </a>

          <div className={classes.stores}>
            {STORES.map((store) => (
              <a
                key={store.name}
                className={classes.store}
                href={store.href}
                target="_blank"
                rel="noreferrer"
                data-testid={store.testId}
              >
                <LazyImage
                  src={getImagePath(store.src)}
                  alt=""
                  className={classes.storeIcon}
                  width="18px"
                  height="18px"
                  isNotLazy
                />
                {store.name}
              </a>
            ))}
          </div>
        </div>

        {/* A <nav> per column, each labelled by its own heading — so a screen reader
            gets four named landmarks rather than one long unlabelled list. */}
        <div className={classes.columns}>
          {NAV_COLUMNS.map((column) => (
            <nav
              className={classes.column}
              key={column.heading}
              aria-label={column.heading}
              data-testid={column.testId}
            >
              <h2 className={classes.columnHeading}>{column.heading}</h2>
              <ul className={classes.columnList}>
                {column.items.map((item) => (
                  <li key={item.label}>
                    {/* Carried over from the replica: one SiteNavigationElement per
                        link is what makes the footer legible to a crawler as amber's
                        sitemap. */}
                    <HelmetServer>
                      <script type="application/ld+json" suppressHydrationWarning>
                        {getSiteNavSchema(item.label, item.href)}
                      </script>
                    </HelmetServer>
                    <CustomLink
                      href={item.href}
                      className={classes.link}
                      dataTestId={item.testId}
                    >
                      {item.label}
                      {item.tag ? <span className={classes.tag}>{item.tag}</span> : null}
                    </CustomLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* ── Contact strip ────────────────────────────────────────────────── */}
      <div className={classes.contact} data-testid={content.contact.testId}>
        {content.contact.items.map((item) => {
          const Icon = CONTACT_ICONS[item.icon];
          return (
            <a className={classes.contactCard} href={item.link} key={item.label}>
              <span className={classes.contactIcon}>
                {Icon ? <Icon fill="#1c64f2" /> : null}
              </span>
              {/* No channel micro-label above the value. The JSON's `icon` key is
                  the only thing that names the channel and it reads "envelope", not
                  "Email" — and for the WhatsApp row the label IS "WhatsApp", so a
                  kind line would print it twice. Relabelling all three means writing
                  copy nobody asked for. The icon already says which channel it is. */}
              <span className={classes.contactValue}>{item.label}</span>
            </a>
          );
        })}
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div className={classes.bottom}>
        <p className={classes.copyright}>
          © amber {new Date().getFullYear()}. {content.copyright}
        </p>

        <div className={classes.bottomRight}>
          <LazyImage
            src={getImagePath(content.appDownload.paymentPartners.src)}
            alt={content.appDownload.paymentPartners.alt}
            className={classes.payments}
            width={content.appDownload.paymentPartners.width}
            height={content.appDownload.paymentPartners.height}
            isNotLazy
          />

          <span className={classes.divider} aria-hidden="true" />

          <div className={classes.social} aria-label={content.followUs.label}>
            {content.followUs.items.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.name}
                data-testid={item.testId}
                className={classes.socialLink}
              >
                <LazyImage
                  src={getImagePath(item.src)}
                  alt=""
                  className={classes.socialIcon}
                  width="18px"
                  height="18px"
                  isNotLazy
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default FooterV3;
