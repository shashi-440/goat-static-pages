import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const PrivacyV2 = loadable(() => import("./PrivacyV2"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <PrivacyV2 {...props} />
  </ErrorBoundary>
);
