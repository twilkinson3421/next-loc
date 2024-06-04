import chalk, { supportsColor } from "chalk";
import konsole from "chalk-konsole";
import { createMerger } from "smob";
import { replaceMultiple } from "string-replace-utils";

import { localeConfig } from "../config";

import type { NextLocTypes } from "../types";
const merger = createMerger({ priority: "right" });

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

  //^ Merge with Inherited Locales
  for (const i_locale of localeConfig.supported.locales) {
    if (
      i_locale in localeConfig.meta.inherits &&
      Array.isArray(localeConfig.meta.inherits[i_locale])
    ) {
      for (const i_inherited of localeConfig.meta.inherits[
        i_locale
      ].toReversed()) {
        //& Reversed -> Translations from locales at the end of the array have higher priority than those at the start
        dictionary[i_locale] = merger(
          dictionary[i_inherited as NextLocTypes.Locale],
          dictionary[i_locale]
        );
      }
    }
  }

  (() => {
    const globalDictionary = {} as NextLocTypes.GlobalDictionary;

    for (const i_globalNamespace of localeConfig.supported.globalNamespaces) {
      const filePath = replaceMultiple(
        localeConfig.other.dictionaryPath,
        ["{locale}", "{namespace}"] as const,
        ["GLOBAL", i_globalNamespace] as const
      );

      try {
        let fs;
        if (typeof window !== "undefined") throw new Error("Wrong Environment");
        if (typeof window === "undefined") fs = require("fs");
        const fileContents = fs.readFileSync(filePath, "utf8");
        //@ts-ignore - Type Error when no global namespaces are defined (will not be reached)
        globalDictionary[i_globalNamespace] = JSON.parse(fileContents);
      } catch (error) {
        if (supportsColor)
          konsole.err(
            `Failed to fetch global dictionary from file: ${chalk.yellow(
              chalk.italic(filePath)
            )}`,
            (error as any).message || null
          );
      }
    }

    for (const i_locale of localeConfig.supported.locales)
      dictionary[i_locale] = merger(globalDictionary, dictionary[i_locale]);
  })();

  return dictionary;
}

export const dictionary = compileDictionary();
