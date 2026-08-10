import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const GroupBookingV2Alt = loadable(() => import("./GroupBookingV2Alt"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <GroupBookingV2Alt {...props} />
  </ErrorBoundary>
);
