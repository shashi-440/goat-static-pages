/**
 * Prerender every route to static HTML.
 *
 * These pages fetch nothing — there are no loadData thunks and no store — so
 * per-request SSR buys nothing over HTML written once at build time. This boots the
 * production server that `yarn build` produced, asks it for each route exactly as a
 * browser would, and writes the response to disk. Reusing the running server rather
 * than importing the SSR bundle means the output cannot drift from what you review
 * locally: same renderer, same Helmet head, same asset URLs.
 *
 * Output layout is what a static host expects with no rewrite rules:
 *
 *   dist/index.html                 → /
 *   dist/about-us-v2/index.html     → /about-us-v2
 *   dist/404.html                   → any unmatched path
 *   dist/assets/…                   → the client bundle and images, copied as-is
 *
 * Usage: node scripts/prerender.mjs   (after `yarn build`)
 */
import { spawn } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");

/**
 * The port is not ours to choose. base.config.ts feeds LOCAL_PORT through
 * DefinePlugin, so `process.env.LOCAL_PORT` is a literal baked into the server
 * bundle at build time and setting it at runtime does nothing. Rather than
 * hardcoding whatever it was built with, we read the address out of the server's
 * own startup line.
 */
const STARTED = /Server started on ([^\s:]+):(\d+)/;

/** Route paths, read from the route table so this cannot fall out of sync with it. */
async function readRoutes() {
  const source = await readFile(path.join(ROOT, "src/routes/index.tsx"), "utf8");
  const paths = [...source.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]);
  if (!paths.length) throw new Error("No routes found in src/routes/index.tsx");
  return [...new Set(paths)];
}

/** Resolve once the server answers /health at `origin`, or give up. */
async function waitForHealth(origin, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${origin}/health`);
      if (res.ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server did not answer /health on ${origin} within ${timeoutMs}ms`);
}

/** The origin the server announces on stdout, or a clear failure. */
function originFrom(server, timeoutMs = 30_000) {
  return new Promise((resolve, reject) => {
    let buffered = "";
    const timer = setTimeout(
      () =>
        reject(
          new Error(
            "The server never printed its address. If it exited immediately, the " +
              "port it was built with is probably already in use — stop `yarn dev` " +
              "and try again.",
          ),
        ),
      timeoutMs,
    );

    server.stdout.on("data", (chunk) => {
      buffered += chunk.toString();
      const match = buffered.match(STARTED);
      if (match) {
        clearTimeout(timer);
        resolve(`http://${match[1] === "0.0.0.0" ? "localhost" : match[1]}:${match[2]}`);
      }
    });
    server.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited with code ${code} before serving anything.`));
    });
  });
}

/** `/` → dist/index.html, `/about-us-v2` → dist/about-us-v2/index.html. */
function outputFileFor(route) {
  if (route === "/") return path.join(DIST, "index.html");
  return path.join(DIST, route.replace(/^\/+/, ""), "index.html");
}

async function main() {
  if (!existsSync(path.join(ROOT, "public/server"))) {
    throw new Error("public/server is missing — run `yarn build` first.");
  }

  const routes = await readRoutes();
  console.info(`Prerendering ${routes.length} routes`);

  const server = spawn("node", ["./public/server"], {
    env: { ...process.env, NODE_ENV: "production", DEVICE: "desktop" },
    stdio: ["ignore", "pipe", "inherit"],
  });

  let failures = 0;
  let ORIGIN;
  try {
    ORIGIN = await originFrom(server);
    await waitForHealth(ORIGIN);
    console.info(`Server up on ${ORIGIN}`);

    for (const route of routes) {
      const res = await fetch(`${ORIGIN}${route}`);
      const html = await res.text();

      // A route that renders to an error page is a build failure, not a page.
      if (res.status !== 200) {
        console.error(`  ✗ ${route} → HTTP ${res.status}`);
        failures += 1;
        continue;
      }
      if (!html.includes('id="react-view"')) {
        console.error(`  ✗ ${route} → no #react-view in the response`);
        failures += 1;
        continue;
      }

      const file = outputFileFor(route);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, html);
      console.info(`  ✓ ${route} → ${path.relative(ROOT, file)} (${Math.round(html.length / 1024)}KB)`);
    }

    // The server's own 404 body, so an unmatched URL gets the site's shell rather
    // than the host's default error page.
    const notFound = await fetch(`${ORIGIN}/__prerender_404__`);
    await writeFile(path.join(DIST, "404.html"), await notFound.text());
    console.info("  ✓ 404 → dist/404.html");
  } finally {
    server.kill("SIGTERM");
  }

  // Everything under /assets: the hashed client bundle, extracted CSS, and every
  // co-located page image CopyRspackPlugin emitted.
  await cp(path.join(ROOT, "public/assets"), path.join(DIST, "assets"), { recursive: true });
  console.info("  ✓ public/assets → dist/assets");

  if (failures) throw new Error(`${failures} route(s) failed to prerender`);
  console.info(`\nDone. ${routes.length} pages in dist/`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
