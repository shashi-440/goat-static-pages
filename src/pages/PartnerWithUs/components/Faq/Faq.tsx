import { useState } from "react";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Faq.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * FAQ accordion — Figma node 2141:4120. The first item renders open, as in the
 * design; one item open at a time.
 */

/**
 * The partnerships team's approved FAQ — ten items, replacing the four that were
 * here.
 *
 * Only the first of those four existed in the Figma file; the other three were
 * written from copy elsewhere on the page as placeholders, and every one of them is
 * now gone. Nothing on this list is inferred: it is the supplied wording verbatim,
 * including its British spellings ("centralised", "counselling") and its curly
 * apostrophes, so it matches whatever else the team publishes it in.
 */
const ITEMS = [
  {
    question: "Who can partner with amber?",
    answer:
      "amber partners with education consultants, study-abroad agencies, universities, " +
      "student communities and other organisations that support students travelling " +
      "overseas. Whether you are a large education group or an independent consultant, you " +
      "can partner with amber to help your students find trusted student accommodation.",
  },
  {
    question: "How do I become an official amber partner?",
    answer:
      "Simply submit your details through the Partner with us form. Our partnerships team " +
      "will get in touch with you to understand your business, complete the onboarding " +
      "process and provide you with access to amber’s partner tools and resources.",
  },
  {
    question: "Is there any cost to becoming an amber partner?",
    answer:
      "No. There is no cost to becoming an amber partner. Once onboarded, you can refer " +
      "students to amber and earn commissions on eligible bookings made through your " +
      "partner account.",
  },
  {
    question: "How does the amber partner commission structure work?",
    answer:
      "Partners can earn commission on eligible student accommodation bookings referred " +
      "through their account. Your commission is tracked against your referred bookings, " +
      "giving you clear visibility of your performance and earnings. The exact commission " +
      "structure may vary based on your partnership agreement and booking volumes.",
  },
  {
    question: "How can I refer students to amber?",
    answer:
      "Once you are onboarded, you can refer students through your dedicated partner tools, " +
      "including your unique referral link and other available lead-sharing options. Simply " +
      "share the accommodation options with your students and refer them to amber, and our " +
      "team will support them through the booking journey.",
  },
  {
    question: "How does amber track and attribute my student referrals?",
    answer:
      "amber uses dedicated partner tracking and attribution mechanisms to ensure that " +
      "eligible students referred by you are linked to your partner account. You can also " +
      "track your leads and bookings through the Partner Dashboard, giving you greater " +
      "transparency throughout the student journey.",
  },
  {
    question: "What is the amber Partner Dashboard and what can I do with it?",
    answer:
      "The amber Partner Dashboard gives you a centralised view of your partnership " +
      "activity. Depending on your partnership setup, you can use it to track referred " +
      "students, leads, bookings and other key information, helping you manage your student " +
      "accommodation referrals more efficiently.",
  },
  {
    question: "Which countries, cities and universities can I offer accommodation for?",
    answer:
      "amber offers student accommodation across major study-abroad destinations and cities " +
      "worldwide. You can search for accommodation based on the student’s university, city " +
      "or preferred location and help them find options that match their requirements. " +
      "Availability varies by destination, university and intake.",
  },
  {
    question: "What support does amber provide to partners and their students?",
    answer:
      "Partners receive dedicated support from amber throughout the referral and booking " +
      "journey. Our team can assist with accommodation recommendations, availability, " +
      "booking queries and student support, helping you provide a smoother experience to " +
      "your students while you focus on your core counselling and admissions activities.",
  },
  {
    question: "Does amber offer white-label or API integration for partners?",
    answer:
      "Yes. amber can support technology-led partnerships through solutions such as APIs, " +
      "integrations and white-label accommodation experiences, depending on the partner’s " +
      "requirements. These solutions allow partners to offer accommodation to their " +
      "students directly through their own platforms or digital journey.",
  },
];

const Faq = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal as="h2" className={styles.heading}>
          Frequently Asked Questions (FAQs)
        </Reveal>

        <Reveal className={styles.list} delay={100}>
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`} key={item.question}>
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
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default wrapperHOC(Faq, {
  componentName: "Faq-PartnerWithUs",
  showForChina: true,
});
