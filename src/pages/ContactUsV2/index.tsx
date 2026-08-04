import loadable from "@loadable/component";
import { ErrorBoundary } from "../../components";
import FullPageLoader from "@Components/FullPageLoader";

const ContactUsV2 = loadable(() => import("./ContactUsV2"), {
  fallback: <FullPageLoader />,
});

export default (props: any): JSX.Element => (
  <ErrorBoundary>
    <ContactUsV2 {...props} />
  </ErrorBoundary>
);
