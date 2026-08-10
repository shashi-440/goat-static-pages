import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const ListWithUs = loadable(() => import("./ListWithUs"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <ListWithUs {...props} />
  </ErrorBoundary>
);
