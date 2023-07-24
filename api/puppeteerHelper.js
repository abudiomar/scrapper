const chromium = require("chromium");
const puppeteer = require("puppeteer");

async function launchBrowser() {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,
    headless: "new",
  });
  return browser;
}

module.exports = { launchBrowser };
