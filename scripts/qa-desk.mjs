import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.QA_URL ?? "http://127.0.0.1:8080";
const OUT = "/workspace/screenshots";

const PAGES = [
  ["/", "overview"],
  ["/equities", "equities"],
  ["/businesses", "businesses"],
  ["/charts", "charts"],
  ["/capital", "capital"],
  ["/data", "data"],
  ["/methodology", "methodology"],
  ["/login", "login"],
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const errors = [];

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });

  await page.addInitScript(() => {
    try {
      localStorage.setItem("brk-theme", "dark");
    } catch {
      /* ignore */
    }
  });

  for (const [path, name] of PAGES) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45_000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/qa-${name}.png`, fullPage: true });
    console.log("shot", name);
  }

  // Data page: wait for EDGAR upgrade or click refresh
  await page.goto(`${BASE}/data`, { waitUntil: "networkidle", timeout: 45_000 });
  const refresh = page.getByRole("button", { name: /Refresh filings/i });
  if (await refresh.count()) {
    await refresh.click();
    await page.waitForTimeout(12_000);
  }
  await page.screenshot({ path: `${OUT}/qa-data-after-refresh.png`, fullPage: true });
  const body = await page.innerText("main");
  console.log("DATA_SNIP\n", body.slice(0, 1200));

  // Light mode overview
  const themeBtn = page.getByRole("button", { name: /Switch to light mode/i });
  if (await themeBtn.count()) {
    await themeBtn.click();
    await page.waitForTimeout(400);
  }
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/qa-overview-light.png`, fullPage: true });

  await page.goto(`${BASE}/data`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/qa-data-light.png`, fullPage: true });

  // Mobile
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mpage = await mobile.newPage();
  mpage.on("pageerror", (e) => errors.push(`mobile ${e}`));
  await mpage.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 45_000 });
  await mpage.waitForTimeout(600);
  const overflow = await mpage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  console.log("mobile overflow", overflow);
  await mpage.screenshot({ path: `${OUT}/qa-mobile-overview.png`, fullPage: true });
  await mpage.goto(`${BASE}/data`, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(400);
  await mpage.screenshot({ path: `${OUT}/qa-mobile-data.png`, fullPage: true });
  await mobile.close();

  await browser.close();
  const real = errors.filter((e) => !/hydration|favicon|Download the React DevTools/i.test(e));
  console.log("errors", real);
  if (overflow) process.exitCode = 2;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
