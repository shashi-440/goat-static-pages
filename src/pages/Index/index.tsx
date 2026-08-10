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
  { path: "/how-it-works-v2", title: "How It Works", note: "hero + three-step progress rail" },
  { path: "/career-v2", title: "Careers", note: "built from the Career Page Cleanup Figma" },
  { path: "/career-v3", title: "Careers v3", note: "new copy deck: origin story, world map, teams" },
  { path: "/scholarship-v2", title: "amberscholar", note: "built from Figma 2095:3370" },
  { path: "/list-with-us", title: "List With Us", note: "built from Figma 2456:6002" },
  { path: "/partner-with-us", title: "Partner With Us", note: "built from Figma 2141:3646" },
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
