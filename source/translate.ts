import chalk from "chalk";
import konsole from "chalk-konsole";

import { localeConfig } from "./config";
import { LocalisedString } from "./internal/class";
import { decompressFunction } from "./internal/compression";

import type { NextLocTypes } from "./types";

function getTranslation(key: string, dictionary?: NextLocTypes.ThisDictionaryType) {
  const segments = key.split(".");
  let translation = dictionary;
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
  dictionary?: NextLocTypes.ThisDictionaryType,
  overrideLocale?: NextLocTypes.Locale
) {
  const locale = overrideLocale ?? localeConfig.defaults.locale;
  const scopedDictionary = dictionary;
  const notFoundMessage = "Translation not found";

  const path = `${locale}.${key}`;

  try {
    const translation = getTranslation(path, scopedDictionary);
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
  genDictionary?: NextLocTypes.ThisDictionaryType,
  options?: { delayDecompression?: boolean }
): NextLocTypes.TFunction {
  genLocale ??= localeConfig.defaults.locale;
  genNamespace ??= localeConfig.defaults.namespace;

  if (typeof genDictionary === "string" && !options?.delayDecompression)
    genDictionary = JSON.parse(decompressFunction(genDictionary));

  return (
    key: string,
    dictionary?: NextLocTypes.ThisDictionaryType,
    overrideLocale?: NextLocTypes.Locale
  ) =>
    translate(
      `${genNamespace}.${key}`,
      dictionary ?? genDictionary,
      overrideLocale ?? genLocale
    );
}

export function adaptNamespace(
  oldFunction: NextLocTypes.TFunction,
  newNamespace: NextLocTypes.Namespace
): NextLocTypes.TFunction {
  return (
    key: string,
    dictionary?: NextLocTypes.ThisDictionaryType,
    overrideLocale?: NextLocTypes.Locale
  ) => oldFunction(`${newNamespace}.${key}`, dictionary, overrideLocale);
}
