import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const AboutUsContentUpdated = loadable(() => import("./AboutUsContentUpdated"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <AboutUsContentUpdated {...props} />
  </ErrorBoundary>
);
