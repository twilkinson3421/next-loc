#!/usr/bin/env -S npx tsx

import Enquirer from "enquirer";
import fs from "fs";
import path from "path";

const { prompt } = Enquirer;

const { value: useDefault } = await prompt<{ value: boolean }>({
  type: "confirm",
  name: "value",
  message: "Use default config?",
});

const { value: destinationPath } = await prompt<{ value: string }>({
  type: "input",
  name: "value",
  message: "Enter relative path to destination directory",
  initial: "/src/locale",
});

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
    fs.writeFileSync("./source/locale/config.ts", dataToWrite);
  } catch (error) {
    console.error(`Failed to write config file: ${(error as any).message}`);
  }
}

const sourceDir = path.join(import.meta.dirname, "source");
const destinationDir = path.join(process.cwd(), destinationPath);

const destinationDirExists = fs.existsSync(destinationDir);
if (!destinationDirExists) fs.mkdirSync(destinationDir, { recursive: true });

// TODO Copy source files to user's project
// TODO Install dependencies in user's project
