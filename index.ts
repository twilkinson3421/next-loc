#!/usr/bin/env -S npx tsx

import { exec } from "child_process";
import Enquirer from "enquirer";
import fs from "fs";
import ora from "ora";
import path from "path";

const { prompt } = Enquirer;

const args = process.argv.slice(2);

const options = {
  default: args.includes("--default") || args.includes("-d"),
  manualInstall: args.includes("--manual") || args.includes("-m"),
  defaultDestination: args.includes("--default-dest") || args.includes("-dd"),
};

const { value: useDefault } = options.default
  ? { value: true }
  : await prompt<{ value: boolean }>({
      type: "confirm",
      name: "value",
      message: "Use default config?",
    });

const { value: destinationPath } = options.defaultDestination
  ? { value: "/src/locale" }
  : await prompt<{ value: string }>({
      type: "input",
      name: "value",
      message: "Enter relative path to destination directory",
      initial: "/src/locale",
    });

if (useDefault) console.log(`\n`);

if (!useDefault) {
  const { value: locales } = await prompt<{ value: string }>({
    type: "input",
    name: "value",
    message: "Enter supported locales separated by a space",
    initial: "en-GB",
    validate(value) {
      return !!value.trim().length ? true : "Locales cannot be empty";
    },
  });

  const localesArr = locales.split(" ");

  const { value: defaultLocale } = await prompt<{ value: string }>({
    type: "input",
    name: "value",
    message: "Enter default locale",
    initial: localesArr[0],
    validate(value) {
      if (!value.trim().length) return "Default locale cannot be empty";
      if (!localesArr.includes(value))
        return "Default locale must be included as a supported locale";

      return true;
    },
  });

  const { value: localeFormat } = await prompt<{ value: string }>({
    type: "input",
    name: "value",
    message:
      "Enter locale format as a regular expression (this can be changed later)",
    initial: "/[a-z]{2}-[A-Z]{2}/",
    validate(value) {
      try {
        if (!value.trim().length)
          throw new Error("Locale format cannot be empty");
        new RegExp(value.slice(1, -1));
        return true;
      } catch (error) {
        return "Invalid regular expression (use default to skip and set later)";
      }
    },
  });

  const { value: pathToDictionary } = await prompt<{ value: string }>({
    type: "input",
    name: "value",
    message: "Enter path to dictionary",
    initial: "src/locale/dictionary/{locale}/{namespace}.json",
    validate(value) {
      return !!value.trim().length
        ? true
        : "Path to dictionary cannot be empty";
    },
  });

  const { value: cookieName } = await prompt<{ value: string }>({
    type: "input",
    name: "value",
    message: "Enter cookie name",
    initial: "hl",
    validate(value) {
      return !!value.trim().length ? true : "Cookie name cannot be empty";
    },
  });

  console.log(`\n`);
  const configSpinner = ora(`Writing config file...`).start(); //^ Start spinner

  const configObjectToWrite = `{
    supportedLocales: ${JSON.stringify(localesArr).replaceAll(",", ", ")},
    supportedNamespaces: ["common"],
    defaultLocale: ${JSON.stringify(defaultLocale)},
    defaultNamespace: "common",
    cookieName: ${JSON.stringify(cookieName)},
    localePattern: ${localeFormat},
    dictionaryPath: ${JSON.stringify(pathToDictionary)},
    ignoreMiddleware: [
      "/static",
      "/api",
      "/_next",
      "favicon.ico",
      "robots.txt",
      "sitemap.xml",
    ],
  }`;

  const dataToWrite = `import { createLocaleConfig } from "./internal/controller";\n\nexport const localeConfig = createLocaleConfig(${configObjectToWrite} as const);`;

  try {
    fs.writeFileSync("source/config.ts", dataToWrite);
  } catch (error) {
    console.error(`Failed to write config file: ${(error as any).message}`);
  }

  configSpinner.succeed(`Config file written!`); //^ Stop spinner
}

const copySpinner = ora(`Copying files...`).start(); //^ Start spinner
const sourceDir = path.join(import.meta.dirname, "source");
const destinationDir = path.join(process.cwd(), destinationPath);

const destinationDirExists = fs.existsSync(destinationDir);
if (!destinationDirExists) fs.mkdirSync(destinationDir, { recursive: true });

function copyFiles(sourceDir: string, destinationDir: string) {
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const destinationPath = path.join(destinationDir, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      fs.mkdirSync(destinationPath, { recursive: true });
      copyFiles(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

copyFiles(sourceDir, destinationDir);
copySpinner.succeed(`Files copied!`); //^ Stop spinner

if (!options.manualInstall) {
  const installSpinner = ora(`Installing dependencies...`).start(); //^ Start spinner

  exec(
    "npm install --save chalk-konsole accept-language && npm install --save-dev rolling-ts-utils",
    { cwd: process.cwd() },
    (error, stdout, stderr) => {
      if (error || stderr) {
        console.error(
          `An error occurred while installing dependencies:\n\x1b[34mchalk-konsole\x1b[0m\n\x1b[34mrolling-ts-utils\x1b[0m`
        );
        return;
      }

      installSpinner.succeed(`Dependencies installed!`); //^ Stop spinner
    }
  );
}

console.log(
  `\nLoad your middleware from \x1b[34m${destinationPath}/middleware/locale\x1b[0m`
);
