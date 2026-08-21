import { RouteConfig } from "react-router-config";
import loadable from "@loadable/component";

import Layout from "@App/Layout";
import FullPageLoader from "@Components/FullPageLoader";

const AsyncAboutUsV2Page = loadable(() => import("@Pages/AboutUsV2"), {
  fallback: <FullPageLoader />,
});

const AsyncAboutUsContentUpdatedPage = loadable(() => import("@Pages/AboutUsContentUpdated"), {
  fallback: <FullPageLoader />,
});

const AsyncContactUsV2Page = loadable(() => import("@Pages/ContactUsV2"), {
  fallback: <FullPageLoader />,
});

const AsyncHowItWorksV2Page = loadable(() => import("@Pages/HowItWorksV2"), {
  fallback: <FullPageLoader />,
});

const AsyncCareerV2Page = loadable(() => import("@Pages/CareerV2"), {
  fallback: <FullPageLoader />,
});

const AsyncCareerV3Page = loadable(() => import("@Pages/CareerV3"), {
  fallback: <FullPageLoader />,
});

const AsyncCareerFinalPage = loadable(() => import("@Pages/CareerFinal"), {
  fallback: <FullPageLoader />,
});

const AsyncScholarshipV2Page = loadable(() => import("@Pages/ScholarshipV2"), {
  fallback: <FullPageLoader />,
});

const AsyncEssentialsPage = loadable(() => import("@Pages/Essentials"), {
  fallback: <FullPageLoader />,
});

const AsyncIndexPage = loadable(() => import("@Pages/Index"), {
  fallback: <FullPageLoader />,
});

/**
 * Route table for the v2 static-pages sandbox.
 *
 * Mirrors the shape of amber-user-website's src/routes/desktop/index.ts (nested
 * under a Layout, react-router-config `routes` array) minus the per-route
 * `loadData` SSR thunks, which existed to hydrate the Redux store. Static pages
 * fetch nothing, so there is nothing to preload.
 *
 * To add the next v2 page: drop it in src/pages/, add a loadable import above and
 * one entry here.
 */
const routes: RouteConfig[] = [
  {
    component: Layout,
    routes: [
      {
        path: "/about-us-v2",
        exact: true,
        component: AsyncAboutUsV2Page,
      },
      {
        path: "/about-us-content-updated",
        exact: true,
        component: AsyncAboutUsContentUpdatedPage,
      },
      {
        path: "/contact-us-v2",
        exact: true,
        component: AsyncContactUsV2Page,
      },
      {
        path: "/how-it-works-v2",
        exact: true,
        component: AsyncHowItWorksV2Page,
      },
      {
        path: "/career-v2",
        exact: true,
        component: AsyncCareerV2Page,
      },
      {
        path: "/career-v3",
        exact: true,
        component: AsyncCareerV3Page,
      },
      {
        path: "/career-finals",
        exact: true,
        component: AsyncCareerFinalPage,
      },
      {
        path: "/scholarship-v2",
        exact: true,
        component: AsyncScholarshipV2Page,
      },
      {
        path: "/essentials",
        exact: true,
        component: AsyncEssentialsPage,
      },
      {
        path: "/",
        exact: true,
        component: AsyncIndexPage,
      },
    ],
  },
];

export default routes;
