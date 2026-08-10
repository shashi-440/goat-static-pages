import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const TermsV2 = loadable(() => import("./TermsV2"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <TermsV2 {...props} />
  </ErrorBoundary>
);
