import CustomLink from "@Components/CustomLink";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./SupportChannels.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

interface Channel {
  /** Row label — the channel name. */
  label: string;
  /** The address/number shown under the label. */
  detail: string;
  /** Optional response-time note, shown after a middot. */
  note?: string;
  /** Where the row goes when clicked. */
  href: string;
}

interface ChannelGroup {
  /** Left-column heading for the group. */
  title: string;
  channels: Channel[];
}

const SUPPORT_PHONE = "+61 868457597";
const SUPPORT_EMAIL = "support@amberstudent.com";
// wa.me wants the number digits only, no spaces or plus.
const WHATSAPP_NUMBER = "61868457597";

const GROUPS: ChannelGroup[] = [
  {
    title: "Consumer Support Channels",
    channels: [
      {
        label: "WhatsApp",
        detail: SUPPORT_PHONE,
        note: "Instant Reply",
        href: `https://wa.me/${WHATSAPP_NUMBER}`,
      },
      {
        label: "Email",
        detail: SUPPORT_EMAIL,
        href: `mailto:${SUPPORT_EMAIL}`,
      },
      {
        label: "Phone Call",
        detail: SUPPORT_PHONE,
        note: "Instant Reply",
        href: `tel:${SUPPORT_PHONE.replace(/\s/g, "")}`,
      },
    ],
  },
  {
    title: "Partners Support Channels",
    channels: [
      {
        label: "WhatsApp",
        detail: SUPPORT_PHONE,
        note: "Instant Reply",
        href: `https://wa.me/${WHATSAPP_NUMBER}`,
      },
      {
        label: "Email",
        detail: SUPPORT_EMAIL,
        href: `mailto:${SUPPORT_EMAIL}`,
      },
      {
        label: "Phone Call",
        detail: SUPPORT_PHONE,
        note: "Instant Reply",
        href: `tel:${SUPPORT_PHONE.replace(/\s/g, "")}`,
      },
    ],
  },
];

/** Thin chevron at the end of each row. Inline so it can inherit hover colour. */
const Chevron = () => (
  <svg
    className={styles.chevron}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M9 5l7 7-7 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChannelRow = ({ channel }: { channel: Channel }) => {
  // Only http(s) links should open in a new tab. mailto:/tel: hand off to the
  // OS, so a new tab would leave an empty window behind.
  const isWebLink = /^https?:\/\//i.test(channel.href);

  return (
    <CustomLink
      href={channel.href}
      className={styles.row}
      // CustomLink only auto-detects http(s) as external, so mailto:/tel: would
      // otherwise be routed through react-router and rendered as "/mailto:…".
      isExternal
      {...(isWebLink && { target: "_blank", rel: "noopener noreferrer" })}
      dataTestId={`contact-us-v2-${channel.label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <span className={styles.rowText}>
        <span className={styles.label}>{channel.label}</span>
        <span className={styles.detail}>
          {channel.detail}
          {channel.note ? (
            <>
              <span className={styles.dot} aria-hidden="true" />
              {channel.note}
            </>
          ) : null}
        </span>
      </span>
      <Chevron />
    </CustomLink>
  );
};

const SupportChannels = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      {GROUPS.map((group, groupIndex) => (
        <Reveal key={group.title} className={styles.group} delay={groupIndex * 120}>
          <div className={styles.headingCol}>
            {/* Short rule that sits above every group heading. */}
            <span className={styles.rule} aria-hidden="true" />
            <h2 className={styles.heading}>{group.title}</h2>
          </div>

          <div className={styles.rows}>
            {group.channels.map((channel) => (
              <ChannelRow key={`${group.title}-${channel.label}`} channel={channel} />
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

export default wrapperHOC(SupportChannels, {
  componentName: "SupportChannels-ContactUsV2",
  showForChina: true,
});
