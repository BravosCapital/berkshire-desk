import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/data-page";

const TITLE = "Sources & Filings · Berkshire Desk";
const DESCRIPTION =
  "Data sources for Berkshire Desk: latest 13F, 10-Q/10-K filings, EDGAR XBRL pulls, share counts, cash and T-bill balances. Transparent methodology and update status for the intrinsic value model.";

export const Route = createFileRoute("/data")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://berkshiredesk.com/data" }],
  }),
  component: DataPage,
});
