import { useEffect, useRef, useState } from "react";
import CustomLink from "@Components/CustomLink";
import { useLazyCallback } from "hooks/useLazyCallback";
import styles from "./TrustPilotDynamicWidget.module.scss";

declare global {
  interface Window {
    Trustpilot?: { loadFromElement: (el: Element | null, force?: boolean) => void };
  }
}

/**
 * Port of amber-user-website's TrustPilotDynamicWidget.
 *
 * Same DOM, lazy-load behaviour and data-* attributes — the widget is a real
 * third-party embed here, so the live rating still renders. Differences:
 *
 *   - No Redux `nonce` (this sandbox sets no CSP), so the injected script tag
 *     carries no nonce attribute.
 *   - The `trustpilot-widget` class is added only once this copy scrolls into view.
 *     Trustpilot's bootstrap initialises every `.trustpilot-widget` in the page when
 *     it loads, hidden or not, and the footer renders two layouts (one hidden by
 *     CSS). A display:none copy never intersects, so it stays unclassed and costs
 *     no iframe until a resize makes it visible, at which point it loads itself.
 *   - Concurrent copies share one bootstrap <script> rather than each appending
 *     their own, and a copy that has unmounted is never passed to loadFromElement.
 */
const BOOTSTRAP_SRC = "//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";

const TrustPilotDynamicWidget = ({
  width = "240px",
  height = "116px",
  templateId = "53aa8807dec7e10d38f59f32",
  margin = "0 0 -4px 0",
}): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Set when this copy first scrolls near the viewport; until then it has no
  // `trustpilot-widget` class, so the bootstrap's page-wide scan skips it.
  const [active, setActive] = useState(false);

  useLazyCallback(() => setActive(true), { rootMargin: "300px 0px 300px 0px" }, containerRef, []);

  // Runs after the render that added the class, so the element is ready to load.
  useEffect(() => {
    if (!active) return undefined;
    const load = () => {
      if (containerRef.current) window.Trustpilot?.loadFromElement(containerRef.current, true);
    };
    if (window.Trustpilot) {
      load();
      return undefined;
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${BOOTSTRAP_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = BOOTSTRAP_SRC;
      document.body.appendChild(script);
    }
    script.addEventListener("load", load);
    const pending = script;
    return () => pending.removeEventListener("load", load);
  }, [active]);

  return (
    <div className={styles.container} style={{ margin, width, height }}>
      <div
        ref={containerRef}
        className={active ? "trustpilot-widget" : undefined}
        data-locale="en-GB"
        data-template-id={templateId}
        data-businessunit-id="579c87e70000ff000592e82f"
        data-style-height={height}
        data-style-width={width}
        data-testid="Trustpilot-logo"
      >
        <CustomLink
          rel="noreferrer"
          href="https://uk.trustpilot.com/review/amberstudent.com"
          target="_blank"
          isExternal
        >
          {" "}
        </CustomLink>
      </div>
    </div>
  );
};

export default TrustPilotDynamicWidget;
