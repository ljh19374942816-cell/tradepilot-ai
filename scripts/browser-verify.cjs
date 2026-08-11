/* eslint-disable @typescript-eslint/no-require-imports -- loads an external temporary Playwright runtime */
const fs = require("node:fs");
const path = require("node:path");

const runtime = process.env.PLAYWRIGHT_CORE_PATH;
if (!runtime) throw new Error("PLAYWRIGHT_CORE_PATH is required");
const { chromium } = require(runtime);

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const edgePath = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

function readEnv() {
  return Object.fromEntries(
    fs.readFileSync(path.join(process.cwd(), ".env"), "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.trimStart().startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")];
      }),
  );
}

async function expectText(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible" });
}

(async () => {
  const env = readEnv();
  const artifacts = path.join(process.cwd(), ".artifacts");
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ executablePath: edgePath, headless: true });
  const errors = [];
  const results = [];

  async function exercise(viewport, name, run) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
        errors.push(`${name}: console: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => errors.push(`${name}: page: ${error.message}`));
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push(`${name}: response ${response.status()}: ${response.url()}`);
    });
    try {
      await run(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (overflow) errors.push(`${name}: horizontal overflow at ${page.url()}`);
      results.push(`${name}: PASS`);
    } catch (error) {
      results.push(`${name}: FAIL - ${error.message}`);
      await page.screenshot({ path: path.join(artifacts, `${name}-failure.png`), fullPage: true });
    } finally {
      await context.close();
    }
  }

  await exercise({ width: 1440, height: 1000 }, "public-desktop", async (page) => {
    await page.goto(`${baseUrl}/?lang=zh`, { waitUntil: "networkidle" });
    const links = await page.locator('a[href^="/solutions/"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
    const expected = ["/solutions/product-qa?lang=zh", "/solutions/buyer-intent?lang=zh", "/solutions/follow-up?lang=zh"];
    if (!expected.every((href) => links.includes(href))) throw new Error(`missing solution links: ${JSON.stringify(links)}`);
    await page.screenshot({ path: path.join(artifacts, "homepage-desktop.png"), fullPage: true });

    await page.goto(`${baseUrl}/solutions/product-qa?lang=zh`, { waitUntil: "networkidle" });
    await expectText(page, "常见产品问题");
    const question = page.locator("button").filter({ hasText: "起订量和交期" }).first();
    await question.click();
    await expectText(page, "标准交期");
    await page.getByRole("button", { name: "启动 AI 产品顾问" }).click();
    await page.getByRole("button", { name: "Atlas 2000 起订量是多少？" }).click();
    await page.waitForFunction(() => {
      const messages = [...document.querySelectorAll(".whitespace-pre-wrap")];
      const last = messages.at(-1);
      return Boolean(last && last.textContent && last.textContent.trim().length > 20 && !last.querySelector("svg"));
    }, null, { timeout: 45000 });
    await expectText(page, "TradePilot DeepSeek");
    await page.screenshot({ path: path.join(artifacts, "product-qa-chat.png"), fullPage: true });

    await page.goto(`${baseUrl}/solutions/buyer-intent?lang=zh`, { waitUntil: "networkidle" });
    await page.getByLabel("姓名 *").fill("浏览器验收客户");
    await page.getByLabel("工作邮箱 *").fill("browser.verify@example.com");
    await page.getByLabel("公司 *").fill("Verification Ltd");
    await page.getByLabel("国家/地区 *").fill("Singapore");
    await page.getByRole("button", { name: "下一步" }).click();
    await expectText(page, "采购产品 *");
    await page.getByLabel("预计数量 *").fill("2000");
    await page.getByRole("button", { name: "30 天内" }).click();
    await page.getByRole("button", { name: "下一步" }).click();
    await expectText(page, "预算状态 *");
    await page.getByRole("button", { name: "上一步" }).click();
    await expectText(page, "计划采购时间 *");

    await page.goto(`${baseUrl}/solutions/follow-up?lang=zh`, { waitUntil: "networkidle" });
    await expectText(page, "查询询盘");
    await page.getByLabel("询盘编号").fill("TP-TEST");
    await page.getByLabel("提交邮箱").fill("buyer@example.com");
    await page.screenshot({ path: path.join(artifacts, "follow-up-desktop.png"), fullPage: true });
  });

  await exercise({ width: 390, height: 844 }, "public-mobile", async (page) => {
    for (const route of ["/", "/solutions/product-qa?lang=zh", "/solutions/buyer-intent?lang=zh", "/solutions/follow-up?lang=zh"]) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (overflow) throw new Error(`horizontal overflow at ${route}`);
    }
    await page.screenshot({ path: path.join(artifacts, "follow-up-mobile.png"), fullPage: true });
  });

  await exercise({ width: 1366, height: 900 }, "admin-bilingual", async (page) => {
    await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
    const toggle = page.getByRole("button", { name: /中文|EN/ });
    if (await page.getByText("Welcome back", { exact: true }).isVisible()) {
      await toggle.click();
      await expectText(page, "欢迎回来");
    } else {
      await expectText(page, "欢迎回来");
    }
    await page.getByLabel("邮箱地址").fill(env.ADMIN_EMAIL);
    await page.getByLabel("密码").fill(env.ADMIN_PASSWORD);
    await page.getByRole("button", { name: "登录" }).click();
    await page.waitForURL(`${baseUrl}/admin`, { timeout: 15000 });
    await expectText(page, "询盘");
    await page.goto(`${baseUrl}/?lang=zh`, { waitUntil: "networkidle" });
    await expectText(page, "进入管理后台");
    await page.screenshot({ path: path.join(artifacts, "homepage-admin.png"), fullPage: true });
  });

  await browser.close();
  console.log(JSON.stringify({ results, errors }, null, 2));
  if (results.some((result) => result.includes("FAIL")) || errors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
