const { emails } = require("../email");
const chromium = require("chromium");
const puppeteer = require("puppeteer-core");
const nodemailer = require("nodemailer");

async function scrapeEmails() {
  try {
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath,
      args: chromium.args,
      headless: chromium.headless,
    });

    console.log("start time =", new Date().toLocaleTimeString());

    for (const email of emails) {
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(0);

      await page.goto("https://ais.usvisa-info.com/en-et/niv/users/sign_in");

      await page.waitForSelector(".string.email.required");
      await page.type(".string.email.required", email.user);
      await page.type("#user_password", email.pass);

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

      await page.waitForTimeout(2000); // Replace 'delay' function with built-in 'waitForTimeout'

      await page.waitForSelector(".fas.fa-money-bill-alt");
      await page.waitForTimeout(6000); // Replace 'delay' function with built-in 'waitForTimeout'

      await page.waitForSelector(
        "#forms > ul > li:nth-child(1) > div > div > div.medium-10.columns > p:nth-child(2) > a"
      );
      await page.click(
        "#forms > ul > li:nth-child(1) > div > div > div.medium-10.columns > p:nth-child(2) > a"
      );

      await page.waitForSelector(
        "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right"
      );
      const slotDate = await page.$eval(
        "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right",
        (el) => el.textContent
      );

      console.log(
        slotDate,
        "Hurry up and book",
        email.user,
        new Date().toLocaleTimeString()
      );

      const regex = new RegExp("July|August"); // Combine the regex patterns
      if (regex.test(slotDate)) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "", // Fill in your Gmail credentials
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

        const details = {
          from: "", // Fill in the 'from' email address
          to: "", // Fill in the 'to' email address
          subject: "CLOSE DATE FOUND!",
          text: slotDate,
        };
        // Uncomment the following lines to send an email
        // transporter.sendMail(details, (err) => {
        //     if (err) {
        //         console.log(err)
        //     } else {
        //         console.log("email has been sent!")
        //     }
        // });
      }

      await page.close();
    }

    await browser.close();
    console.log("Scraping completed");
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
}

module.exports = scrapeEmails;
