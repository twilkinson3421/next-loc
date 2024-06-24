#!/usr/bin/env node
import Enquirer from "enquirer";
import fs from "fs";
import ora from "ora";
import path from "path";
const { prompt } = Enquirer;
const sourceDir = path.join(import.meta.dirname, "../source");
const args = process.argv.slice(2);
const options = {
  default: args.includes("--default") || args.includes("-d"),
  defaultDestination: args.includes("--default-dir") || args.includes("-dd"),
};
const { value: useDefault } = options.default
  ? { value: true }
  : await prompt({
      type: "confirm",
      name: "value",
      message: "Use default config?",
    });
const { value: destinationPath } = options.defaultDestination
  ? { value: "/src/locale" }
  : await prompt({
      type: "input",
      name: "value",
      message: "Enter path to destination directory",
      initial: "src/locale",
    });
if (useDefault) console.log(`\n`);
if (!useDefault) {
  const { value: locales } = await prompt({
    type: "input",
    name: "value",
    message: "Enter supported locales separated by a space",
    initial: "en-GB",
    validate(value) {
      return !!value.trim().length ? true : "Locales cannot be empty";
    },
  });
  const localesArr = locales.split(" ");
  const { value: defaultLocale } = await prompt({
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
  const { value: localeFormat } = await prompt({
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
  const { value: pathToDictionary } = await prompt({
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
  const { value: cookieName } = await prompt({
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
    globalNamespaces: [],
    defaultLocale: ${JSON.stringify(defaultLocale)},
    defaultNamespace: "common",
    cookieName: ${JSON.stringify(cookieName)},
    localePattern: ${localeFormat},
    dictionaryPath: ${JSON.stringify(pathToDictionary)},
    inherits: {},
    ignoreMiddleware: [
      "/static",
      "/api",
      "/_next",
      "favicon.ico",
      "robots.txt",
      "sitemap.xml",
    ],
    suppress: {
      missingDictionary: false,
      localeSatisfiesPattern: false,
      defaultLocaleIsSupported: false,
    },
    optOutCompression: false,
  }`;
  const dataToWrite = `import { createLocaleConfig } from "./internal/controller";\n\nexport const localeConfig = createLocaleConfig(${configObjectToWrite} as const);`;
  try {
    fs.writeFileSync(path.join(sourceDir, "config.ts"), dataToWrite);
    configSpinner.succeed(`Config file written!`);
  } catch (error) {
    configSpinner.fail(`Failed to write config file: ${error.message}`);
  }
}
const copySpinner = ora(`Copying files...`).start();
const destinationDir = path.join(process.cwd(), destinationPath);
const destinationDirExists = fs.existsSync(destinationDir);
if (!destinationDirExists) fs.mkdirSync(destinationDir, { recursive: true });
function copyFiles(sourceDir, destinationDir) {
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
copySpinner.succeed(`Files copied!`);
console.log(
  `\nRequired dependencies:\n\x1b[34mchalk\nchalk-konsole\nstring-replace-utils\naccept-language\nsmob\x1b[0m`
);
console.log(
  `\nLoad your middleware from \x1b[34m${destinationPath}/middleware/locale\x1b[0m`
);
