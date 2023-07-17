const logging = require("logging");
const moment = require("moment");
const request = require("request");
const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { ServiceBuilder } = require("selenium-webdriver/chrome");
const webdriver = require("selenium-webdriver");

const USERNAME = "<username>";
const PASSWORD = "<pwd>";
const SCHEDULE = "<schedule number>";
const COUNTRY_CODE = "en-et";
const FACILITY_ID = "<facility id>";

const MY_SCHEDULE_DATE = "<your already scheduled date>"; // 2022-05-16 WARNING: DON'T CHOOSE DATE LATER THAN ACTUAL SCHEDULED
const MY_CONDITION = (month, day) => true; // MY_CONDITION = (month, day) => parseInt(month) === 11 && parseInt(day) >= 5

const SLEEP_TIME = 60; // recheck time interval

const DATE_URL = `https://ais.usvisa-info.com/${COUNTRY_CODE}/niv/schedule/${SCHEDULE}/appointment/days/${FACILITY_ID}.json?appointments[expedite]=false`;
const TIME_URL = `https://ais.usvisa-info.com/${COUNTRY_CODE}/niv/schedule/${SCHEDULE}/appointment/times/${FACILITY_ID}.json?date=%s&appointments[expedite]=false`;
const APPOINTMENT_URL = `https://ais.usvisa-info.com/${COUNTRY_CODE}/niv/schedule/${SCHEDULE}/appointment`;
let EXIT = false;

const service = new ServiceBuilder().build();
const options = new chrome.Options();
options.addArguments("--headless");
const driver = new webdriver.Builder()
  .forBrowser("chrome")
  .setChromeOptions(options)
  .setChromeService(service)
  .build();

logging.basicConfig(
  (level = logging.INFO),
  (filename = "visa.log"),
  (filemode = "a+"),
  (format = "%(asctime)-15s %(levelname)-8s %(message)s")
);

async function login() {
  // Bypass reCAPTCHA
  await driver.get(`https://ais.usvisa-info.com/${COUNTRY_CODE}/niv`);
  await driver.sleep(1000);
  const a = await driver.findElement(
    By.xpath('//a[@class="down-arrow bounce"]')
  );
  await a.click();
  await driver.sleep(1000);

  logging.info("start sign");
  const href = await driver.findElement(
    By.xpath('//*[@id="header"]/nav/div[2]/div[1]/ul/li[3]/a')
  );
  await href.click();
  await driver.sleep(1000);
  await driver.wait(until.elementLocated(By.name("commit")), 60000);

  logging.info("click bounce");
  const b = await driver.findElement(
    By.xpath('//a[@class="down-arrow bounce"]')
  );
  await b.click();
  await driver.sleep(1000);

  await do_login_action();
}

async function do_login_action() {
  logging.info("input email");
  const user = await driver.findElement(By.id("user_email"));
  await user.sendKeys(USERNAME);
  await driver.sleep(Math.floor(Math.random() * 3000) + 1000);

  logging.info("input pwd");
  const pw = await driver.findElement(By.id("user_password"));
  await pw.sendKeys(PASSWORD);
  await driver.sleep(Math.floor(Math.random() * 3000) + 1000);

  logging.info("click privacy");
  const box = await driver.findElement(By.className("icheckbox"));
  await box.click();
  await driver.sleep(Math.floor(Math.random() * 3000) + 1000);

  logging.info("commit");
  const btn = await driver.findElement(By.name("commit"));
  await btn.click();
  await driver.sleep(Math.floor(Math.random() * 3000) + 1000);

  try {
    await driver.wait(
      until.elementLocated(By.xpath("//a[contains(text(),'Continue')]")),
      15000
    );
    logging.info("Login successfully!");
  } catch (error) {
    logging.warning("Login failed!");
    await login();
  }
}

async function get_date() {
  await driver.get(DATE_URL);
  if (!is_logined()) {
    await login();
    return await get_date();
  } else {
    const content = await driver.findElement(By.tagName("pre")).getText();
    const date = JSON.parse(content);
    return date;
  }
}

async function get_time(date) {
  const time_url = TIME_URL.replace("%s", date);
  await driver.get(time_url);
  const content = await driver.findElement(By.tagName("pre")).getText();
  const data = JSON.parse(content);
  const time = data.available_times[data.available_times.length - 1];
  logging.info("Get time successfully!");
  return time;
}

async function reschedule(date) {
  global.EXIT;
  logging.info("Start Reschedule");

  const time = await get_time(date);
  await driver.get(APPOINTMENT_URL);

  const data = {
    utf8: await driver.findElement(By.name("utf8")).getAttribute("value"),
    authenticity_token: await driver
      .findElement(By.name("authenticity_token"))
      .getAttribute("value"),
    confirmed_limit_message: await driver
      .findElement(By.name("confirmed_limit_message"))
      .getAttribute("value"),
    use_consulate_appointment_capacity: await driver
      .findElement(By.name("use_consulate_appointment_capacity"))
      .getAttribute("value"),
    "appointments[consulate_appointment][facility_id]": FACILITY_ID,
    "appointments[consulate_appointment][date]": date,
    "appointments[consulate_appointment][time]": time,
  };

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36",
    Referer: APPOINTMENT_URL,
    Cookie:
      "_yatri_session=" +
      (await driver.manage().getCookie("_yatri_session"))["value"],
  };

  const options = {
    url: APPOINTMENT_URL,
    headers: headers,
    form: data,
  };

  request.post(options, (error, response, body) => {
    if (body.includes("Successfully Scheduled")) {
      logging.info("Successfully Rescheduled");
      EXIT = true;
      const [year, month, day] = date.split("-");
      if (MY_CONDITION(month, day)) {
        last_seen = date;
        return date;
      }
    }
  });
  return null;
}

async function main() {
  await login();
  let retry_count = 0;

  while (true) {
    if (retry_count > 6) {
      break;
    }

    try {
      logging.info(moment().format());
      logging.info("------------------");

      const dates = await get_date();
      print_date(dates);
      const date = get_available_date(dates);

      if (date) {
        await reschedule(date);
      }

      if (EXIT) {
        break;
      }

      await driver.sleep(SLEEP_TIME * 1000);
    } catch (error) {
      retry_count += 1;
      await driver.sleep(60 * 1000 * 5);
    }
  }

  await driver.quit();
}

main().catch((error) => {
  console.error("An error occurred:", error);
});
