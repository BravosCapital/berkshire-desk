import { createFileRoute } from "@tanstack/react-router";
import { TrackerPage } from "@/components/tracker-page";

const TITLE = "Berkshire Desk — Live Intrinsic Value for BRK.A / BRK.B";
const DESCRIPTION =
  "Live two-column SOTP intrinsic value desk for Berkshire Hathaway. Track public equities, cash, operating businesses, insurance float and capital structure with analyst tools and lessons from Buffett’s letters.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://berkshiredesk.com/" }],
  }),
  component: TrackerPage,
});
