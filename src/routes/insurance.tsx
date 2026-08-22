import { createFileRoute } from "@tanstack/react-router";
import { InsurancePage } from "@/components/insurance-page";

const TITLE = "Insurance & Underwriting · Berkshire Desk";
const DESCRIPTION =
  "How Berkshire Hathaway’s insurance engine works: float as revolving capital, after-tax underwriting as the franchise, and why investment income is not capitalized twice in the two-column SOTP.";

export const Route = createFileRoute("/insurance")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://berkshiredesk.com/insurance" }],
  }),
  component: InsurancePage,
});
