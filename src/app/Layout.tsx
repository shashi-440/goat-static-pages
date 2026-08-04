import { FC } from "react";
import { renderRoutes, RouteConfigComponentProps } from "react-router-config";

import "normalize.css/normalize.css";
import "./app.module.scss";
import "./global.scss";

/**
 * Root layout. Its only job is to pull in the same three global stylesheets the
 * page inherits inside amber-user-website — normalize.css, the app-wide element
 * reset, and global.scss — and then render the matched route.
 *
 * Without these the ported pages reflow: the reset zeroes margins/padding on every
 * element and sets the box model the v2 stylesheets were designed against.
 */
const Layout: FC<RouteConfigComponentProps> = ({ route }) => (
  <>{renderRoutes(route?.routes)}</>
);

export default Layout;
