#!/usr/bin/env node
const minimist = require("minimist");
const path = require("path");
const {
  getOutdatedPackages,
  scanDirectory,
  pathPrefix,
} = require("../dist/utils");
const exportToCSV = require("../dist/index");

const args = minimist(process.argv.slice(2));
const scanDir = args["scan-dir"];
const excludeDirs = args["exclude-dir"] ? args["exclude-dir"].split(",") : [];
const cwd = process.cwd();

if (scanDir) {
  scanDirectory(cwd, excludeDirs);
} else {
  const packageManager = args["package-manager"] || args["pm"] || "yarn";
  getOutdatedPackages(packageManager, cwd).then((outdatedPackages) => {
    exportToCSV.default(outdatedPackages, pathPrefix(path.basename(cwd)));
  });
}
