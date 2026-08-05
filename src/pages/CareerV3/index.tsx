import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const CareerV3 = loadable(() => import("./CareerV3"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <CareerV3 {...props} />
  </ErrorBoundary>
);
