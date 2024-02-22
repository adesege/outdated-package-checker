# outdated-package-checker

A versatile command-line tool to streamline dependency management in your Node.js projects. It supports both npm and Yarn, providing insights into outdated packages and the ability to export the analysis as CSV files.

## Features

-   **Comprehensive Outdated Package Detection:** Accurately pinpoints outdated packages across your project's dependencies.
-   **Upgrade Type Identification:** Differentiates between major, minor, and patch updates for informed decision-making.
-   **CSV Export:** Generates detailed reports in CSV format for further analysis and tracking.
-   **Package Manager Flexibility:** Seamlessly works with both npm and Yarn.
-   **Directory Scanning:** Scans your project structure with customizable exclusions, generating individual CSV reports for each subdirectory containing a `package.json`.
-   **Intelligent Exclusions:** Leverages `.gitignore` patterns and recursive `node_modules` omission to refine the package scanning process.

## Usage

**1\. Basic Report Generation:**

-   Defaults to Yarn:

    ```bash
    npx outdated-package-checker
    ```

-   Specify npm:

    ```bash
    npx outdated-package-checker --package-manager npm
    ```

**2\. Directory Scanning Mode:**

```bash
npx outdated-package-checker --scan-dir
```

**3\. Exclude Directories:**

```bash
npx outdated-package-checker --scan-dir --exclude-dir src,test
```

## CSV Output

-   A CSV file is generated (e.g., `outdated_packages/2024-02-23/<dir basename>.csv`).
-   Files include the directory name where the `package.json` was found for directory scanning mode.
-   Contains the following columns:
    -   `package`
    -   `current`
    -   `wanted`
    -   `latest`
    -   `upgradeType`   

## Configuration

-   **Package Manager:** Use `--package-manager npm` or `--package-manager yarn`.
-   **Directory Scanning:** Enable with `--scan-dir`.
-   **Exclusions:** Use `--exclude-dir` (comma-separated list of directory names).

## Contributing

We welcome contributions to improve this tool! Feel free to open issues for bug reports or feature suggestions. To submit code changes, please follow these steps:

1.  Fork the repository.
2.  Create a new branch.
3.  Make your changes and commit them.
4.  Open a pull request.

## License

This project is released under the MIT License.
