import { createFileRoute } from "@tanstack/react-router";
import { MethodologyPage } from "@/components/methodology-page";

const TITLE = "Letters & Lessons · Berkshire Desk";
const DESCRIPTION =
  "Key lessons from Warren Buffett’s shareholder letters applied to Berkshire Hathaway intrinsic value. Two-column valuation, float treatment, operating earnings focus and capital allocation principles.";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://berkshiredesk.com/methodology" }],
  }),
  component: MethodologyPage,
});
