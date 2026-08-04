import useIsRedirect from "hooks/useIsRedirect";
import { memo, useMemo } from "react";
// eslint-disable-next-line no-restricted-imports
import { Link, LinkProps } from "react-router-dom";
import { useLanguagePath } from "hooks/useLanguagePath";
import { sendWebViewEvent } from "@Utils/webviewEvents";
import { WEB_VIEW_APP_EVENTS } from "@Utils/webApputils/analyticEvents";

// Custom interface that makes 'to' optional and adds 'href'
interface ICustomLink extends Omit<LinkProps, "to"> {
  to?: LinkProps["to"];
  redirect?: boolean;
  stopLink?: boolean;
  dataTestId?: string;
  target?: string;
  linkRef?: any;
  href?: string;
  rel?: string;
  isExternal?: boolean; // Explicitly mark as external link
  openInExternalBrowserOfApp?: boolean;
}

const CustomLink = ({
  redirect,
  stopLink,
  children,
  dataTestId,
  target,
  linkRef = null,
  href,
  rel,
  isExternal: isExternalProp,
  openInExternalBrowserOfApp = false,
  ...props
}: ICustomLink): JSX.Element => {
  /* eslint-disable react-hooks/exhaustive-deps */
  const { to } = props;
  const isRedirect = useIsRedirect();
  const { getLocalizedPath } = useLanguagePath();
  // Determine the actual link (prefer href over to for compatibility)
  const linkUrl = href || to;

  // Auto-detect external links if not explicitly set
  const isExternal =
    isExternalProp || (typeof linkUrl === "string" && /^https?:\/\//i.test(linkUrl));

  // Hash links (#section) are not external, but should be rendered as <a> tags
  const isHashLink = typeof linkUrl === "string" && linkUrl.startsWith("#");

  // Add language prefix to the path if it's an internal link
  const enhancedTo = useMemo(() => {
    // Don't modify if no link URL
    if (!linkUrl) return linkUrl;

    // Don't modify external or hash links - return as-is
    if (isExternal || isHashLink) return linkUrl;

    // Only add language prefix for internal string links
    if (typeof linkUrl === "string") {
      return getLocalizedPath(linkUrl);
    }

    return linkUrl;
  }, [linkUrl, isExternal, isHashLink, getLocalizedPath]);

  if (stopLink) {
    return (
      <a
        className={props.className}
        href={enhancedTo?.toString()}
        onClick={(e: any) => {
          e.preventDefault();
          e.stopPropagation();
          if (props.onClick) {
            props.onClick(e);
          }
        }}
      >
        {children}
      </a>
    );
  }

  // Use anchor tag for external links, hash links, or when redirect is specified
  if (isExternal || isHashLink || redirect || isRedirect) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      e.stopPropagation();
      sendWebViewEvent(WEB_VIEW_APP_EVENTS.OPEN_EXTERNAL_URL, {
        url: enhancedTo?.toString(),
      });
    };

    return (
      <a
        {...props}
        ref={linkRef}
        href={enhancedTo?.toString()}
        data-testid={dataTestId}
        target={target}
        rel={rel}
        {...(openInExternalBrowserOfApp && { onClick: handleClick })}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      {...props}
      ref={linkRef}
      data-testid={dataTestId}
      to={enhancedTo || "/"}
      target={target || "_self"}
    >
      {children}
    </Link>
  );
};

CustomLink.defaultProps = {
  redirect: false,
  stopLink: false,
};

export default memo(CustomLink);
