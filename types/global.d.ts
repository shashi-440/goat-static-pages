// Ambient declarations mirroring amber-user-website's, so ported pages typecheck
// against the same globals and asset-import shapes.

declare const __CLIENT__: boolean;
declare const __SERVER__: boolean;
declare const __DEV__: boolean;
declare const __DESKTOP__: boolean;
declare const __ASSETS_BASE_URL__: string;

declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

/**
 * Mapbox GL JS, injected from api.mapbox.com at runtime rather than bundled.
 *
 * Declared exactly as amber-user-website declares it (`declare const mapboxgl:
 * any`) so a component using the globe typechecks identically in both repos.
 * Typing it properly would mean depending on @types/mapbox-gl, which the main app
 * does not have — and a mismatch there is the kind of thing that breaks the
 * paste-back property.
 */
declare const mapboxgl: any;
