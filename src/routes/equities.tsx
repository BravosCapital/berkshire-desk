import { createFileRoute } from "@tanstack/react-router";
import { EquitiesPage } from "@/components/equities-page";

const TITLE = "Public Equities & Japan Holdings · Berkshire Desk";
const DESCRIPTION =
  "Live market value of Berkshire Hathaway’s public equity portfolio and Japan trading houses. 13F holdings marked to market with weights, sector mix and contribution to intrinsic value.";

export const Route = createFileRoute("/equities")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://berkshiredesk.com/equities" }],
  }),
  component: EquitiesPage,
});
