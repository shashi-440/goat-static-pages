import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const PartnerWithUs = loadable(() => import("./PartnerWithUs"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <PartnerWithUs {...props} />
  </ErrorBoundary>
);
