import { useState } from "react";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Faq.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

const ITEMS = [
  {
    question: "Who can apply for amberscholar?",
    answer:
      "Any student currently enrolled at, or holding an offer from, a university anywhere in the world. You do not need to be an amber customer to apply.",
  },
  {
    question: "What does it cost to apply?",
    answer:
      "Nothing. There is no application fee at any stage, and amber never asks for payment to process or shortlist an application.",
  },
  {
    question: "How are applications judged?",
    answer:
      "A panel reads every submission and scores it on the clarity of the goal, the plan behind it, and what the funding would unlock. Grades are not the deciding factor.",
  },
  {
    question: "How and when do I get paid?",
    answer:
      "Winners are announced at the end of each edition and paid directly by bank transfer, usually within three weeks of the announcement.",
  },
  {
    question: "Can I apply more than once?",
    answer:
      "Yes. If you are not selected in one edition you are welcome to apply again in the next, and previous applicants are not penalised.",
  },
];

/**
 * FAQ accordion — Figma node 2102:3548. The first item renders open, as in the
 * design. One item open at a time.
 */
const Faq = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.headingBlock}>
          <h2 className={styles.heading}>Frequently asked questions</h2>
          <p className={styles.subheading}>
            Everything students ask before they apply to the amber Dream Fund.
          </p>
        </Reveal>

        <Reveal className={styles.list} delay={100}>
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.question} className={styles.item}>
                <button
                  type="button"
                  className={styles.trigger}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span className={styles.question}>{item.question}</span>
                  {/* Rotates to an × when open. */}
                  <span
                    className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ""}`}
                    aria-hidden="true"
                  />
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
  componentName: "Faq-ScholarshipV2",
  showForChina: true,
});
