import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const ScholarshipV2 = loadable(() => import("./ScholarshipV2"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <ScholarshipV2 {...props} />
  </ErrorBoundary>
);
