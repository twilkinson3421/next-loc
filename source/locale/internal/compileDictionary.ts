import chalk, { supportsColor } from "chalk";
import konsole from "chalk-konsole";
import { replaceMultiple } from "string-replace-utils";

import { localeConfig } from "../config";

import type { NextLocTypes } from "../types";

function compileDictionary() {
  if (typeof window !== "undefined") return undefined;
  const dictionary = {} as NextLocTypes.Dictionary;

  for (const i_locale of localeConfig.supported.locales) {
    const localeDictionary = {} as NextLocTypes.LocaleDictionary;

    for (const i_namespace of localeConfig.supported.namespaces) {
      const filePath = replaceMultiple(
        localeConfig.other.dictionaryPath,
        ["{locale}", "{namespace}"] as const,
        [i_locale, i_namespace] as const
      );

      try {
        let fs;
        if (typeof window !== "undefined") throw new Error("Wrong Environment");
        if (typeof window === "undefined") fs = require("fs");
        const fileContents = fs.readFileSync(filePath, "utf8");
        localeDictionary[i_namespace] = JSON.parse(fileContents);
      } catch (error) {
        if (supportsColor)
          konsole.err(
            `Failed to fetch dictionary from file: ${chalk.yellow(
              chalk.italic(filePath)
            )}`,
            (error as any).message || null
          );
      }
    }

    dictionary[i_locale] = localeDictionary;
  }

  return dictionary;
}

export const dictionary = compileDictionary();
