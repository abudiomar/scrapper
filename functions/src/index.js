import * as functions from "firebase-functions";
import * as puppeteer from "puppeteer";
import { Bot } from "grammy";
const { emails } = require("../../../email");

const bot = new Bot(`${process.env.TELEGRAM_BOT_TOKEN}`);
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const CHATID = process.env.TELEGRAM_BOT_CHAT_ID;

export const scrapeFunction = functions.pubsub
  .schedule("every 1 minutes")
  .timeZone("Africa/Addis_Ababa")
  .onRun(async () => {
    try {
      for (let i = 0; i < emails.length; i++) {
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

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
        await delay(2000);
        await page.waitForSelector(".fas.fa-money-bill-alt");

        await delay(6000);

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
        await bot.api.sendMessage(CHATID, slot);

        await page.close();

        await Promise.resolve(delay(60000));
      }

      await browser.close();
      console.log("Scraping completed");
    } catch (error) {
      console.error(error);
      throw new Error("Internal server error");
    }
  });
