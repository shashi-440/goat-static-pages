// @loadable/webpack-plugin ships no type declarations and has no @types package.
// The main app hits the same gap; declaring it here keeps `tsc --noEmit` clean.
declare module "@loadable/webpack-plugin" {
  const LoadablePlugin: any;
  export default LoadablePlugin;
}
