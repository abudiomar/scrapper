const { emails } = require("./email");
const puppeteer = require("puppeteer");
const { Bot } = require("grammy");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const bot = new Bot(`${process.env.TELEGRAM_BOT_TOKEN}`);
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const MCHATID = process.env.TELEGRAM_BOT_CHAT_ID;
const CHANNELID = process.env.TELEGRAM_CHANNEL_ID;

async function start() {
  //here the options are for the server since running puppeteer without this will cause errors
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    for (let i = 0; i < emails.length; i++) {
      const page = await browser.newPage();

      await page.setDefaultNavigationTimeout(0);

      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36"
      );

      await page.goto("https://ais.usvisa-info.com/en-et/niv/users/sign_in", {
        waitUntil: "networkidle2",
      });

      await page.waitForSelector(".string.email.required");
      await page.type(".string.email.required", emails[i].username);
      await page.type("#user_password", emails[i].password);
      await delay(4000);
      // await page.waitForSelector(
      //   "#sign_in_form > div.radio-checkbox-group.margin-top-30 > label > div"
      // );

      await page.click(
        "#sign_in_form > div.radio-checkbox-group.margin-top-30 > label > div"
      );
      await page.click(".simple_form.new_user p input");

      await page.waitForSelector(".medium-6.columns.text-right ul li a");
      await delay(5000);

      await page.click(
        "#main > div:nth-child(2) > div.mainContent > div:nth-child(1) > div > div > div:nth-child(1) > div.medium-6.columns.text-right > ul > li > a"
      );

      await page.waitForSelector(".fas.fa-money-bill-alt");

      await page.waitForSelector(
        "#forms > ul > li:nth-child(1) > div > div > div.medium-10.columns > p:nth-child(2) > a"
      );
      await delay(5000);

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

      let slot =
        slotDate +
        " Hurry up and book!!\n" +
        " B1\n" +
        "https://ais.usvisa-info.com/en-et/niv/users/sign_in";
      let date = new Date().toLocaleTimeString();
      // console.log(date, slot);

      const firstDate = new RegExp("November");
      const secondDate = new RegExp("December");
      const thirdDate = new RegExp("January");
      // const fourthDate = new RegExp("August");
      // const fifthDate = new RegExp("September");

      if (
        firstDate.test(slotDate) ||
        secondDate.test(slotDate) ||
        thirdDate.test(slotDate)
      ) {
        await bot.api.sendMessage(CHANNELID, slot);
      }
      await bot.api.sendMessage("5479132399", slot + " " + (i + 1) + " " + "type: B1");
      await bot.api.sendMessage("414889833", slot + " " + (i + 1) + " " + "type: B1");

      await page.close();
      await delay(60000);
    }

    await browser.close();
    console.log("Scraping completed");
  } catch (error) {
    await bot.api.sendMessage("5479132399", error.name);
    await bot.api.sendMessage("414889833", error.name);
    console.error(error);
    await browser.close();

    throw new Error("Internal server error");
  }
}

start();
