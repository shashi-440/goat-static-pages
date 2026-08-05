import CustomLink from "@Components/CustomLink";
import wrapperHOC from "@Utils/wrapperHOC";
import styles from "./RolesButton.module.scss";

interface RolesButtonProps {
  /**
   * `primary` — the hero's rounded pink pill, matching the header CTA.
   * `raised` — the older dark extruded pill (Figma 2671:15547), kept for v3.
   * `light` — the small light pill on the Benefits band (Figma 2665:13587).
   * `solid` — the white pill matching AboutUsV2's CrewCTA button.
   */
  variant?: "primary" | "raised" | "light" | "solid";
}

/**
 * "Explore Open Roles" CTA. Appears four times across the page in two visual
 * treatments, so it lives here once rather than being restyled per section.
 */
const RolesButton = ({ variant = "light" }: RolesButtonProps) => (
  <CustomLink to="#open-roles" className={`${styles.button} ${styles[variant]}`}>
    <span className={styles.label}>Explore Open Roles</span>
  </CustomLink>
);

export default wrapperHOC(RolesButton, {
  componentName: "RolesButton-CareerV2",
  showForChina: true,
});
