import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const HowItWorksV2 = loadable(() => import("./HowItWorksV2"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <HowItWorksV2 {...props} />
  </ErrorBoundary>
);
