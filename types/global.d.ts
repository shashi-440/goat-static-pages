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
