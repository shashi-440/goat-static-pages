import { ComponentType } from "react";
import ErrorBoundary from "@Components/ErrorBoundary";

interface WrapperOptions {
  componentName?: string;
  showForChina?: boolean;
  showForWhitelabel?: boolean;
  showForApp?: boolean;
  showForMiniProgram?: boolean;
  [key: string]: unknown;
}

/**
 * Stub of amber-user-website's utils/wrapperHOC.
 *
 * The real HOC gates a component on the China / whitelabel / native-app /
 * mini-program build variants and wraps it in an ErrorBoundary. This sandbox
 * only ever builds the global desktop variant, so every gate resolves to
 * "visible" and all that remains is the ErrorBoundary.
 *
 * The signature is kept identical on purpose — that is what lets AboutUsV2.tsx
 * and its components stay byte-identical to the originals and paste straight
 * back into amber-user-website.
 */
const wrapperHOC = <P extends object>(
  WrappedComponent: ComponentType<P>,
  _options: WrapperOptions = {},
): ((props: P) => JSX.Element) => {
  const Wrapped = (props: P): JSX.Element => (
    <ErrorBoundary>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  Wrapped.displayName = `wrapperHOC(${
    _options.componentName || WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return Wrapped;
};

export default wrapperHOC;
