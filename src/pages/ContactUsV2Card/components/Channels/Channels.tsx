import { Fragment } from "react";
import CustomLink from "@Components/CustomLink";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Channels.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

const SUPPORT_PHONE = "+61 868457597";
const SUPPORT_EMAIL = "support@amberstudent.com";
// wa.me wants the number digits only, no spaces or plus.
const WHATSAPP_NUMBER = "61868457597";

const CHANNELS = [
  {
    label: "WhatsApp",
    detail: SUPPORT_PHONE,
    // Only the live channels carry it — an inbox can't promise the same, and
    // putting it on all three would make it read as decoration.
    meta: "Instant Reply",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
  },
  {
    label: "Email",
    detail: SUPPORT_EMAIL,
    meta: "",
    href: `mailto:${SUPPORT_EMAIL}`,
  },
  {
    label: "Phone Call",
    detail: SUPPORT_PHONE,
    meta: "Instant Reply",
    href: `tel:${SUPPORT_PHONE.replace(/\s/g, "")}`,
  },
];

/**
 * Both groups list the same three channels with the same values, exactly as the
 * other Contact cuts do — so the list is defined once and rendered twice rather
 * than duplicated. `slug` only distinguishes the test ids.
 */
const GROUPS = [
  { title: "Consumer Support Channels", slug: "consumer" },
  { title: "Partners Support Channels", slug: "partners" },
];

const ChannelRow = ({
  channel,
  group,
}: {
  channel: (typeof CHANNELS)[number];
  group: string;
}) => {
  // Only http(s) links should open in a new tab. mailto:/tel: hand off to the OS,
  // so a new tab would leave an empty window behind.
  const isWebLink = /^https?:\/\//i.test(channel.href);

  return (
    <li>
      <CustomLink
        href={channel.href}
        className={styles.row}
        // CustomLink only auto-detects http(s) as external, so mailto:/tel: would
        // otherwise be routed through react-router and rendered as "/mailto:…".
        isExternal
        {...(isWebLink && { target: "_blank", rel: "noopener noreferrer" })}
        dataTestId={`contact-us-v2-card-${group}-${channel.label
          .toLowerCase()
          .replace(/\s/g, "-")}`}
      >
        <span className={styles.copy}>
          <span className={styles.name}>{channel.label}</span>
          <span className={styles.detail}>
            {channel.detail}
            {channel.meta ? (
              <>
                <span className={styles.dot} aria-hidden="true">
                  ·
                </span>
                <span className={styles.meta}>{channel.meta}</span>
              </>
            ) : null}
          </span>
        </span>

        <svg
          className={styles.chevron}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 5 7 7-7 7" />
        </svg>
      </CustomLink>
    </li>
  );
};

/**
 * Support channels, two-column cut.
 *
 * The group's name sits in its own column rather than as a label above the rows, so
 * the two headings anchor the left edge of the page and the list runs uninterrupted
 * down the right. That's the difference from the original Contact page's version,
 * where the label sits inline above each set and the whole thing is one narrow
 * column.
 *
 * No leading glyphs on the rows here: with the label promoted to display size, an
 * icon per row would be the third thing competing on a line that only needs to say
 * what the channel is and how to reach it.
 */
const Channels = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      {GROUPS.map((group, i) => (
        <Fragment key={group.slug}>
          {i > 0 ? <span className={styles.rule} aria-hidden="true" /> : null}
          <Reveal className={styles.group} delay={i * 80}>
            <div className={styles.heading}>
              <span className={styles.dash} aria-hidden="true" />
              <h2 className={styles.title}>{group.title}</h2>
            </div>

            <ul className={styles.rows}>
              {CHANNELS.map((channel) => (
                <ChannelRow
                  key={`${group.slug}-${channel.label}`}
                  channel={channel}
                  group={group.slug}
                />
              ))}
            </ul>
          </Reveal>
        </Fragment>
      ))}
    </div>
  </section>
);

export default wrapperHOC(Channels, {
  componentName: "Channels-ContactUsV2Card",
  showForChina: true,
});
