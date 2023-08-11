const puppeteer = require("puppeteer");
const fs = require("fs");
const ExcelJS = require("exceljs");

async function scrapeColleges() {
  try {
    const jsonData = fs.readFileSync("colleges.json", "utf8");
    const colleges = JSON.parse(jsonData);
    const newCollegesData = [];

    let totalMinGpa = 0;
    let numScholarships = 0;

    const browser = await puppeteer.launch();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Colleges");

    worksheet.addRow([
      "Name",
      "Type",
      "Enrollment",
      "Tuition and Fees",
      "Total Cost In-State On-Campus",
      "Total Cost Out-State On-Campus",
      "Degrees",
      "Majors",
      "Average Min GPA",
    ]);

    for (const college of colleges) {
      try {
        const page = await browser.newPage(); // Create a new page
        await page.goto(`https://www.free-4u.com/Colleges/${college.link}`);

        const collegeName = await page.$eval("h1", (h1) => h1.textContent);

        // Use page.evaluate to extract the desired information
        const enrollment = await page.evaluate(() => {
          const enrollmentElement = Array.from(
            document.querySelectorAll("p")
          ).find((p) => p.textContent.includes("Enrollment:"));
          return enrollmentElement
            ? enrollmentElement.querySelector("strong").textContent
            : "";
        });

        const type = await page.evaluate(() => {
          const typeElement = Array.from(document.querySelectorAll("p")).find(
            (p) => p.textContent.includes("Type:")
          );
          return typeElement
            ? typeElement.querySelector("strong").textContent
            : "";
        });

        const tuitionAndFees = await page.evaluate(() => {
          const tuitionElement = Array.from(
            document.querySelectorAll("p")
          ).find((p) => p.textContent.includes("Tuition and fees:"));
          return tuitionElement
            ? tuitionElement.querySelector("strong").textContent
            : "";
        });

        const totalCostInStateOnCampus = await page.evaluate(() => {
          const costInStateElement = Array.from(
            document.querySelectorAll("p")
          ).find((p) =>
            p.textContent.includes("Total Cost In-State On-Campus:")
          );
          return costInStateElement
            ? costInStateElement.querySelector("strong").textContent
            : "";
        });

        const totalCostOutStateOnCampus = await page.evaluate(() => {
          const costOutStateElement = Array.from(
            document.querySelectorAll("p")
          ).find((p) =>
            p.textContent.includes("Total Cost Out-State On-Campus:")
          );
          return costOutStateElement
            ? costOutStateElement.querySelector("strong").textContent
            : "";
        });

        const degrees = await page.evaluate(() => {
          const degreesElement = document.querySelector(
            "a[name='degrees'] + div dl"
          );
          if (degreesElement) {
            const degreeNodes = Array.from(
              degreesElement.querySelectorAll("dd")
            );
            return degreeNodes.map((node) => node.textContent.trim());
          }
          return [];
        });

        const majors = await page.evaluate(() => {
          const majorsElement = document.querySelector(
            "a[name='majors'] + div dl"
          );
          if (majorsElement) {
            const majorNodes = Array.from(majorsElement.querySelectorAll("dd"));
            return majorNodes.map((node) => node.textContent.trim());
          }
          return [];
        });

        const scholarships = await page.evaluate(() => {
          const scholarshipElements = Array.from(
            document.querySelectorAll(".row.odd")
          );

          return scholarshipElements.map((scholarshipElement) => {
            const description = scholarshipElement
              .querySelector(".small-8.large-8.columns")
              .textContent.trim();

            // Extract minimum GPA from the description
            const minGpaMatch = description.match(/minimum (\d+\.\d+) GPA/i);
            const minGpa = minGpaMatch ? parseFloat(minGpaMatch[1]) : null;

            return minGpa;
          });
        });

        scholarships.forEach((minGpa) => {
          if (minGpa !== null) {
            totalMinGpa += minGpa;
            numScholarships++;
          }
        });

        const newCollegeInfo = {
          name: collegeName,
          type: type,
          enrollment: enrollment,
          tuitionAndFees: tuitionAndFees,
          totalCostInStateOnCampus: totalCostInStateOnCampus,
          totalCostOutStateOnCampus: totalCostOutStateOnCampus,
          degrees: degrees,
          majors: majors,
          MinGPA: totalMinGpa / numScholarships,
        };

        newCollegesData.push(newCollegeInfo);

        worksheet.addRow([
          newCollegeInfo.name,
          newCollegeInfo.type,
          newCollegeInfo.enrollment,
          newCollegeInfo.tuitionAndFees,
          newCollegeInfo.totalCostInStateOnCampus,
          newCollegeInfo.totalCostOutStateOnCampus,
          newCollegeInfo.degrees.join(", "),
          newCollegeInfo.majors.join(", "),
          newCollegeInfo.MinGPA,
        ]);
      } catch (error) {
        console.error(`Error scraping ${college.name}: ${error.message}`);
      }
    }

    await browser.close();

    await workbook.xlsx.writeFile("CollegesData.xlsx");
    console.log("CollegesData.xlsx created successfully.");
  } catch (error) {
    console.error("Error reading colleges.json:", error.message);
  }
}

scrapeColleges();
