import config from "@Config/index";

/**
 * Minimal mirror of amber-user-website's utils/getImagePath.
 *
 * The original rewrites a long list of legacy S3/imgix/webflow hostnames onto the
 * configured CDN and then appends imgix transform params. This sandbox only ever
 * feeds it already-correct CDN URLs, so it keeps the two rewrites that matter for
 * the footer assets plus the same `auto=format&trim=auto` params, which is what
 * makes the emitted URLs byte-match production.
 */
const getImagePath = (imagePath: string, params: Record<string, string> = {}): string => {
  if (!imagePath) return "";

  let url = imagePath
    .replace("https://prod-static-assets.amberstudent.com", config.IMAGE_STATIC_URL)
    .replace("https://prod-assets.amberstudent.com", config.IMAGE_ASSETS_URL);

  const query: Record<string, string> = { auto: "format", trim: "auto", ...params };

  const [base, existing] = url.split("?");
  const search = new URLSearchParams(existing || "");
  Object.entries(query).forEach(([k, v]) => search.set(k, v));

  url = `${base}?${search.toString()}`;
  return url;
};

export default getImagePath;
