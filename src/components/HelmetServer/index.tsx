import { Helmet } from "react-helmet";

/**
 * Verbatim port of amber-user-website's HelmetServer.
 *
 * Renders its children through Helmet on the server only. renderHtml emits
 * `head.script.toString()` at the end of <body>, so JSON-LD passed through here is
 * hoisted out of its component and collected there — which is why the footer's
 * per-link SiteNavigationElement schema appears once, at the bottom of the
 * document, rather than inline beside each link.
 */
const HelmetServer = ({ children }: any) => (!__CLIENT__ ? <Helmet>{children}</Helmet> : <></>);

export default HelmetServer;
