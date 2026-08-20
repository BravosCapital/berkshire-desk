import { createFileRoute } from "@tanstack/react-router";
import { BusinessesPage } from "@/components/businesses-page";

const TITLE = "Operating Businesses · Berkshire Desk";
const DESCRIPTION =
  "Berkshire Hathaway’s wholly-owned operating businesses valued on a pretax multiple. BNSF, Berkshire Hathaway Energy, manufacturing, service and retail — the second column of the two-column intrinsic value model.";

export const Route = createFileRoute("/businesses")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://berkshiredesk.com/businesses" }],
  }),
  component: BusinessesPage,
});
