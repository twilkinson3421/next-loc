import { useDictionaryContext, useLocaleContext } from "../context/provider";
import { TGenOptions, genT } from "../translate";

import type { NextLocTypes } from "../types";

export function useAutoGenT(
  genNamespace?: NextLocTypes.Namespace,
  options?: TGenOptions,
  override?: {
    locale?: NextLocTypes.Locale;
    dictionary?: NextLocTypes.ThisDictionaryType;
  }
): NextLocTypes.TFunction {
  const defaultLocale = useLocaleContext().locale;
  const defaultDictionary = useDictionaryContext().dictionary;

  const locale = override?.locale ?? defaultLocale;
  const dictionary = override?.dictionary ?? defaultDictionary;

  return genT(locale, genNamespace, dictionary, options);
}
