const { emails } = require("./email");
const puppeteer = require("puppeteer");
const { Bot } = require("grammy");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const bot = new Bot(`${process.env.TELEGRAM_BOT_TOKEN}`);
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const CHATID = process.env.TELEGRAM_BOT_CHAT_ID;

async function start() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);

    await page.goto("https://ais.usvisa-info.com/en-et/niv/users/sign_in");

    await page.waitForSelector(".string.email.required");
    await page.type(".string.email.required", "tayenadew123@gmail.com");
    await page.type("#user_password", "@Nadewtaye1");
    await delay(4000);
    // await page.waitForSelector(
    //   "#sign_in_form > div.radio-checkbox-group.margin-top-30 > label > div"
    // );

    await page.click(
      "#sign_in_form > div.radio-checkbox-group.margin-top-30 > label > div"
    );
    await page.click(".simple_form.new_user p input");

    await delay(5000);
    await page.waitForSelector("a.button.primary.small");
    await page.click("a.button.primary.small");
    await delay(5000);
    await page.waitForSelector(
      "#forms > ul > li:nth-child(3) > div > div > div.medium-10.columns > p:nth-child(2) > a"
    );
    await page.evaluate(() =>
      document
        .querySelector(
          "#forms > ul > li:nth-child(3) > div > div > div.medium-10.columns > p:nth-child(2) > a"
        )
        .click()
    );

    await page.waitForSelector("input.button.primary");
    await page.click("input.button.primary");

    // Wait for the calendar to fully load

    // Define the target date you want to select

    // Click on the target date
    // Wait for the calendar to fully load
    await delay(8000);
    await page.evaluate(() => {
      const inputField = document.getElementById(
        "appointments_consulate_appointment_date"
      );
      inputField.click();
    });
    await delay(5000);

    // Define the target date you want to select
    const targetDate = "2024-08-13"; // Example: September 8th, 2024

    // Click on the target date
    await page.evaluate((targetDate) => {
      let nextButton = document.querySelector(".ui-datepicker-next");

      // Click on the "Next" button to show the next two sets of months
      if (nextButton) {
        nextButton.click();
        // Introduce a delay between the clicks to ensure sequential execution
      } else {
        console.error("Next button not found.");
      }
      nextButton = document.querySelector(".ui-datepicker-next");
      if (nextButton) {
        nextButton.click();
        // Introduce a delay between the clicks to ensure sequential execution
      } else {
        console.error("Next button not found.");
      }

      // Find the target date element by its data attributes
      const targetDateElement = document.querySelector(
        `td[data-handler="selectDay"][data-year="${
          targetDate.split("-")[0]
        }"][data-month="${parseInt(targetDate.split("-")[1]) - 1}"] > a`
      );

      nextButton.click();

      // Check if the target date element exists and is clickable
      if (targetDateElement) {
        // Click on the target date element
        targetDateElement.click();
      } else {
        console.error("Target date not found or is not clickable.");
      }

      // Find the "Next" button element
    }, targetDate);

    // await page.waitForSelector("input#appointments_consulate_appointment_date");

    await delay(5000);
    await page.click("#appointments_consulate_appointment_time_input");
    // Wait for the options to appear within the select dropdown

    await delay(5000);

    // Click on the second option
    await page.keyboard.press("ArrowDown"); // Move down to highlight the second option
    await page.keyboard.press("Enter");
    await page.click("#appointments_submit");
    // await page.waitForSelector(
    //   "#appointments_consulate_appointment_time_input option"
    // );

    // // Wait for the option with value "08:00" to become clickable
    // await page.waitForSelector(
    //   "#appointments_consulate_appointment_time_input option:nth-child(2)"
    // );

    // // Click on the option with value "08:00"
    // await page.click(
    //   "#appointments_consulate_appointment_time_input option:nth-child(2)"
    // );

    // await delay(5000);

    // await page.evaluate(() => {
    //   // Get the select element by its id
    //   const selectElement = document.getElementById(
    //     "appointments_consulate_appointment_time"
    //   );
    //   selectElement.click();
    //   // Check if the select element exists
    //   if (selectElement) {
    //     console.log("yes1");

    //     // Check if there is at least one option available
    //     if (selectElement.options.length > 0) {
    //       console.log("yes2");
    //       // Select the first option
    //       selectElement.selectedIndex = 1;
    //     }
    //   } else {
    //     console.log("no");
    //   }
    // });
    // await delay(5000);
    // await page.click("#appointments_consulate_appointment_time_input");
    // await delay(5000);
    //   await page.waitForSelector(".fas.fa-money-bill-alt");

    //   await page.waitForSelector(
    //     "#forms > ul > li:nth-child(1) > div > div > div.medium-10.columns > p:nth-child(2) > a"
    //   );
    //       await delay(10000);

    //   await page.evaluate(() =>
    //     document
    //       .querySelector(
    //         "#forms > ul > li:nth-child(1) > div > div > div.medium-10.columns > p:nth-child(2) > a"
    //       )
    //       .click()
    //   );

    //   await page.waitForSelector(
    //     "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right"
    //   );
    //   const slotDate = await page.$eval(
    //     "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right",
    //     (el) => el.textContent
    //   );

    //   let slot = slotDate + "Hurry up and book!!";
    //   let date = new Date().toLocaleTimeString();
    //   // console.log(date,slot);

    //   const firstDate = new RegExp("May");
    //   const secondDate = new RegExp("June");
    //   // const thirdData = new RegExp("July");
    //   // const fourthDate = new RegExp("August");
    //   // const fifthDate = new RegExp("September");

    //   if (firstDate.test(slotDate) || secondDate.test(slotDate)) {
    //     await bot.api.sendMessage(CHATID, slot);
    //      await bot.api.sendMessage("5479132399", slot);

    //   }
    //await bot.api.sendMessage(CHATID, slot);
    await delay(60000);
    await page.close();

    await browser.close();
    console.log("Scraping completed");
  } catch (error) {
    await bot.api.sendMessage("5479132399", error.name);
    console.error(error);
    throw new Error("Internal server error");
  }
}

start();
