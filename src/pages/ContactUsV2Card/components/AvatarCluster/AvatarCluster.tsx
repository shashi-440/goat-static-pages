import Image from "@Components/Image";
import styles from "./AvatarCluster.module.scss";
import support1 from "../../assets/support-1.jpg";
import support2 from "../../assets/support-2.jpg";
import support3 from "../../assets/support-3.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

const FACES = [support1, support2, support3];

/**
 * The three overlapping support faces that sit inline in the hero headline
 * (Figma node 2047:974), with the green online-presence dot on the last one.
 *
 * On hover the stack fans apart — the Contact Us equivalent of the About Us
 * hero stamp's hover, so the headline has something to play with.
 */
const AvatarCluster = () => (
  <span className={styles.cluster}>
    {FACES.map((face, i) => (
      <span
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        className={styles.avatar}
      >
        <Image
          src={face}
          alt=""
          className={styles.photo}
          width={44}
          height={44}
          isEagerLoad
        />
        {/* Online dot rides the last face, per the design. */}
        {i === FACES.length - 1 ? (
          <span className={styles.presence} aria-hidden="true" />
        ) : null}
      </span>
    ))}
  </span>
);

export default wrapperHOC(AvatarCluster, {
  componentName: "AvatarCluster-ContactUsV2Card",
  showForChina: true,
});
