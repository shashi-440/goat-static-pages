import { FC } from "react";
import LazyImage from "@Components/Image";
import getImagePath from "@Utils/getImagePath";
import HelmetServer from "@Components/HelmetServer";
import getSiteNavSchema from "../../util";
import classes from "./FollowUs.module.scss";
import content from "../../footerContent.json";

interface FollowUsProps {
  isMobile?: boolean;
  /**
   * Emit the per-network JSON-LD. Footer renders FollowUs twice (desktop layout and
   * the stacked below-1200px one, both always in the DOM), so the second copy passes
   * false to keep each schema block in the page once.
   */
  withSchema?: boolean;
}

/**
 * Desktop branch of amber-user-website's footer FollowUs, driven by
 * footerContent.json instead of seven hand-repeated blocks. Same class names,
 * same data-testids, same per-network JSON-LD.
 *
 * Difference from the original: navigation uses a plain <a> rather than the
 * app's customWindowOpen bridge (which routes through the native webview shell).
 */
const FollowUs: FC<FollowUsProps> = ({ withSchema = true }) => (
  <div className={classes.outerDiv}>
    <div className={classes.label}>{content.followUs.label}:</div>

    <div className={classes.innerDiv}>
      {content.followUs.items.map((item) => (
        <div className={classes.container} data-testid={item.testId} key={item.name}>
          {withSchema && (
            <HelmetServer>
              <script type="application/ld+json" suppressHydrationWarning>
                {getSiteNavSchema(item.name, item.href)}
              </script>
            </HelmetServer>
          )}
          <a href={item.href} target="_blank" rel="noreferrer" aria-label={item.name}>
            <LazyImage
              src={getImagePath(item.src)}
              alt={item.alt}
              className={classes.mediaImg}
              width="22px"
              height="22px"
            />
          </a>
        </div>
      ))}
    </div>
  </div>
);

export default FollowUs;
