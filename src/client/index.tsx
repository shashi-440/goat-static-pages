import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { RouteConfig, renderRoutes } from "react-router-config";
import { loadableReady } from "@loadable/component";

import routes from "../routes";

/**
 * Client entry. Mirrors amber-user-website's src/client/indexDesktop.tsx minus the
 * Redux Provider and connected-react-router — this sandbox holds no store, so a
 * plain BrowserRouter is enough. loadableReady still gates hydration so the
 * split chunks resolve before React attaches, exactly as upstream.
 */
const render = (Routes: RouteConfig[]) =>
  ReactDOM.hydrate(
    <BrowserRouter>{renderRoutes(Routes)}</BrowserRouter>,
    document.getElementById("react-view"),
  );

loadableReady(() => render(routes as RouteConfig[]));

// Workaround for Webpack v5 + HMR:
// https://github.com/webpack-contrib/webpack-hot-middleware/issues/390
// @ts-expect-error module.hot is injected by the dev middleware
if (module.hot) module.hot.accept();
