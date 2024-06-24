import chalk, { supportsColor } from "chalk";
import konsole from "chalk-konsole";
import { createMerger } from "smob";
import { replaceMultiple } from "string-replace-utils";

import { localeConfig } from "../config";
import { compressFunction } from "./compression";
import { GLOBAL_DICT_DIR_NAME } from "./constants";
import { getShouldSuppressENOENT } from "./utils";

import type { NextLocTypes } from "../types";

const merger = createMerger({ priority: "right" });

type Return = typeof localeConfig.other.optOutCompression extends true
  ? NextLocTypes.Dictionary
  : NextLocTypes.CompressedDictionary;

function compileDictionary(): Return | undefined {
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
        if (
          getShouldSuppressENOENT(i_locale) &&
          (error as any)?.code === "ENOENT"
        )
          continue;

        if (supportsColor)
          konsole.err(
            `Failed to fetch dictionary from file: ${chalk.yellow(
              chalk.italic(filePath)
            )}`,
            (error as any)?.message ?? null
          );
      }
    }

    dictionary[i_locale] = localeDictionary;
  }

  //^ Merge with Inherited Locales
  for (const i_locale of localeConfig.supported.locales) {
    if (
      i_locale in localeConfig.meta.inherits &&
      //@ts-ignore
      Array.isArray(localeConfig.meta.inherits[i_locale])
    ) {
      //@ts-ignore
      for (const i_inherited of localeConfig.meta.inherits[
        i_locale
      ].reverse()) {
        //^ Reversed -> Locales at the end of the array have higher priority than those at the start
        dictionary[i_locale] = merger(
          dictionary[i_inherited as NextLocTypes.Locale],
          dictionary[i_locale]
        );
      }
    }
  }

  //^ Merge with Global Dictionaries
  (() => {
    const globalDictionary = {} as NextLocTypes.GlobalDictionary;

    for (const i_globalNamespace of localeConfig.supported.globalNamespaces) {
      const filePath = replaceMultiple(
        localeConfig.other.dictionaryPath,
        ["{locale}", "{namespace}"] as const,
        [GLOBAL_DICT_DIR_NAME, i_globalNamespace] as const
      );

      try {
        let fs;
        if (typeof window !== "undefined") throw new Error("Wrong Environment");
        if (typeof window === "undefined") fs = require("fs");
        const fileContents = fs.readFileSync(filePath, "utf8");
        (globalDictionary as any)[i_globalNamespace] = JSON.parse(fileContents);
      } catch (error) {
        if (
          getShouldSuppressENOENT(GLOBAL_DICT_DIR_NAME) &&
          (error as any)?.code === "ENOENT"
        )
          continue;

        if (supportsColor)
          konsole.err(
            `Failed to fetch global dictionary from file: ${chalk.yellow(
              chalk.italic(filePath)
            )}`,
            (error as any)?.message ?? null
          );
      }
    }

    for (const i_locale of localeConfig.supported.locales)
      dictionary[i_locale] = merger(globalDictionary, dictionary[i_locale]);
  })();

  //@ts-ignore
  if (localeConfig.other.optOutCompression) return dictionary;
  const compressedDictionary = compressFunction(JSON.stringify(dictionary));
  //@ts-ignore
  return compressedDictionary;
}

export const dictionary = compileDictionary();
