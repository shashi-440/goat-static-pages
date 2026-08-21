import Image from "@Components/Image";
import Reveal from "../../../AboutUsV2/components/Reveal/Reveal";
import styles from "./Audience.module.scss";
import roomPbsa from "../../assets/room-pbsa.jpg";
import roomLandlord from "../../assets/room-landlord.jpg";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * "Who we work with" — Figma node 2456:6580. A 424px heading column beside two
 * photo tiles, each with its own audience copy underneath.
 */
const TILES = [
  {
    image: roomPbsa,
    alt: "A studio room in a purpose-built student accommodation",
    title: "For PBSA & operators",
    body: "Scale demand across your whole portfolio. Dedicated account management, growth programs and market insights help you fill voids across every asset.",
  },
  {
    image: roomLandlord,
    alt: "A furnished student bedroom in a private let",
    title: "For private landlords",
    body: "From a single room to an entire building — list for free, set your terms on one quick call, and amber handles marketing, enquiries and bookings end to end.",
  },
];

const Audience = () => (
  <section className={styles.section}>
    <div className={styles.row}>
      <Reveal className={styles.heading}>
        <h2 className={styles.title}>Who we work with</h2>
        <p className={styles.subtitle}>
          Built for PBSA operators, private landlords and student housing partners.
        </p>
      </Reveal>

      <div className={styles.tiles}>
        {TILES.map((tile) => (
          <div className={styles.tile} key={tile.title}>
            <div className={styles.imageWrap}>
              {/* isNotLazy so the photo is simply there: the shared Image
                  otherwise fades and scales it in once it loads. At ~80KB
                  each they cost little to load with the page. */}
              <Image
                src={tile.image}
                alt={tile.alt}
                className={styles.image}
                width="100%"
                height="100%"
                isNotLazy
              />
            </div>
            <div className={styles.copy}>
              <h3 className={styles.tileTitle}>{tile.title}</h3>
              <p className={styles.tileBody}>{tile.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default wrapperHOC(Audience, {
  componentName: "Audience-ListWithUs",
  showForChina: true,
});
