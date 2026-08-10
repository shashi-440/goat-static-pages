import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const ContactUsV2Card = loadable(() => import("./ContactUsV2Card"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <ContactUsV2Card {...props} />
  </ErrorBoundary>
);
