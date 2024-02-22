import { exec } from "child_process";
import { promisify } from "util";

export interface OutdatedPackage {
  package: string;
  current: string;
  wanted: string;
  latest: string;
  upgradeType: "major" | "minor" | "patch";
}

const execAsync = promisify(exec);

export const getOutdatedPackages = async (
  packageManager: "npm" | "yarn" = "yarn"
): Promise<OutdatedPackage[]> => {
  const command =
    packageManager === "npm"
      ? "npx npm outdated --latest --json || true"
      : "yarn outdated --latest --json  || true";
  const { stdout: outdatedRaw } = await execAsync(command, {
    encoding: "utf8",
  });

  if (!outdatedRaw) {
    console.warn("All your dependencies are up to date");

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
