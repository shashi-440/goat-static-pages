/**
 * Compatibility shim.
 *
 * Pages ported from amber-user-website import the footer as
 * `@Components/FooterV2/FooterDesktop`. Re-exporting the static Footer from that
 * exact path is what lets AboutUsV2.tsx — and every future ported v2 page — stay
 * byte-identical to its upstream original, so files can move in either direction
 * without an edit.
 *
 * The static footer is a WIP, so it is wrapped in a blur here as a visual
 * "not for review" marker. Doing it in this shim rather than in the pages means
 * no page file is touched (AboutUsV2 has to stay byte-identical to upstream) and
 * the blur can never travel upstream attached to a page. To drop it once the
 * footer is finished, delete the wrapper and restore the one-line re-export:
 *
 *   export { default } from "@Components/Footer/Footer";
 */
import Footer from "@Components/Footer/Footer";
import styles from "./FooterDesktop.module.scss";

const FooterDesktop = (): JSX.Element => (
  <div className={styles.wip} data-wip="footer">
    <Footer />
  </div>
);

export default FooterDesktop;
