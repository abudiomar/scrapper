const puppeteer = require("puppeteer");

const accounts = [
  "account1@gmail.com",
  "account2@gmail.com",
  "account3@gmail.com",
  "account4@gmail.com",
  "account5@gmail.com",
];
const website = "https://ais.usvisa-info.com/en-et/niv/users/sign_in";

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function scrapeWebsiteSync() {
  puppeteer
    .launch({ headless: true }) // Change 'headless' to 'false' if you want to see the browser window
    .then(async (browser) => {
      const page = await browser.newPage();
      let accountIndex = 0;

      for (let i = 0; i < 2; i++) {
        const currentAccount = accounts[accountIndex];

        // Go to the login page
        await page.goto(website);

        // Fill in the login form
        await page.type("#user_email", currentAccount);
        await page.type("#user_password", "your_password"); // Replace 'your_password' with the actual password

        // Submit the form
        await Promise.all([
          page.waitForNavigation(), // Wait for navigation to complete
          page.click('button[type="submit"]'), // Click the submit button
        ]);

        // Check for appointment updates
        const updates = await page.evaluate(() => {
          const updateElements = document.querySelectorAll(".update"); // Assuming updates are represented by elements with the class 'update'
          const updates = [];

          for (let element of updateElements) {
            updates.push(element.innerText);
          }

          return updates;
        });

        // Output updates, if any
        if (updates.length > 0) {
          console.log(`Updates for account ${currentAccount}:`, updates);
        } else {
          console.log(`No updates for account ${currentAccount}.`);
        }

        accountIndex = (accountIndex + 1) % accounts.length;

        // Wait for 30 seconds before the next login attempt
        await delay(30000);
      }

      await browser.close();
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
}

scrapeWebsiteSync();
