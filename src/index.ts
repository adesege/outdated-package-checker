import { randomBytes } from "crypto";
import csv from "csv-stringify";
import fs from "fs";
import path from "path";
import { OutdatedPackage } from "./utils";

const exportToCSV = (packages: OutdatedPackage[]) => {
  const today = new Date();
  const dateString =
    today.getFullYear() +
    "-" +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    today.getDate().toString().padStart(2, "0");

  const randomString = randomBytes(2).toString("hex");

  const filename = `outdated-packages/${dateString}/${randomString}.csv`;

  csv.stringify(
    packages,
    {
      header: true,
      columns: ["package", "current", "wanted", "latest", "upgradeType"],
    },
    (err, csvData) => {
      if (err) throw err;

      fs.mkdirSync(path.join(process.cwd(), path.dirname(filename)), {
        recursive: true,
      });

      fs.writeFileSync(filename, csvData);
      console.log(`Outdated packages report saved to ${filename}`);
    }
  );
};

export default exportToCSV;
