import { createFileRoute } from "@tanstack/react-router";
import { CapitalPage } from "@/components/capital-page";

const TITLE = "Capital Structure & Float · Berkshire Desk";
const DESCRIPTION =
  "Berkshire Hathaway capital structure, insurance float, parent-level debt and cash. How float is treated in the two-column intrinsic value model and why it is not deducted as a conventional liability.";

export const Route = createFileRoute("/capital")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://berkshiredesk.com/capital" }],
  }),
  component: CapitalPage,
});
