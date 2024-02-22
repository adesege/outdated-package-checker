# outdated-package-checker

A command-line tool to easily identify and export a list of outdated dependencies in your Node.js projects, supporting both npm and Yarn package managers.

## Features

-   Accurate outdated package detection
-   Differentiates between major, minor, and patch updates
-   Export results to a CSV file for further analysis
-   Flexible package manager selection (npm or Yarn)
-   Easy-to-use command-line interface

## Usage

1.  Generate Report:

    ```bash
    npx outdated-package-checker # (Defaults to Yarn)
    npx outdated-package-checker --package-manager npm
    ```

    This will create a CSV file named `outdated_packages/YYYY-MM-DD/{randomString}.csv`.

## Example CSV Output

```
package,current,wanted,latest,upgradeType
lodash,4.17.21,4.17.21,4.17.30,patch
express,4.10.2,4.10.2,4.17.3,minor
```

## Configuration

The `--package-manager` option allows you to specify either 'npm' or 'yarn'.

## Contributing

We welcome contributions! Feel free to open issues or submit pull requests.

## License

This project is released under the MIT License.

