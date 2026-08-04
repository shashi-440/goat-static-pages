import styles from "./FullPageLoader.module.scss";

/**
 * Loadable fallback. amber-user-website's version renders a Lottie animation
 * behind wrapperHOC; that pulls in the app shell, so this sandbox uses a plain
 * CSS spinner with the same full-viewport footprint.
 */
const FullPageLoader = (): JSX.Element => (
  <div className={styles.wrapper} data-testid="full-page-loader">
    <div className={styles.spinner} />
  </div>
);

export default FullPageLoader;
