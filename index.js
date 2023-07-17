const axios = require("axios");
const cheerio = require("cheerio");
const async = require("async");

// Define account credentials
const accounts = [
  { username: "account1", password: "password1" },
  { username: "account2", password: "password2" },
  { username: "account3", password: "password3" },
  { username: "account4", password: "password4" },
  { username: "account5", password: "password5" },
];

// Function to log in and check for appointment updates
async function checkAppointmentUpdates(account) {
  try {
    // Log in to the website
    const loginResponse = await axios.post(
      "https://ais.usvisa-info.com/en-et/niv/users/sign_in",
      {
        user: {
          login: account.username,
          password: account.password,
        },
      }
    );

    const cookies = loginResponse.headers["set-cookie"];

    // Make a GET request to the appointment page
    const appointmentResponse = await axios.get(
      "https://ais.usvisa-info.com/en-et/niv/schedule/32514956/appointment/dates",
      {
        headers: {
          Cookie: cookies,
        },
      }
    );

    const $ = cheerio.load(appointmentResponse.data);

    // Extract appointment availability information
    const availableAppointments = [];
    $(".date.status-appointment").each((index, element) => {
      availableAppointments.push($(element).attr("data-date"));
    });

    return {
      account: account.username,
      appointments: availableAppointments,
    };
  } catch (error) {
    throw error;
  }
}

// Run the scraper
(async function () {
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    try {
      const result = await checkAppointmentUpdates(account);
      console.log(
        `Update for ${result.account}: ${result.appointments.length} new appointments`
      );
    } catch (error) {
      console.error(`Error for ${account.username}: ${error.message}`);
    }
    await delay(30000); // Wait 30 seconds before the next login
  }
  console.log("Scraping completed");
})();

// Helper function to introduce delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
