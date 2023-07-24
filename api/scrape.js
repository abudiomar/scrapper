const { emails } = require("../email");
const puppeteer = require("puppeteer");
const { Bot } = require("grammy");
require("dotenv").config();

const bot = new Bot(`${process.env.TELEGRAM_BOT_TOKEN}`);
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const CHATID = process.env.TELEGRAM_BOT_CHAT_ID;

async function start() {
  try {
    for (let i = 0; i < emails.length; i++) {
      const browser = await puppeteer.launch({
        headless: true,
      });

      const page = await browser.newPage();

      await page.setDefaultNavigationTimeout(0);

      await page.goto("https://ais.usvisa-info.com/en-et/niv/users/sign_in");

      await page.waitForSelector(".string.email.required");
      await page.type(".string.email.required", "enatschool1@gmail.com");
      await page.type("#user_password", "Muazmusa@123");
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

      const regex = new RegExp("July");
      const regex1 = new RegExp("August");

      if (regex.test(slotDate) || regex1.test(slotDate)) {
        // const transporter = createTransporter();
        /*         transporter.verify(function (error, success) {
          if (error) {
            console.log(error);
          } else {
            console.log("Server validation done and ready for messages.");
          }
        });

        let details = {
          from: `${process.env.GMAIL_USER}`,
          to: `${process.env.GMAIL_USER}`,
          subject: "CLOSE DATE FOUND!",
          text: slotDate,
        }; */
        /* transporter.sendMail(details, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("email has been sent!");
          }
        }); */
      }

      await page.close();

      await Promise.resolve(delay(60000));
    }

    await browser.close();
    console.log("Scraping completed");
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
}

// module.exports = start;

start();
