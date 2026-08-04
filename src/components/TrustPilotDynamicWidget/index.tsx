import { useRef } from "react";
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
 * Identical DOM, lazy-load behaviour and data-* attributes — the widget is a real
 * third-party embed here, so the live rating still renders. The only change is
 * dropping the Redux `nonce` (this sandbox sets no CSP), so the injected script
 * tag carries no nonce attribute.
 */
const TrustPilotDynamicWidget = ({
  width = "240px",
  height = "116px",
  templateId = "53aa8807dec7e10d38f59f32",
  margin = "0 0 -4px 0",
}): JSX.Element => {
  const containerRef = useRef(null);

  const loadScript = () => {
    if (window.Trustpilot) {
      window?.Trustpilot?.loadFromElement(containerRef.current, true);
      return;
    }
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
    script.onload = () => {
      window?.Trustpilot?.loadFromElement(containerRef.current, true);
    };
    document.body.appendChild(script);
  };

  useLazyCallback(loadScript, { rootMargin: "300px 0px 300px 0px" }, containerRef, []);

  return (
    <div className={styles.container} style={{ margin, width, height }}>
      <div
        ref={containerRef}
        className="trustpilot-widget"
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
