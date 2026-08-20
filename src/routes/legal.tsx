import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

const TITLE = "Legal · Berkshire Desk";
const DESCRIPTION =
  "Independence, trademark notice, not investment advice, no warranty, letter copyright, data sources and privacy for Berkshire Desk — an unofficial research site.";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://berkshiredesk.com/legal" }],
  }),
  component: LegalPage,
});
