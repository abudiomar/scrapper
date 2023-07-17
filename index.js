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
function checkAppointmentUpdates(account, callback) {
  // Log in to the website
  axios
    .post("https://ais.usvisa-info.com/en-et/niv/users/sign_in", {
      user: {
        login: account.username,
        password: account.password,
      },
    })
    .then((response) => {
      const cookies = response.headers["set-cookie"];

      // Make a GET request to the appointment page
      axios
        .get(
          "https://ais.usvisa-info.com/en-et/niv/schedule/32514956/appointment/dates",
          {
            headers: {
              Cookie: cookies,
            },
          }
        )
        .then((response) => {
          const $ = cheerio.load(response.data);

          // Extract appointment availability information
          const availableAppointments = [];
          $(".date.status-appointment").each((index, element) => {
            availableAppointments.push($(element).attr("data-date"));
          });

          // Return the update
          callback(null, {
            account: account.username,
            appointments: availableAppointments,
          });
        })
        .catch((error) => {
          callback(error);
        });
    })
    .catch((error) => {
      callback(error);
    });
}

// Run the scraper
async.eachSeries(
  accounts,
  (account, callback) => {
    checkAppointmentUpdates(account, (error, result) => {
      if (error) {
        console.error(`Error for ${account.username}: ${error.message}`);
      } else {
        console.log(
          `Update for ${result.account}: ${result.appointments.length} new appointments`
        );
      }
      setTimeout(callback, 30000); // Wait 30 seconds before the next login
    });
  },
  (error) => {
    if (error) {
      console.error(`Scraping encountered an error: ${error.message}`);
    } else {
      console.log("Scraping completed");
    }
  }
);
