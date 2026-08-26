import Image from "@Components/Image";
import styles from "./Ticker.module.scss";
import fresh from "../../assets/logos/fresh.png";
import iqStudent from "../../assets/logos/iq-student.png";
import homesForStudents from "../../assets/logos/homes-for-students.png";
import uniteStudents from "../../assets/logos/unite-students.png";
import crmStudents from "../../assets/logos/crm-students.png";
import scape from "../../assets/logos/scape.png";
import studentRoost from "../../assets/logos/student-roost.png";
import varsity from "../../assets/logos/varsity.png";
import wrapperHOC from "@Utils/wrapperHOC";

/**
 * Partner logo wall — Figma node 2483:9993. Two rows of four, each row spread
 * across the hero's 1200px column. Widths come from the node so the logos keep
 * their designed optical sizes rather than one blanket height.
 *
 * Rendered by Hero — in this version of the design the wall sits inside the hero
 * section, not in a band of its own.
 */
export type OperatorLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * The operator marks, LARGEST NAME FIRST.
 *
 * Exported because this wall is not the only place they are drawn any more: "Who we work
 * with" (`Audience`) ends on a strip of them, the way Partner With Us's equivalent section
 * does. This stays the single source of truth — the two-row wall below is one arrangement
 * of the same list, not a second copy of it.
 *
 * ⚠️  THE ORDER IS MEANT. It runs biggest and best-known operator downward rather than
 * following the node's layout, because the strip's job is to be recognised: whoever is
 * reading has to hit a name they know in the first two marks or the wall is just texture.
 * The old row order opened on Fresh and buried Unite at the end of row one.
 */
export const OPERATOR_LOGOS: OperatorLogo[] = [
  { src: uniteStudents, alt: "Unite Students", width: 75, height: 32 },
  { src: iqStudent, alt: "iQ Student Accommodation", width: 110, height: 36 },
  { src: homesForStudents, alt: "Homes for Students", width: 83, height: 36 },
  { src: studentRoost, alt: "Student Roost", width: 104, height: 36 },
  { src: fresh, alt: "Fresh", width: 69, height: 32 },
  { src: scape, alt: "Scape", width: 86, height: 36 },
  { src: crmStudents, alt: "CRM Students", width: 99, height: 36 },
  { src: varsity, alt: "Varsity", width: 67, height: 32 },
];

/** The wall's two rows of four, taken off the one ordered list above. */
const ROWS = [OPERATOR_LOGOS.slice(0, 4), OPERATOR_LOGOS.slice(4)];

const Ticker = () => (
  <div className={styles.wall}>
    {ROWS.map((row, rowIndex) => (
      // eslint-disable-next-line react/no-array-index-key
      <div className={styles.row} key={rowIndex}>
        {row.map((logo) => (
          <div className={styles.cell} key={logo.alt}>
            {/* isNotLazy: the shared Image otherwise fades and scales each logo
                in from opacity 0 / scale(0.9). A partner wall should read as one
                steady row, not eight things popping in. */}
            <Image
              src={logo.src}
              alt={logo.alt}
              className={styles.logo}
              width={logo.width}
              height={logo.height}
              style={{ width: logo.width, height: logo.height }}
              isNotLazy
            />
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default wrapperHOC(Ticker, {
  componentName: "Ticker-ListWithUs",
  showForChina: true,
});
