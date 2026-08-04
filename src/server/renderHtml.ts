import { ChunkExtractor } from "@loadable/server";
import { minify } from "html-minifier";
import { HelmetData } from "react-helmet";

/**
 * Trimmed mirror of amber-user-website's src/server/renderHtml.
 *
 * Keeps the parts that affect how a page renders — doctype, charset, theme-color,
 * Helmet head injection, the #react-view mount node, and the loadable link/style/
 * script tag assembly (inline <style> when a CSS string is available, <link> tags
 * otherwise). Dropped: the Baidu/360/Sogou/Shenma China verification metas, the
 * whitelabel font-link block, and the serialised Redux __INITIAL_STATE__, none of
 * which apply to a store-less single-locale sandbox.
 */
export default (
  head: HelmetData,
  extractor: ChunkExtractor,
  htmlContent: string,
  inlineStyle: string,
  isDev: boolean,
): string => {
  const html = `
    <!doctype html>
    <html lang="en" ${head.htmlAttributes.toString()}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000" />

        ${head.title.toString()}
        ${head.base.toString()}
        ${head.meta.toString()}
        ${head.link.toString()}

        <!-- Insert bundled styles into <link> tag -->
        ${
          inlineStyle
            ? `
          ${extractor
            .getLinkElements()
            .map((it: any) => {
              if (it.props.as === "script") {
                const attr = Object.keys(it.props).reduce(
                  (res, key) => `${res}${key}="${it.props[key]}" `,
                  "",
                );
                return `<${it.type} ${attr}>`;
              }
              return "";
            })
            .join("\n")}
          <style>${inlineStyle}</style>
        `
            : `
          ${extractor.getLinkTags()}
          ${extractor.getStyleTags()}
        `
        }
      </head>
      <body>
        <!-- Insert the router, which passed from server-side -->
        <div id="react-view">${htmlContent}</div>

        <!-- Insert bundled scripts into <script> tag -->
        ${extractor.getScriptTags()}
        ${head.script.toString()}
      </body>
    </html>
  `;

  const minifyConfig = {
    collapseWhitespace: true,
    removeComments: true,
    trimCustomFragments: true,
    minifyCSS: true,
    minifyJS: true,
    minifyURLs: true,
    continueOnParseError: true,
  };

  return isDev ? html : minify(html, minifyConfig);
};
