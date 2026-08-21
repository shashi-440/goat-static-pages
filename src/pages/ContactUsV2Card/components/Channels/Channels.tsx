import CustomLink from "@Components/CustomLink";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Channels.module.scss";
// The WhatsApp bubble — flat #59d96b with a white handset, no gradient.
//
// It replaced the app TILE (a squircle with a gradient baked in), and that changed how it is
// rendered: a bubble has no background of its own, so it goes in the `mark` slot alongside the
// line icons instead of standing in for the slot. It also must NOT be clipped to a circle the way
// the tile was — the bubble's tail is part of its silhouette.
//
// Still an asset rather than inlined JSX: it carries `id="whatsapp"`, and an inlined id is a
// silent collision waiting for a second one on the page. As an `<img>` its ids are scoped to their
// own document.
import whatsappMark from "../../assets/whatsapp.svg";
// Exported from the design (node I2306:4085;244:3140) rather than drawn by hand, so the stroke
// weight and the taper are the designer's and not an approximation. Its fill is baked in at
// #6B7280 — the file's Secondary/neutral/500 token — which is why the chevron does not recolour
// on hover the way the hand-drawn one did; it only nudges.
import chevronIcon from "../../assets/chevron.svg";
// amber Copilot's mark, lifted from amber-user-website (src/icons/AmberCopilotLogoSvg.tsx).
//
// Converted to a standalone .svg rather than copied in as the JSX component it is there, for the
// same reason as WhatsApp: it carries hardcoded ids — `mask0_2926_1929`, `mask1_2926_1929`,
// `filter0_f_2926_1929`, `clip0_2926_1929` — and inlining those into a page that already has one,
// or later gains one, silently repaints the mark through the wrong mask. As an `<img>` its ids are
// scoped to their own document and cannot collide with anything.
import copilotMark from "../../assets/amber-copilot.svg";
// Supplied line icons, drawn on a 24 grid with `stroke="black"` baked in.
//
// These replaced a Font Awesome Pro `jelly-fill` set (envelope / phone-volume / book), which was
// solid rather than outlined — at 30px the filled envelope in particular read as a blob rather
// than an envelope, because that family trades detail for weight. Line icons hold their shape at
// this size, and they match the set now on How It Works, so the two pages read as one system.
//
// Their viewBoxes are not all square (24x25, 24x24, 25x24), which is why `.mark` carries
// `object-fit: contain` — it letterboxes rather than distorting them into a square box.
import emailMark from "../../assets/email-ground.svg";
import phoneMark from "../../assets/phone-ringing.svg";
import bookMark from "../../assets/book-open.svg";
import wrapperHOC from "@Utils/wrapperHOC";

const SUPPORT_PHONE = "+61 868457597";
const SUPPORT_EMAIL = "support@amberstudent.com";
// wa.me wants the number digits only, no spaces or plus.
const WHATSAPP_NUMBER = "61868457597";

/**
 * Support channels — Figma node 2306:4048 ("Group — Consumer Support Channels").
 *
 * Built to that node's metrics: a small-caps eyebrow over a stack of 10px-spaced rows, each a
 * 14px-radius card with 16/20px padding, the copy taking the slack and a trailing badge and
 * chevron. Every value below that looks arbitrary came from the node.
 *
 * ── Where this deviates from the node, and why ───────────────────────────────
 * Three of them, all places where following the file literally would ship something broken:
 *
 *   · ICONS. The node has no icon slot at all. They are kept because they were asked for
 *     explicitly and the WhatsApp mark was supplied as an asset — and because an icon is
 *     additive here: the node's copy block is `flex: 1 0 0`, so a leading icon changes nothing
 *     else about the row. Say the word and they come out.
 *   · PLACEHOLDER VALUES. The node gives "Live Chat" and "Help Centre" the support phone
 *     number, which neither has. Their real descriptions are kept.
 *   · THE SECOND EYEBROW. Both groups in the node are labelled "SUPPORT CHANNELS"; the second
 *     holds only the help centre, which is not a support channel. Relabelled.
 *
 * The node's badge assignment IS followed exactly, including the part that looks like an
 * oversight: only Live Chat and WhatsApp carry "Instant Reply", not Phone Call. That reads as
 * deliberate on a second look — a call is not a *reply*.
 */

interface Channel {
  label: string;
  /** The address, number, or a line saying what it is. */
  detail: string;
  /** Per the node: messaging channels only. */
  meta?: string;
  /**
   * Where the row goes.
   *
   * ⚠️ OPTIONAL, and two are deliberately unset: `Live chat` and `Help centre` have no
   * destination in this codebase — there is no chat widget wired up and no help URL anywhere in
   * the repo to point at. A row with a dead or guessed href is worse than one that plainly is
   * not finished, so those two render as plain rows until someone supplies the real URLs.
   */
  href?: string;
  /**
   * Exactly one of these per row.
   *
   * There was a third case, `tile`, for finished artwork carrying its OWN background — the WhatsApp
   * app tile. It is gone with that tile: a tile has to replace the icon slot rather than sit in it,
   * or you get two grounds stacked, and nothing supplied since has been one. Re-add it if a square
   * app icon ever turns up.
   *
   *   · `icon` — a monoline glyph drawn to this file's shared weight. Needs the tinted ground
   *     `.iconWrap` provides, or it floats in a white gap.
   *   · `mark` — artwork with no background of its own, rendered as an image rather than stroked
   *     paths. Every row uses this now, including WhatsApp.
   *
   * Every row now carries a real supplied asset — four `mark`s and one `tile`. Nothing is drawn in
   * this file any more, which is why `icon` has no users: it is kept because it is the only one of
   * the three that can inherit `currentColor`, so it is what a future one-off would use rather
   * than a reason to commit a file.
   */
  icon?: JSX.Element;
  mark?: string;
}

/** Order follows the node: Live Chat, WhatsApp, Email, Phone Call. */
const CHANNELS: Channel[] = [
  {
    label: "Live chat",
    // Copilot IS the live chat on amber, so the row names the thing the reader will actually meet
    // rather than describing it generically.
    detail: "Ask amber Copilot, on any page",
    meta: "Instant Reply",
    mark: copilotMark,
  },
  {
    label: "WhatsApp",
    detail: SUPPORT_PHONE,
    meta: "Instant Reply",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    mark: whatsappMark,
  },
  {
    label: "Email",
    detail: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    mark: emailMark,
  },
  {
    label: "Phone call",
    detail: SUPPORT_PHONE,
    href: `tel:${SUPPORT_PHONE.replace(/\s/g, "")}`,
    mark: phoneMark,
  },
];

/** Its own group in the node, with its own eyebrow — self-serve rather than a channel. */
const GUIDES: Channel = {
  label: "Help centre",
  detail: "Guides on booking, payments, documents and moving in",
  // ⚠️ Needs the real help-centre URL; see the note on `Channel.href`.
  mark: bookMark,
};

/** One frame for every glyph: same box, same weight, same joins. */
const Glyph = ({ children }: { children: JSX.Element }) => (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/**
 * A row, as a link where it has somewhere to go and as a plain element where it does not.
 *
 * EVERY row shows a chevron, by request — including the two that have nowhere to go yet.
 *
 * It was hidden on those, on the reasoning that a chevron is an affordance and drawing one on an
 * unwired row is what makes an unfinished row look finished. That is still the risk: Live chat
 * and Help centre now look clickable and are not, so they are the two to remember when the real
 * URLs land. The chevron was never *absent* though, only invisible — it has to hold its slot
 * either way, because the badge sits beside it and dropping the element lets the badge slide
 * right, which is what put three identical badges at two different x positions.
 */
const Row = ({ channel, testId }: { channel: Channel; testId: string }) => {
  const { label, detail, meta, href, icon, mark } = channel;

  const body = (
    <>
      <span className={styles.iconWrap}>
        {mark ? <img className={styles.mark} src={mark} alt="" width="40" height="40" /> : null}
        {icon ? <Glyph>{icon}</Glyph> : null}
      </span>

      <span className={styles.copy}>
        <span className={styles.name}>{label}</span>
        <span className={styles.detail}>{detail}</span>
      </span>

      <span className={styles.trailing}>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
        <img className={styles.chevron} src={chevronIcon} alt="" aria-hidden="true" />
      </span>
    </>
  );

  if (!href) return <li className={styles.card}>{body}</li>;

  // Only http(s) links should open in a new tab. mailto:/tel: hand off to the OS, so a new tab
  // would leave an empty window behind.
  const isWebLink = /^https?:\/\//i.test(href);

  return (
    <li className={styles.cardItem}>
      <CustomLink
        href={href}
        className={styles.card}
        // CustomLink only auto-detects http(s) as external, so mailto:/tel: would otherwise be
        // routed through react-router and rendered as "/mailto:…".
        isExternal
        {...(isWebLink && { target: "_blank", rel: "noopener noreferrer" })}
        dataTestId={testId}
      >
        {body}
      </CustomLink>
    </li>
  );
};

const slug = (label: string) => `contact-us-v2-card-${label.toLowerCase().replace(/\s/g, "-")}`;

const Channels = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      <Reveal className={styles.group}>
        <span className={styles.eyebrow}>Support Channels</span>
        <ul className={styles.grid}>
          {CHANNELS.map((channel) => (
            <Row key={channel.label} channel={channel} testId={slug(channel.label)} />
          ))}
        </ul>
      </Reveal>

      <Reveal className={styles.group} delay={80}>
        <span className={styles.eyebrow}>Help &amp; Guides</span>
        <ul className={styles.grid}>
          <Row channel={GUIDES} testId={slug(GUIDES.label)} />
        </ul>
      </Reveal>
    </div>
  </section>
);

export default wrapperHOC(Channels, {
  componentName: "Channels-ContactUsV2Card",
  showForChina: true,
});
