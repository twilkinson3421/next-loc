import chalk from "chalk";
import konsole from "chalk-konsole";

import { localeConfig } from "./config";
import { useLocaleContext } from "./context/provider";
import { LocalisedString } from "./internal/class";
import { dictionary } from "./internal/compileDictionary";
import { decompressFunction } from "./internal/compression";

import type { NextLocTypes } from "./types";

function getTranslation(
  key: string,
  overrideDictionary?: NextLocTypes.ThisDictionaryType
) {
  const segments = key.split(".");
  let translation = (overrideDictionary ?? dictionary!) as any;
  if (!translation) throw new Error("No dictionary provided");

  if (typeof translation === "string")
    translation = JSON.parse(decompressFunction(translation));

  for (const i_segment of segments) {
    if (!(typeof translation === "object" && i_segment in translation))
      return undefined;
    translation = translation[i_segment];
  }

  if (typeof translation === "string") return new LocalisedString(translation);
  throw new Error("Translation not found");
}

export function translate(
  key: string,
  overrideDictionary?: NextLocTypes.ThisDictionaryType,
  overrideLocale?: NextLocTypes.Locale
) {
  const locale = overrideLocale ?? localeConfig.defaults.locale;
  const scopedDictionary = overrideDictionary ?? dictionary;
  const notFoundMessage = "Translation not found";

  const path = `${locale}.${key}`;

  try {
    const translation = getTranslation(path, scopedDictionary ?? undefined);
    if (!translation) throw new Error(notFoundMessage);
    return translation;
  } catch (error) {
    const shouldWarn = (error as any).message === notFoundMessage;
    const method: keyof typeof konsole = shouldWarn ? "warn" : "err";

    konsole[method](
      `Failed to fetch translation at ${chalk.yellow(chalk.italic(path))}`,
      (error as any).message || null
    );

    return new LocalisedString(path);
  }
}
export type TFunction = typeof translate;

export function genT(
  genLocale?: NextLocTypes.Locale,
  genNamespace?: NextLocTypes.Namespace,
  genDictionary?: NextLocTypes.ThisDictionaryType
): NextLocTypes.TFunction {
  genLocale ??= localeConfig.defaults.locale;
  genNamespace ??= localeConfig.defaults.namespace;
  genDictionary ??= dictionary ?? undefined;

  return (
    key: string,
    overrideDictionary?: NextLocTypes.ThisDictionaryType,
    overrideLocale?: NextLocTypes.Locale
  ) =>
    translate(
      `${genNamespace}.${key}`,
      overrideDictionary ?? genDictionary,
      overrideLocale ?? genLocale
    );
}

export function useAutoGenT(
  genNamespace?: NextLocTypes.Namespace
): NextLocTypes.TFunction {
  const { locale, dictionary } = useLocaleContext();
  return genT(locale, genNamespace, dictionary);
}

export function adaptNamespace(
  oldFunction: NextLocTypes.TFunction,
  newNamespace: NextLocTypes.Namespace
): NextLocTypes.TFunction {
  return (
    key: string,
    overrideDictionary?: NextLocTypes.ThisDictionaryType,
    overrideLocale?: NextLocTypes.Locale
  ) =>
    oldFunction(
      `${newNamespace}.${key}`,
      overrideDictionary ?? undefined,
      overrideLocale ?? undefined
    );
}
