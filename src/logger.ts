import chalk from "chalk";

const logger = {
  warn: (context: string, message: string) => {
    return console.log(`[${chalk.yellow.bold(context)}]`, chalk.grey(message));
  },
  error: (context: string, message: string) => {
    return console.log(`[${chalk.red.bold(context)}]`, chalk.grey(message));
  },
  success: (context: string, message: string) => {
    return console.log(`[${chalk.green.bold(context)}]`, chalk.grey(message));
  },
  log: (context: string, message: string) => {
    return console.log(
      `[${chalk.blueBright.bold(context)}]`,
      chalk.grey(message)
    );
  },
};

export default logger;
