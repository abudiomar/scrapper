const { emails } = require("./email");
const puppeteer = require("puppeteer");
const { Bot } = require("grammy");
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const bot = new Bot(`${process.env.TELEGRAM_BOT_TOKEN}`);
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const CHATID = process.env.TELEGRAM_BOT_CHAT_ID;

async function start() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ["--no-sandbox"],
    });

    for (let i = 0; i < emails.length; i++) {
      const page = await browser.newPage();

      await page.setDefaultNavigationTimeout(0);

      await page.goto("https://ais.usvisa-info.com/en-et/niv/users/sign_in");

      await page.waitForSelector(".string.email.required");
      await page.type(".string.email.required", emails[i].username);
      await page.type("#user_password", emails[i].password);
      await page.waitForSelector(
        "#sign_in_form > div.radio-checkbox-group.margin-top-30 > label > div"
      );
      await page.click(
        "#sign_in_form > div.radio-checkbox-group.margin-top-30 > label > div"
      );
      await page.click(".simple_form.new_user p input");

      await page.waitForSelector(".medium-6.columns.text-right ul li a");
      await page.click(
        "#main > div:nth-child(2) > div.mainContent > div:nth-child(1) > div > div > div:nth-child(1) > div.medium-6.columns.text-right > ul > li > a"
      );

      await page.waitForSelector(".fas.fa-money-bill-alt");

      await page.waitForSelector(
        "#forms > ul > li:nth-child(1) > div > div > div.medium-10.columns > p:nth-child(2) > a"
      );
      await page.evaluate(() =>
        document
          .querySelector(
            "#forms > ul > li:nth-child(1) > div > div > div.medium-10.columns > p:nth-child(2) > a"
          )
          .click()
      );

      await page.waitForSelector(
        "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right"
      );
      const slotDate = await page.$eval(
        "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right",
        (el) => el.textContent
      );

      let slot = slotDate + "Hurry up and book";
      let date = new Date().toLocaleTimeString();

      const regex = new RegExp("September");

      if (regex.test(slotDate)) {
        await bot.api.sendMessage(CHATID, slot);
      }
      // await bot.api.sendMessage(CHATID, slot);

      await delay(53000);
      await page.close();
    }

    await browser.close();
    console.log("Scraping completed");
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
}

start();
