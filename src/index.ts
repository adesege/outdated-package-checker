import csv from "csv-stringify";
import fs from "fs";
import path from "path";
import logger from "./logger";
import { OutdatedPackage, ensureDirExist } from "./utils";

const exportToCSV = (packages: OutdatedPackage[], filename: string) => {
  if (!packages.length) {
    return;
  }

  csv.stringify(
    packages,
    {
      header: true,
      columns: ["package", "current", "wanted", "latest", "upgradeType"],
    },
    (err, csvData) => {
      if (err) throw err;

      ensureDirExist();

      fs.writeFileSync(filename, csvData);
      logger.success(
        path.basename(filename, ".csv"),
        `Report saved to ${filename}`
      );
    }
  );
};

export default exportToCSV;
