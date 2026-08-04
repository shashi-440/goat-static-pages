import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const AboutUsV2 = loadable(() => import("./AboutUsV2"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <AboutUsV2 {...props} />
  </ErrorBoundary>
);
