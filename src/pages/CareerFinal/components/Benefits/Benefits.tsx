import wrapperHOC from "@Utils/wrapperHOC";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Benefits.module.scss";

interface Benefit {
  title: string;
  body: string;
}

// Copy verbatim from the reference design.
const BENEFITS: Benefit[] = [
  {
    title: "Health & Wellbeing",
    body:
      "Medical, dental, and vision insurance for you and your dependents, with premiums covered " +
      "in most cases. Mental health support is available through therapy, coaching, medication " +
      "management, and EAP services. Gender-affirming care funds are also available on top of " +
      "our inclusive medical insurance.",
  },
  {
    title: "Everyday Life",
    body:
      "A monthly lifestyle stipend to spend on what matters to you, commuter funds for your trip " +
      "to the office, phone stipend, lunch, snacks, and a Notion x Art Pass to visit museums " +
      "around the world.",
  },
  {
    title: "Family Support",
    body:
      "Paid parental leave for biological, adoptive, and foster parents. Plus Carrot funds for " +
      "family-forming services, fertility treatments, and support for your path to parenthood.",
  },
  {
    title: "Financial Future",
    body:
      "Retirement and pension plans with a company match, plus resources to help you navigate " +
      "equity, financial planning, and tax considerations.",
  },
  {
    title: "Time Away",
    body: "Flexible paid vacation, holidays, and a company-wide year-end closure.",
  },
  {
    title: "Learning & Growth",
    body: "Funds for courses, training, and subscriptions to keep growing in your role.",
  },
];

// Gap between each card's entrance, in ms.
const STAGGER = 80;

/**
 * "Benefits" — a 3 x 2 card grid.
 *
 * Replaces the previous photo-plus-accordion treatment: this is a plain,
 * scannable grid, which suits six items of very uneven length better than an
 * accordion did. Nothing is hidden behind an interaction, so the whole offer
 * reads at a glance.
 *
 * Dark band, so it carries data-nav-theme="dark": the shared Navbar watches for
 * that attribute and switches to its white logo and light links while the
 * section is behind the header line.
 */
const Benefits = () => (
  <section className={styles.section} data-nav-theme="dark">
    <div className={styles.inner}>
      <Reveal className={styles.top}>
        <h2 className={styles.heading}>Benefits</h2>
        <p className={styles.lede}>
          We want people to do their best work here, which means taking care of them in the moments
          that matter. Here&rsquo;s what that looks like.
        </p>
      </Reveal>

      <ul className={styles.grid}>
        {BENEFITS.map((benefit, i) => (
          <Reveal as="li" key={benefit.title} className={styles.card} delay={i * STAGGER}>
            <h3 className={styles.cardTitle}>{benefit.title}</h3>
            <p className={styles.cardBody}>{benefit.body}</p>
          </Reveal>
        ))}
      </ul>
    </div>
  </section>
);

export default wrapperHOC(Benefits, {
  componentName: "Benefits-CareerFinal",
  showForChina: true,
});
