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

type AllLocales = typeof localeConfig.supported.locales;
type AllNamespaces =
  | typeof localeConfig.supported.namespaces
  | typeof localeConfig.supported.globalNamespaces;

export type CompiledDictionary<
  SelectedLocales extends Readonly<NextLocTypes.Locale[]> = AllLocales,
  SelectedNamespaces extends Readonly<NextLocTypes.UnionRootNamespace[]> = AllNamespaces
> = typeof localeConfig.other.optOutCompression extends true
  ? NextLocTypes.PrundedDictionary<
      SelectedLocales[number][],
      SelectedNamespaces[number][]
    >
  : NextLocTypes.CompressedDictionary;

export type DictionaryCompilationOptions = Readonly<{
  locales: NextLocTypes.Locale[];
  namespaces: NextLocTypes.UnionRootNamespace[];
}>;

type X = ["xyz", "abc", "xyz"];

export function compileDictionary<Options extends DictionaryCompilationOptions>(
  options?: Options
): CompiledDictionary<Options["locales"], Options["namespaces"]> | undefined {
  if (typeof window !== "undefined") return undefined;

  const localesToUse = [...new Set(options?.locales ?? localeConfig.supported.locales)];
  const namespacesToUse = [
    ...new Set(options?.namespaces ?? localeConfig.supported.namespaces),
  ];

  type ThisReturnValue = CompiledDictionary<
    typeof localesToUse,
    typeof namespacesToUse
  >;

  const dictionary = {} as NextLocTypes.PrundedDictionary<
    (typeof localesToUse)[number][],
    (typeof namespacesToUse)[number][]
  >;

  for (const i_locale of localesToUse) {
    const localeDictionary = {} as NextLocTypes.PrunedLocaleDictionary<
      (typeof namespacesToUse)[number][]
    >;

    for (const i_namespace of namespacesToUse) {
      if (!(localeConfig.supported.namespaces as any).includes(i_namespace as any))
        continue;

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
        if (getShouldSuppressENOENT(i_locale) && (error as any)?.code === "ENOENT")
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

  //* Merge with Inherited Locales
  for (const i_locale of localesToUse) {
    if (
      i_locale in localeConfig.meta.inherits &&
      Array.isArray((localeConfig.meta.inherits as any)[i_locale])
    ) {
      for (const i_inherited of (localeConfig.meta.inherits as any)[
        i_locale
      ].reverse()) {
        //* Reversed -> Locales at the end of the array have higher priority than those at the start
        dictionary[i_locale] = merger(
          dictionary[i_inherited as NextLocTypes.Locale],
          dictionary[i_locale]
        );
      }
    }
  }

  //* Merge with Global Dictionaries
  (() => {
    const globalDictionary = {} as NextLocTypes.GlobalDictionary;

    for (const i_globalNamespace of namespacesToUse) {
      if (
        !(localeConfig.supported.globalNamespaces as any).includes(
          i_globalNamespace as any
        )
      )
        continue;

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

    for (const i_locale of localesToUse)
      dictionary[i_locale] = merger(globalDictionary, dictionary[i_locale]);
  })();

  if (localeConfig.other.optOutCompression) return dictionary as any as ThisReturnValue;
  const compressedDictionary = compressFunction(JSON.stringify(dictionary));
  return compressedDictionary as any as ThisReturnValue;
}
