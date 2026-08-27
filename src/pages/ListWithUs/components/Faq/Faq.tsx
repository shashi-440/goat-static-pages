import { Fragment, useState } from "react";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Faq.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * FAQ accordion — Figma node 2456:6682. The first item renders open, as in the design; one item
 * open at a time.
 *
 * ⚠️  SEVENTEEN QUESTIONS IN FOUR GROUPS, replacing a flat list of nineteen. The copy is supplied
 * rather than drafted this time — the previous set was written here against a brief, and none of it
 * survives verbatim. Notably the answers that used to be deliberately vague are now specific, and
 * that specificity comes from the brief rather than from this page:
 *   · go-live is "within a day of commercials being agreed", where the old answer said "a few
 *     working days" and carried a warning that it had never been verified;
 *   · PMS integration is now a plain yes, where the old answer named nothing on purpose;
 *   · offers are "partner funded", and pricing changes are made BY the account manager rather than
 *     by the partner in a dashboard — which contradicts what the Tools section's mock-ups imply.
 *     Worth checking those two against each other before this ships.
 *
 * Commission still states no rate, which remains correct: it is a per-partner commercial term.
 */

/**
 * ⚠️  THE GROUP LABEL IS A HEADING RENDERED BEFORE THE ROW, not a property of the question. Keeping
 * the items in one flat array is what lets the accordion stay index-based — `open` is an index, and
 * nesting the groups would mean a composite key and a rewrite of the open/close logic for no gain.
 *
 * ⚠️  "Getting started" IS INFERRED. The brief labels the last three groups and leaves the first five
 * questions unlabelled; with three headings below it, an unlabelled opening block reads as one that
 * lost its heading rather than one that never had one. Rename or drop it if that was deliberate.
 */
interface Item {
  /** Renders a group heading above this row. */
  group?: string;
  question: string;
  answer: string;
}

const ITEMS: Item[] = [
  {
    group: "Getting started",
    question: "Who can list with amber?",
    answer:
      "Anyone with student accommodation to fill: individual landlords with a single room, " +
      "mid-sized operators, and large PBSA and BTR groups. There is no minimum portfolio size.",
  },
  {
    question: "How does listing with amber work?",
    answer:
      "Four steps. Share your property details, agree commercials, we set up your inventory, " +
      "pricing and content, and your listing goes live.",
  },
  {
    question: "What information do I need to provide to get started?",
    answer:
      "Property details, room types, pricing, availability, tenancy lengths, amenities, policies, " +
      "offers and media.",
  },
  {
    question: "What photos and videos should I provide?",
    answer:
      "Clear, recent visuals of each room type, plus common areas, amenities and the exterior. " +
      "Virtual tours are welcome. Your onboarding contact will tell you if anything is missing.",
  },
  {
    question: "How quickly can my property go live?",
    answer:
      "Within a day of commercials being agreed and your details and media reaching us. " +
      "Incomplete content is the only usual delay.",
  },

  {
    group: "Costs and commission",
    question: "Is there a fee to list on amber?",
    answer:
      "No. Listing is free, with no subscription or setup cost. amber earns only once a booking is " +
      "confirmed.",
  },
  {
    question: "What commission does amber charge?",
    answer:
      // ⚠️  STILL NO RATE, and that stays correct: commission is a per-partner commercial term and
      // not this page's to publish.
      "Commission is agreed during onboarding and varies by property, market, inventory type and " +
      "partnership structure. It applies only to confirmed bookings, and nothing is due if a " +
      "booking cancels.",
  },

  {
    group: "Managing your property",
    question: "Can I manage my prices, availability and offers?",
    answer:
      "Yes. You control what you charge, what you make available and what you promote. Your " +
      "account manager makes the changes for you.",
  },
  {
    question: "Can amber work with my existing PMS or booking system?",
    answer:
      "Yes. We work with the systems you already use, agreed during onboarding. No integration is " +
      "required to go live.",
  },
  {
    question: "How are bookings managed?",
    answer:
      "A student books your room on amber, then the booking comes to you for approval. You keep " +
      "the final say on who moves in.",
  },
  {
    question: "Can I track my property's performance?",
    answer:
      "Yes. Bookings, enquiries, views, conversion and how your pricing compares with similar " +
      "properties in your market.",
  },
  {
    question: "Can I run promotions or special offers on amber?",
    answer:
      "Yes. Discounts, cashback, gift cards, early bird rates and referrals are all supported. " +
      "Offers are partner funded, so you decide the margin and the timing.",
  },

  {
    group: "Growth and support",
    question: "How does amber help me get more bookings?",
    answer:
      "We bring international student demand, run campaigns around your inventory and support " +
      "students through to booking with a live advisory team.",
  },
  {
    question: "Where will my property be shown?",
    answer:
      "Across amber's marketplace: city pages, university pages, search results and " +
      "recommendations. Your property also features in marketing campaigns and is put in front of " +
      "students by our advisory team.",
  },
  {
    question: "How will my account be managed?",
    answer:
      "You get a named account manager covering inventory, pricing, content, offers, performance " +
      "reviews and escalations. One point of contact, no ticket queue.",
  },
  {
    question: "What support does amber provide?",
    answer:
      "Support is available 24/7, covering onboarding, day to day operations, bookings and growth. " +
      "Booking queries are handled by us, not passed back to you.",
  },
  {
    question: "What makes amber different from other listing platforms?",
    answer:
      "Most platforms sell visibility or pass you leads to chase. amber is built to deliver " +
      "confirmed bookings. The outcome is occupancy, not enquiries.",
  },
];

const Faq = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* The h2 alone. It carried a line under it — "Everything partners ask before they
            list. If it is not here, we will answer it on the call." — which `.headingBlock`
            existed to pair it with; both are gone. "Frequently asked questions" needs no
            introduction, and the promise about the call is the CTA's job two sections down. */}
        <Reveal as="h2" className={styles.heading}>
          Frequently asked questions
        </Reveal>

        <Reveal className={styles.list} delay={100}>
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              // The group heading sits OUTSIDE the row on purpose — inside it, it would be part of
              // the button and clicking the label would toggle the first question of its group.
              <Fragment key={item.question}>
                {item.group ? <h3 className={styles.group}>{item.group}</h3> : null}

                <div className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}>
                  <button
                    type="button"
                    className={styles.trigger}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span className={styles.question}>{item.question}</span>
                    <span
                      className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ""}`}
                      aria-hidden="true"
                    >
                      {isOpen ? "–" : "+"}
                    </span>
                  </button>

                  {isOpen ? <p className={styles.answer}>{item.answer}</p> : null}
                </div>
              </Fragment>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default wrapperHOC(Faq, {
  componentName: "Faq-ListWithUs",
  showForChina: true,
});
