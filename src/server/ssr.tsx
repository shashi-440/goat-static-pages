import path from "path";
import { Request, Response } from "express";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { renderRoutes, matchRoutes, RouteConfig } from "react-router-config";
import { Helmet } from "react-helmet";
import { ChunkExtractor } from "@loadable/server";

import routes from "../routes";
import renderHtml from "./renderHtml";

const isDev = process.env.NODE_ENV === "development";

/**
 * SSR handler, following the same sequence as amber-user-website's src/server/ssr:
 * build a ChunkExtractor from the loadable stats file, collect the tree, render it
 * to a string, read Helmet AFTER renderToString, pull the CSS string out of the
 * extractor, then hand everything to renderHtml.
 *
 * The upstream version also dispatches per-route `loadData` thunks into a fresh
 * Redux store, resolves the locale via Tolgee, and consults a Redis cache. None of
 * that applies here — static pages have nothing to fetch — so this is the same
 * pipeline with the data stage removed.
 */
export default async (req: Request, res: Response): Promise<void> => {
  try {
    const matched = matchRoutes(routes as RouteConfig[], req.path);
    // Only the Layout matched → no page route for this path.
    const isNotFound = matched.length <= 1;

    const statsFile = path.resolve(process.cwd(), "public/loadable-stats-desktop.json");
    const extractor = new ChunkExtractor({ statsFile });

    const context: { url?: string; statusCode?: number } = {};

    const App = extractor.collectChunks(
      <StaticRouter location={req.url} context={context}>
        {renderRoutes(routes as RouteConfig[])}
      </StaticRouter>,
    );

    const htmlContent = renderToString(App);

    // Helmet must be read after renderToString.
    const head = Helmet.renderStatic();

    if (context.url) {
      res.redirect(302, context.url);
      return;
    }

    let inlineStyle = "";
    try {
      inlineStyle = await extractor.getCssString();
    } catch {
      inlineStyle = "";
    }

    const response = renderHtml(head, extractor, htmlContent, inlineStyle, isDev);

    res.status(isNotFound ? 404 : 200).send(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[ssr] render failed:", error);
    res.status(500).send(`<pre>${(error as Error)?.stack || String(error)}</pre>`);
  }
};
