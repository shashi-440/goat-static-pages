import { useState } from "react";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Faq.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * FAQ accordion — Figma node 2456:6682. The first item renders open, as in the
 * design; one item open at a time.
 *
 * NOTE: only the first answer exists in the Figma file. The remaining four are
 * written from the copy elsewhere on this page (zero listing fees, 24-hour
 * outreach, dedicated account management) and should be replaced with the
 * partnership team's approved wording before this goes live.
 */
const ITEMS = [
  {
    question: "Can I list with amber?",
    answer:
      "Yes — from a single room to a full portfolio. Fill out a quick contact form with your details and property info and our team will reach out within 24 hours. There are zero listing fees.",
  },
  {
    question: "How will my account be managed?",
    answer:
      "Every partner gets a named account manager. They handle onboarding, keep your listings and availability current, and share demand and pricing insights for your market.",
  },
  {
    question: "When will my property be visible on the website?",
    answer:
      "Once we have your offerings, terms and media, your listing is reviewed and published. Most properties go live within a few working days of onboarding being finalised.",
  },
  {
    question: "What is the commission structure?",
    answer:
      "There is nothing to pay to list. amber is paid a commission on confirmed bookings only, agreed with you on the onboarding call before anything goes live.",
  },
  {
    question: "What property photos and videos should I share with amber?",
    answer:
      "High-resolution photos of every room type, the shared and study spaces, the exterior and the surrounding area work best, plus a walkthrough video if you have one.",
  },
];

const Faq = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.headingBlock}>
          <h2 className={styles.heading}>Frequently asked questions</h2>
          <p className={styles.subheading}>
            Everything partners ask before they list. If it is not here, we will answer it on the
            call.
          </p>
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
  componentName: "Faq-ListWithUs",
  showForChina: true,
});
