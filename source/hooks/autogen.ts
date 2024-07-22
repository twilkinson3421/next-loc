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
  const locale = override?.locale ?? useLocaleContext().locale;
  const dictionary = override?.dictionary ?? useDictionaryContext().dictionary;

  return genT(locale, genNamespace, dictionary, options);
}
