import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import exportToCSV from ".";
import logger from "./logger";

const execAsync = promisify(exec);

export interface OutdatedPackage {
  package: string;
  current: string;
  wanted: string;
  latest: string;
  upgradeType: "major" | "minor" | "patch";
}

export const pathPrefix = (append: string) => {
  const today = new Date();
  const dateString =
    today.getFullYear() +
    "-" +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    today.getDate().toString().padStart(2, "0");

  return `outdated-packages/${dateString}/${append}.csv`;
};

export const ensureDirExist = () => {
  fs.mkdirSync(path.join(process.cwd(), path.dirname(pathPrefix(""))), {
    recursive: true,
  });
};

export const getOutdatedPackages = async (
  packageManager: "npm" | "yarn" = "yarn",
  dirPath: string
): Promise<OutdatedPackage[]> => {
  const dir = path.basename(dirPath);

  const command =
    packageManager === "npm"
      ? "npx npm outdated --latest --json || true"
      : "yarn outdated --latest --json  || true";
  const { stdout: outdatedRaw, stderr } = await execAsync(command, {
    encoding: "utf8",
    cwd: dirPath,
  });

  if (stderr) {
    const error = JSON.parse(stderr) as Record<string, string>;

    if (packageManager === "yarn") {
      logger.error(dir, error.data);

      return [];
    }

    logger.error(dir, stderr);
    return [];
  }

  if (!outdatedRaw) {
    logger.warn(dir, "All your dependencies are up to date");

    return [];
  }

  if (packageManager === "npm") {
    return parseNpmOutput(outdatedRaw.trim());
  } else {
    return parseYarnOutput(outdatedRaw.trim());
  }
};

function parseNpmOutput(outdatedRaw: string): OutdatedPackage[] {
  const outdatedJson: Record<string, string>[] = JSON.parse(outdatedRaw);

  const packages: OutdatedPackage[] = Object.entries(
    outdatedJson
  ).map<OutdatedPackage>(([packageName, details]) => {
    return {
      package: packageName,
      current: details.current,
      wanted: details.wanted,
      latest: details.latest,
      upgradeType: determineUpgradeType(details.current, details.latest),
    };
  });

  return packages;
}

const parseYarnOutput = (outdatedRaw: string): OutdatedPackage[] => {
  const outdatedJson: {
    data: { body: [string, string, string, string, string, string][] };
  } = JSON.parse(outdatedRaw.split("\n").pop() || "");

  const packages: OutdatedPackage[] =
    outdatedJson.data.body.map<OutdatedPackage>(
      ([packageName, current, wanted, latest, packageType, url]) => {
        return {
          package: packageName,
          current: current,
          wanted: wanted,
          latest: latest,
          upgradeType: determineUpgradeType(current, latest),
        };
      }
    );

  return packages;
};

const determineUpgradeType = (
  current: string,
  latest: string
): "major" | "minor" | "patch" => {
  const currentParts = current.split(".");
  const latestParts = latest.split(".");

  if (currentParts[0] !== latestParts[0]) {
    return "major";
  } else if (currentParts[1] !== latestParts[1]) {
    return "minor";
  } else {
    return "patch";
  }
};

export const scanDirectory = async (dirPath: string, excludeDirs: string[]) => {
  try {
    let gitignoreContents = getGitignore(dirPath);
    if (!gitignoreContents) {
      gitignoreContents = "-not -path **/node_modules/**"; // Default fallback
    }

    const findCommand = [
      `find ${dirPath}`,
      "-name node_modules -prune -o", // Exclude node_modules recursively
      gitignoreContents,
      "-name package.json -exec dirname {} \\;",
    ].join(" ");

    const { stdout } = await execAsync(findCommand, { encoding: "utf-8" });

    const packageJsonDirs = stdout
      .split("\n")
      .filter(Boolean)
      .filter((dir) => !excludeDirs.includes(dir));

    await Promise.all(
      packageJsonDirs.map(async (dir) => {
        const packageManager = detectPackageManager(dir);
        if (packageManager) {
          const outdatedPackages = await getOutdatedPackages(
            packageManager,
            dir
          );

          exportToCSV(outdatedPackages, pathPrefix(path.basename(dir)));
        }
      })
    );
  } catch (err) {
    logger.error(path.basename(dirPath), `Error scanning directory: ${err}`);
  }
};

const detectPackageManager = (dirPath: string): "npm" | "yarn" | null => {
  if (fs.existsSync(`${dirPath}/package-lock.json`)) {
    return "npm";
  } else if (fs.existsSync(`${dirPath}/yarn.lock`)) {
    return "yarn";
  } else {
    return null;
  }
};

function getGitignore(dirPath: string): string | null {
  const gitignorePath = `${dirPath}/.gitignore`;
  if (!fs.existsSync(gitignorePath)) {
    const mainGitignore = findMainGitignore(dirPath);
    return mainGitignore
      ? `-not -path '*/${mainGitignore.replace(/^\./, "")}'`
      : null; // Exclude main gitignore itself
  }

  const gitignoreLines = fs.readFileSync(gitignorePath, "utf-8").split("\n");
  return gitignoreLines
    .map(
      (line) => `-not -path '*/${dirPath}/${line.trim().replace(/^\./, "")}'`
    )
    .join(" ");
}

function findMainGitignore(dirPath: string): string | null {
  let parentDir = dirPath;
  while (true) {
    const gitignorePath = `${parentDir}/.gitignore`;
    if (fs.existsSync(gitignorePath)) {
      return gitignorePath;
    }

    // Check if we've reached the root
    const newParent = parentDir.substring(0, parentDir.lastIndexOf("/"));
    if (newParent === parentDir) break;
    parentDir = newParent;
  }
  return null;
}
