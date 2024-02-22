#!/usr/bin/env node
const minimist = require("minimist");
const { getOutdatedPackages } = require("../dist/utils");
const exportToCSV = require("../dist/index");

const args = minimist(process.argv.slice(2));
const packageManager = args["package-manager"] || args["pm"] || "yarn";

getOutdatedPackages(packageManager).then((outdatedPackages) => {
  exportToCSV.default(outdatedPackages);
});
