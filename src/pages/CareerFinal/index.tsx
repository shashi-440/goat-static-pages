import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const CareerFinal = loadable(() => import("./CareerFinal"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <CareerFinal {...props} />
  </ErrorBoundary>
);
