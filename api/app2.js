const { emails } = require("./email");
const express = require("express");
const puppeteer = require("puppeteer");
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
const nodemailer = require("nodemailer");
const { Bot } = require("grammy");
const bot = new Bot("YOUR_BOT_TOKEN"); // Replace with your Telegram bot token

const app = express();

app.get("/scrape", async (req, res) => {
  try {
    let date = new Date().toLocaleTimeString();
    console.log("start time = " + " " + date);

    for (let i = 0; i < emails.length; i++) {
      // await delay(60000)

      const browser = await puppeteer.launch({
        headless: false,
      });
      const page = await browser.newPage();

      await page.setDefaultNavigationTimeout(0);

      await page.goto("https://ais.usvisa-info.com/en-et/niv/users/sign_in");

      await page.waitForSelector(".string.email.required");
      await page.type(".string.email.required", emails[i].user);
      await page.type("#user_password", emails[i].pass);
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

      // await page.click(".fas.fa-money-bill-alt")
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

      // await page.waitForSelector('[href="/en-et/niv/schedule/47838821/payment"]');
      // await page.click('[href="/en-et/niv/schedule/47838821/payment"]')
      await page.waitForSelector(
        "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right"
      );
      const slotDate = await page.$eval(
        "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right",
        (el) => el.textContent
      );
      let date = new Date().toLocaleTimeString();
      console.log(
        slotDate + "Hurry up and book" + " " + emails[i].user + " " + date
      );
      let slot = slotDate + "Hurry up and book";

      const regex = new RegExp("July");
      const regex1 = new RegExp("August");

      if (regex.test(slotDate) || regex1.test(slotDate)) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "",
            pass: "",
          },
        });

        transporter.verify(function (error, success) {
          if (error) {
            console.log(error);
          } else {
            console.log("Server validation done and ready for messages.");
          }
        });

        let details = {
          from: "",
          to: "",
          subject: "CLOSE DATE FOUND!",
          text: slotDate,
        };

        // transporter.sendMail(details, (err) => {
        //     if (err) {
        //         console.log(err)
        //     }
        //     else {
        //         console.log("email has been sent!")
        //     }
        // })
      }

      await browser.close();
    }

    console.log("Scraping completed");

    res.status(200).send("Scraping completed"); // Send a response indicating the function completed successfully
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error"); // Send an error response if something goes wrong
  }
});

module.exports = app;
