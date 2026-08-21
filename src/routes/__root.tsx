import { useState } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { useTrackerStore } from "@/lib/store";
import appCss from "../styles.css?url";

const APP_NAME = "Berkshire Desk";
const DEFAULT_TITLE = "Berkshire Desk — Intrinsic Value Desk for BRK.A / BRK.B";
const DESCRIPTION =
  "Two-column SOTP intrinsic value desk for Berkshire Hathaway (BRK.A / BRK.B). Owner’s view of public equities at daily session marks, cash, operating businesses, insurance float and capital structure — with analyst tools, charts and lessons from Buffett’s letters. Independent research, not investment advice.";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME || "berkshiredesk.com";
const siteOrigin = `https://${host}`;
const ogImage = `${siteOrigin}/og.jpg`;
const xBanner = `https://og.grok.me/v1/banner.png?host=${encodeURIComponent(host)}&title=${encodeURIComponent(APP_NAME)}&color=08090B`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: APP_NAME,
  alternateName: ["BRK Desk", "Berkshire Intrinsic Value Tracker"],
  url: siteOrigin,
  description: DESCRIPTION,
  disambiguatingDescription:
    "Independent unofficial research tool. Not affiliated with, endorsed by, or sponsored by Berkshire Hathaway Inc. Not investment advice.",
  creator: { "@type": "Organization", name: APP_NAME },
  publisher: { "@type": "Organization", name: APP_NAME },
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  about: {
    "@type": "Organization",
    name: "Berkshire Hathaway Inc.",
    tickerSymbol: "BRK.B",
    sameAs: [
      "https://www.berkshirehathaway.com/",
      "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001067983",
    ],
  },
  keywords:
    "Berkshire Hathaway, BRK.B, BRK.A, intrinsic value, SOTP, Buffett, two-column valuation, insurance float, owner earnings",
  image: `${siteOrigin}/og.jpg`,
  inLanguage: "en-US",
  isAccessibleForFree: true,
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: DEFAULT_TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "Berkshire Hathaway, BRK.B, BRK.A, intrinsic value, SOTP, Buffett, two-column valuation, insurance float, owner earnings, Berkshire tracker, Berkshire Desk",
      },
      { name: "author", content: "Berkshire Desk" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:description", content: DESCRIPTION },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "theme-color", content: "#08090b" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: DEFAULT_TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:title", content: DEFAULT_TITLE },
      { property: "og:site_name", content: APP_NAME },
      { property: "og:url", content: siteOrigin },
      { property: "og:image", content: ogImage },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Berkshire Desk — two-column intrinsic value for BRK.A / BRK.B",
      },
      { name: "twitter:image", content: ogImage },
      { name: "twitter:image:alt", content: "Berkshire Desk" },
      { property: "x:game:image", content: xBanner },
      { property: "x:game:image:width", content: "1200" },
      { property: "x:game:image:height", content: "264" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", href: "/favicon.svg", sizes: "any" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.svg", sizes: "180x180" },
      { rel: "mask-icon", href: "/favicon.svg", color: "#08090b" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "canonical", href: `${siteOrigin}/` },
    ],
  }),
  component: RootDocument,
});

function ThemedToaster() {
  const theme = useTrackerStore((s) => s.theme);
  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          color: "var(--color-fg)",
        },
      }}
    />
  );
}

function RootDocument() {
  const [queryClient] = useState(makeQueryClient);
  return (
    <html lang="en" className="dark antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('brk-theme')==='light'){document.documentElement.classList.add('light');document.documentElement.classList.remove('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-bg font-sans text-fg">
        <PreviewHostBridge />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <TooltipProvider delayDuration={200}>
                <Outlet />
                <ThemedToaster />
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}
