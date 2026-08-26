import { useCallback } from "react";
import CustomLink from "@Components/CustomLink";
import wrapperHOC from "@Utils/wrapperHOC";
import styles from "./RolesButton.module.scss";

interface RolesButtonProps {
  /**
   * `primary` — the hero's rounded pink pill, matching the header CTA.
   * `dark` — the Globe section's squarer dark button (Figma 2859:18004).
   * `raised` — the older dark extruded pill (Figma 2671:15547), kept for v3.
   * `light` — the small light pill on the Benefits band (Figma 2665:13587).
   * `solid` — the white pill matching AboutUsV2's CrewCTA button.
   */
  variant?: "primary" | "dark" | "raised" | "light" | "solid";
}

/**
 * "Explore Open Roles" CTA. Appears four times across the page in two visual
 * treatments, so it lives here once rather than being restyled per section.
 *
 * On hover a faint highlight follows the cursor across the face of the button.
 * The pointer position is written to CSS custom properties rather than React
 * state — a setState per mousemove would re-render the tree ~60x a second, and
 * the highlight is drawn entirely by CSS from those two values.
 */
const RolesButton = ({ variant = "light" }: RolesButtonProps) => {
  // `currentTarget` rather than a ref: CustomLink keeps its own internal ref and
  // is not wrapped in forwardRef, so a ref passed in here never reaches the DOM
  // node. The event already carries the element the handler is bound to.
  const handleMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);

  // Park the highlight in the middle on exit, so the next hover fades up from
  // the centre rather than snapping from wherever the cursor last left.
  const handleLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  }, []);

  return (
    <CustomLink
      to="#open-roles"
      className={`${styles.button} ${styles[variant]}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <span className={styles.label}>Explore Open Roles</span>
    </CustomLink>
  );
};

export default wrapperHOC(RolesButton, {
  componentName: "RolesButton-CareerFinal",
  showForChina: true,
});
