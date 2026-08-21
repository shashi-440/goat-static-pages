import { Helmet } from "react-helmet";
import CustomLink from "@Components/CustomLink";
import styles from "./Index.module.scss";

/**
 * Directory of the pages in this sandbox. Add a row here whenever a new page is
 * ported so there is one place to click through them all during review.
 *
 * Name only — no path, no build note, and no version suffix in the label. The URLs
 * still carry their -v2 / -alt suffixes (they are what the routes are registered
 * under), but those belong in the address bar, not in a reviewer's list.
 */
const PAGES = [
  { path: "/list-with-us", title: "List With Us" },
  { path: "/partner-with-us", title: "Partner With Us" },
  { path: "/about-us-v2", title: "About Us" },
  { path: "/how-it-works-v2", title: "How It Works" },
  { path: "/career-v2", title: "Careers" },
  { path: "/scholarship-v2", title: "amberscholar" },
  { path: "/group-booking-v2-alt", title: "Group Booking" },
  { path: "/contact-us-v2-card", title: "Contact Us" },
  { path: "/privacy-v2", title: "Privacy Policy" },
  { path: "/terms-v2", title: "Terms and Conditions" },
];

const Index = (): JSX.Element => (
  <div className={styles.page}>
    <Helmet title="Pages" />

    <div className={styles.inner}>
      <h1 className={styles.heading}>Pages</h1>

      <ul className={styles.list}>
        {PAGES.map((page) => (
          <li key={page.path}>
            <CustomLink href={page.path} className={styles.link}>
              <span className={styles.title}>{page.title}</span>
              {/* Chevron, drawn in CSS so the tile carries no asset. Slides on
                  hover to signal the row is the thing you click, not just a label. */}
              <span className={styles.arrow} aria-hidden="true" />
            </CustomLink>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default Index;
