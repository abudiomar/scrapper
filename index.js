const { emails } = require("./email");
const puppeteer = require("puppeteer");
const { Bot } = require("grammy");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const moment = require("moment");
const Promise = require("bluebird");

const bot = new Bot(`${process.env.TELEGRAM_BOT_TOKEN}`);
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

// const MCHATID = process.env.TELEGRAM_BOT_CHAT_ID;
const targetDateChannel = process.env.TELEGRAM_CHANNEL_ID;
const debugChannel = process.env.TELEGRAM_DEBUG_CHANNEL_ID;

async function start() {
  const startTime = moment();
  const startMessage = `
🚀 Starting Scan
━━━━━━━━━━━━━━━
⏰ Start Time: ${startTime.format("MMMM Do, h:mm:ss a")}
📧 Total Emails: ${emails.length}
━━━━━━━━━━━━━━━`;

  await bot.api.sendMessage(debugChannel, startMessage, {
    parse_mode: "Markdown",
  });

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920x1080",
      "--enable-javascript",
      "--disable-notifications",
      "--disable-extensions",
      "--disable-web-security",
      "--allow-running-insecure-content",
      "--start-maximized",
    ],
    ignoreHTTPSErrors: true,
  });
  let currentEmailIndex = 0;

  const batchSize = 10;
  const actionDelay = 33000;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchStartTime = moment();
    let successfulEmails = 0;

    await Promise.map(
      batch,
      async (email, index) => {
        let page = null;
        const emailStartTime = moment();

        try {
          page = await browser.newPage();
          currentEmailIndex = i + index;
          // console.log("Creating new page for email index:", currentEmailIndex);

          const accountDelay = currentEmailIndex * actionDelay;
          // console.log("Account delay:", accountDelay);

          // Set up page configurations
          await page.setDefaultNavigationTimeout(65000);
          // console.log("Navigation timeout set");

          await page.setRequestInterception(true);
          // console.log("Request interception enabled");

          page.on("request", (request) => {
            if (
              ["image", "stylesheet", "font"].indexOf(
                request.resourceType()
              ) !== -1
            ) {
              request.abort();
            } else {
              request.continue();
            }
          });
          const userAgents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/121.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Edge/121.0.0.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
            "Mozilla/5.0 (iPad; CPU OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Edge/120.0.0.0",
          ];

          // Set user agent before navigation
          const randomUserAgent =
            userAgents[Math.floor(Math.random() * userAgents.length)];
          await page.setUserAgent(randomUserAgent);
          // console.log("User agent set:", randomUserAgent);

          await page.setJavaScriptEnabled(true);

          await delay(accountDelay);
          // console.log("Initial delay completed");

          await page.goto(
            "https://ais.usvisa-info.com/en-et/niv/users/sign_in",
            {
              waitUntil: ["networkidle0", "domcontentloaded"],
              timeout: 60000,
            }
          );

          // Wait for form to be truly interactive
          await page.waitForFunction(
            () => {
              const emailInput = document.querySelector(
                ".string.email.required"
              );
              const passwordInput = document.querySelector("#user_password");
              return (
                emailInput &&
                passwordInput &&
                window.getComputedStyle(emailInput).display !== "none" &&
                window.getComputedStyle(passwordInput).display !== "none"
              );
            },
            { timeout: 60000 }
          );

          // Clear fields before typing
          await page.evaluate(() => {
            document.querySelector(".string.email.required").value = "";
            document.querySelector("#user_password").value = "";
          });

          // Type credentials with delay
          await page.type(".string.email.required", email.username, {
            delay: 100,
          });

          await page.type("#user_password", email.password, { delay: 100 });

          await delay(4000);

          // More reliable checkbox handling
          await page.waitForFunction(() => {
            const checkbox = document.querySelector(
              ".radio-checkbox-group.margin-top-30 > label > div"
            );
            return checkbox && checkbox.offsetParent !== null;
          });

          await page.evaluate(() => {
            const checkbox = document.querySelector(
              ".radio-checkbox-group.margin-top-30 > label > div"
            );
            checkbox.click();
          });

          // More reliable submit button handling
          await page.waitForFunction(
            () => {
              const submitBtn = document.querySelector(
                ".simple_form.new_user p input"
              );
              return submitBtn && submitBtn.offsetParent !== null;
            },
            { timeout: 60000 }
          );

          await Promise.all([
            page.waitForNavigation(),
            page.evaluate(() => {
              document.querySelector(".simple_form.new_user p input").click();
            }),
          ]);

          // Wait for the navigation menu with retry mechanism
          await page.waitForSelector(".medium-6.columns.text-right ul li a");
          await delay(5000);

          // Wait for and click the continue button with better selector handling
          const continueButtonSelector =
            "#main > div:nth-child(2) > div.mainContent > div:nth-child(1) > div > div > div:nth-child(1) > div.medium-6.columns.text-right > ul > li > a";
          await page.waitForSelector(continueButtonSelector, {
            visible: true,
            timeout: 60000,
          });

          await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
              element.click();
            } else {
              throw new Error("Continue button not found");
            }
          }, continueButtonSelector);

          // After clicking continue button, add more error handling and logging

          // Wait for either the payment icon or an error message
          await page.waitForNavigation({
            waitUntil: "networkidle0",
            timeout: 60000,
          });

          // Add a small delay to ensure page is fully rendered
          await delay(3000);

          // Wait for payment icon with better error handling
          await page.waitForSelector(".fas.fa-money-bill-alt");

          await page.evaluate(() =>
            document
              .querySelector(
                "#forms > ul > li:nth-child(1) > div > div > div.medium-10.columns > p:nth-child(2) > a"
              )
              .click()
          );

          await delay(5000);

          // } catch (iconError) {
          //   console.log(
          //     "Payment icon not found, checking alternative selectors..."
          //   );
          //   // Try alternative selectors or check for error messages
          //   const pageContent = await page.content();
          //   if (
          //     pageContent.includes("error") ||
          //     pageContent.includes("Error")
          //   ) {
          //     throw new Error("Page showed an error message");
          //   }
          //   throw iconError;
          // }
          // } catch (navigationError) {
          //   console.error("Navigation error:", navigationError);
          //   // Take a screenshot for debugging
          //   await page.screenshot({ path: `error-${Date.now()}.png` });
          //   throw navigationError;
          // }

          // Wait for and extract slot date
          const slotDateSelector =
            "#paymentOptions > div.medium-3.column > table > tbody > tr > td.text-right";
          await page.waitForSelector(slotDateSelector);

          const slotDate = await page.$eval(
            slotDateSelector,
            (el) => el.textContent
          );
          // console.log("Slot date extracted:", slotDate);
          // console.log(moment().format("h:mm:ss a"));

          let slot = `
🚨  Available Slot Found
━━━━━━━━━━━━━━━
🗓️ Date: ${slotDate}
🎯 Visa Type: *F1*
⏰ Found at: ${moment().format("h:mm:ss a")}
🔗 [Book here](https://ais.usvisa-info.com/en-et/niv/users/sign_in)
━━━━━━━━━━━━━━━`;

          // Debug message with more details
          const debugMessage = `
📍 New Slot Found
━━━━━━━━━━━━━━━
🗓️ Date: ${slotDate}
👤 Email: \`${email.username}\`
🎯 Type: *F1*
⏰ Found at: ${moment().format("h:mm:ss a")}
��� [Book here](https://ais.usvisa-info.com/en-et/niv/users/sign_in)
━━━━━━━━━━━━━━━`;

          const secondDate = new RegExp("December");
          const thirdDate = new RegExp("January");
          const firstDate = new RegExp("February");

          // const fourthDate = new RegExp("August");
          // const fifthDate = new RegExp("September");

          if (
            firstDate.test(slotDate) ||
            secondDate.test(slotDate) ||
            thirdDate.test(slotDate)
          ) {
            await bot.api.sendMessage(targetDateChannel, slot, {
              parse_mode: "Markdown",
              disable_web_page_preview: true,
            });
          }

          // await bot.api.sendMessage(debugChannel, debugMessage, {
          //   parse_mode: "Markdown",
          //   disable_web_page_preview: true,
          // });

          // When a slot is found, include timing information
          const slotMessage = `
📍 New Slot Found
━━━━━━━━━━━━━━━
🗓️ Date: ${slotDate}
👤 Email: \`${email.username}\`
🎯 Type: *F1*
⏰ Found at: ${moment().format("h:mm:ss a")}
⌛ Process Time: ${moment().diff(emailStartTime, "seconds")}s
🔗 [Book here](https://ais.usvisa-info.com/en-et/niv/users/sign_in)
━━━━━━━━━━━━━━━`;

          await bot.api.sendMessage(debugChannel, slotMessage, {
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          });

          await page.close();
          successfulEmails++;
        } catch (error) {
          if (error.name === "TimeoutError") {
            console.error(
              `Timeout error for email: ${email.username}. Continuing with other emails.`
            );
          } else {
            console.error(`Error for email: ${email.username}`, error);
          }
          const errorMessage = `
⚠️ Error Report
━━━━━━━━━━━━━━━
👤 Email: \`${email.username}\`
❌ Error: ${error.name}
📝 Message: ${error.message}
⏰ Time: ${moment().format("MMMM Do, h:mm:ss a")}
━━━━━━━━━━━━━━━`;
          await bot.api.sendMessage(debugChannel, errorMessage, {
            parse_mode: "Markdown",
          });
        } finally {
          if (page) {
            try {
              await page.close(); // Attempt to close the page
            } catch (closeError) {
              console.error(
                `Error closing page for email: ${email.username}`,
                closeError
              );
            }
          }
        }
      },
      { concurrency: batchSize }
    );
    // Final completion message with total runtime
    const endTime = moment();
    const completionMessage = `
  🏁 Batch Completed
  ━━━━━━━━━━━━━━━
  📅 Start: ${startTime.format("h:mm:ss a")}
  ⏰ End: ${endTime.format("h:mm:ss a")}
  ⌛ Total Runtime: ${endTime.diff(startTime, "minutes")}m ${
      endTime.diff(startTime, "seconds") % 60
    }s
  ✅ Successful emails: ${successfulEmails}/${emails.length} emails
  ━━━━━━━━━━━━━━━`;

    await bot.api.sendMessage(debugChannel, completionMessage, {
      parse_mode: "Markdown",
    });
  }

  await browser
    .close()
    .catch((e) => console.error("Error closing browser:", e));
}

start();
