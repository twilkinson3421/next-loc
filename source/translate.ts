import { localeConfig } from "./config";
import { decompressFunction } from "./internal/compression";
import {
  generateLocDedup,
  iterToTranslator
} from "./internal/dedupTranslations";

import type { NextLocTypes } from "./types";

function getTranslation(
  key: string,
  dictionary?: NextLocTypes.ThisDictionaryType
) {
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

  if (typeof translation === "string") return translation;
  throw new Error("Translation not found");
}

export function translate(
  key: string,
  dictionary?: NextLocTypes.ThisDictionaryType,
  overrideLocale?: NextLocTypes.Locale
) {
  const locale = overrideLocale ?? localeConfig.defaults.locale;
  const scopedDictionary = dictionary;

  const path = `${locale}.${key}`;

  try {
    const translation = getTranslation(path, scopedDictionary);
    if (!translation) throw new Error("Translation not found");
    return translation;
  } catch (error) {
    console.warn(
      `Failed to fetch translation at \x1b[3;33m${path}\x1b[0m\n${
        error?.message ?? ""
      }`
    );

    return path;
  }
}
export type TFunction = typeof translate;

export type TGenOptions = {
  delayDecompression?: boolean;
  dedup?: boolean;
};
export function genT(
  genLocale?: NextLocTypes.Locale,
  genNamespace?: NextLocTypes.Namespace,
  genDictionary?: NextLocTypes.ThisDictionaryType,
  options?: TGenOptions
): NextLocTypes.TFunction {
  genLocale ??= localeConfig.defaults.locale;
  genNamespace ??= localeConfig.defaults.namespace;

  if (typeof genDictionary === "string" && !options?.delayDecompression)
    genDictionary = JSON.parse(decompressFunction(genDictionary));

  const thisTFunction = (
    key: string,
    dictionary?: NextLocTypes.ThisDictionaryType,
    overrideLocale?: NextLocTypes.Locale
  ) =>
    translate(
      `${genNamespace}.${key}`,
      dictionary ?? genDictionary,
      overrideLocale ?? genLocale
    );

  if (options?.dedup) {
    const iter = generateLocDedup(thisTFunction);
    return iterToTranslator(iter);
  }

  return thisTFunction;
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
