import { Helmet } from "react-helmet";
import CustomLink from "@Components/CustomLink";
import styles from "./Index.module.scss";

/**
 * Directory of the v2 pages in this sandbox. Add a row here whenever a new page
 * is ported so there is one place to click through them all during review.
 */
const PAGES = [
  { path: "/about-us-v2", title: "About Us", note: "ported from about-us-page-revamp" },
  { path: "/contact-us-v2", title: "Contact Us", note: "built in this sandbox" },
  { path: "/how-it-works-v2", title: "How It Works", note: "hero only — sections in progress" },
  { path: "/career-v2", title: "Careers", note: "built from the Career Page Cleanup Figma" },
];

const Index = (): JSX.Element => (
  <div className={styles.page}>
    <Helmet title="v2 pages" />
    <h1 className={styles.heading}>v2 static pages</h1>
    <ul className={styles.list}>
      {PAGES.map((page) => (
        <li key={page.path}>
          <CustomLink href={page.path} className={styles.link}>
            <span className={styles.title}>{page.title}</span>
            <span className={styles.path}>{page.path}</span>
          </CustomLink>
          <span className={styles.note}>{page.note}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Index;
