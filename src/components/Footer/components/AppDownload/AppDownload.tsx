import formatClassNames from "@Utils/clientUtils/stringUtility/formatClassNames";
import LazyImage from "@Components/Image";
import CustomLink from "@Components/CustomLink";
import getImagePath from "@Utils/getImagePath";
import classes from "./AppDownload.module.scss";
import content from "../../footerContent.json";

/**
 * Global-desktop branch of amber-user-website's footer AppDownload.
 * The China branch and the useIsApp early-return are dropped — neither variant
 * is built in this sandbox. Markup and class names are otherwise unchanged.
 */
const AppDownload = ({ isDesktop = false }): JSX.Element => {
  const { getAppLabel, paymentOptionsLabel, playStore, appStore, paymentPartners } =
    content.appDownload;

  return (
    <div className={formatClassNames(classes.outerContainer, isDesktop && classes.desktop)}>
      <div className={classes.container}>
        <div data-testid="footer-get-amber-app" className={classes.headerText}>
          {getAppLabel}
        </div>
        <div className={classes.imageWrapper}>
          <CustomLink
            href={playStore.href}
            target="_blank"
            rel="noreferrer"
            isExternal
            dataTestId={playStore.testId}
          >
            <LazyImage
              dataTestId="Play-store-Image"
              src={getImagePath(playStore.src)}
              alt={playStore.alt}
              className={classes.img}
              height={playStore.height}
              width={playStore.width}
            />
          </CustomLink>
          <CustomLink
            href={appStore.href}
            target="_blank"
            rel="noreferrer"
            isExternal
            dataTestId={appStore.testId}
          >
            <LazyImage
              dataTestId="App-store-Image"
              src={getImagePath(appStore.src)}
              alt={appStore.alt}
              className={classes.img}
              height={appStore.height}
              width={appStore.width}
            />
          </CustomLink>
        </div>
      </div>

      <div className={classes.divider} />

      <div className={classes.container}>
        <div data-testid="footer-payment-options" className={classes.headerText}>
          {paymentOptionsLabel}
        </div>
        <div>
          <LazyImage
            dataTestId="footer-payment-options-image"
            src={getImagePath(paymentPartners.src)}
            alt={paymentPartners.alt}
            className={classes.imgPartners}
            height={paymentPartners.height}
            width={paymentPartners.width}
          />
        </div>
      </div>
    </div>
  );
};

export default AppDownload;
