import { createFileRoute } from "@tanstack/react-router";
import { ChartsPage } from "@/components/charts-page";

const TITLE = "Charts & History · Berkshire Desk";
const DESCRIPTION =
  "Historical charts of Berkshire Hathaway intrinsic value, market price, premium/discount, cash position and operating earnings. Visual context for the two-column SOTP model.";

export const Route = createFileRoute("/charts")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://berkshiredesk.com/charts" }],
  }),
  component: ChartsPage,
});
