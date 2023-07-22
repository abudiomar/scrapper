// Import required modules
const axios = require("axios"); // HTTP client for making requests
const cheerio = require("cheerio"); // A library to parse and manipulate HTML
const async = require("async"); // A utility module for managing asynchronous operations
const { accounts } = require("./email"); // Import account credentials from the email.js file

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

    const cookies = loginResponse.headers["set-cookie"]; // Extract the cookies from the login response

    // Make a GET request to the appointment page
    const appointmentResponse = await axios.get(
      `https://ais.usvisa-info.com/en-et/niv/schedule/47959065/appointment/dates`, // URL for the appointment page but here we need the appointment id for each account
      {
        headers: {
          Cookie: cookies, // Attach the cookies obtained from the login to the request headers
        },
      }
    );

    const $ = cheerio.load(appointmentResponse.data); // Load the HTML data from the appointment page using Cheerio

    // Extract appointment availability information
    const availableAppointments = [];
    $(".date.status-appointment").each((index, element) => {
      availableAppointments.push($(element).attr("data-date")); // Extract the appointment dates and add them to the availableAppointments array
    });

    return {
      account: account.username,
      appointments: availableAppointments, // Return the array of available appointments for the account
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
      const result = await checkAppointmentUpdates(account); // Call the checkAppointmentUpdates function for each account
      console.log(
        `Update for ${result.account}: ${result.appointments.length} new appointments`
      );
    } catch (error) {
      console.error(`Error for ${account.username}: ${error.message}`);
    }
    await delay(30000); // Wait 30 seconds before checking the next account to avoid making too many requests too quickly
  }
  console.log("Scraping completed"); // Indicate that the scraping process is completed
})();

// Helper function to introduce delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms)); // A utility function to pause execution for the specified number of milliseconds
}
