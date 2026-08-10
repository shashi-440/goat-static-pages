import { useState } from "react";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Faq.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * FAQ accordion — Figma node 2141:4120. The first item renders open, as in the
 * design; one item open at a time.
 *
 * NOTE: only the first answer exists in the Figma file. The remaining three are
 * written from the copy elsewhere on this page (25+ countries, 16,000+
 * properties, 1M+ beds, the dedicated dashboard) and should be replaced with the
 * partnerships team's approved wording before this goes live.
 */
const ITEMS = [
  {
    question: "How long after filling the form will someone from the team contact me?",
    answer: "After filling the contact form, you will be contacted within 24 hours.",
  },
  {
    question: "How extensive is ambers reach?",
    answer:
      "amber covers 25+ countries and 240 cities, with 16,000+ properties and over a million beds to choose from. Around 300,000 students book through us every year.",
  },
  {
    question: "What is a dashboard?",
    answer:
      "Your dashboard is the partner portal we set up for you. It holds every lead you have sent us, the listings in your portfolio, live availability, and the status of each booking and payout.",
  },
  {
    question: "How to track your leads?",
    answer:
      "Every student who comes through your affiliate link appears in your dashboard with their status, destination city and the team member handling them, so you can follow a lead from enquiry to confirmed booking.",
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
