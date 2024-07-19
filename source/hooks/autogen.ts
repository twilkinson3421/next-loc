import { useDictionaryContext, useLocaleContext } from "../context/provider";
import { TGenOptions, genT } from "../translate";

import type { NextLocTypes } from "../types";

export function useAutoGenT(
  genNamespace?: NextLocTypes.Namespace,
  options?: TGenOptions
): NextLocTypes.TFunction {
  const { locale } = useLocaleContext();
  const { dictionary } = useDictionaryContext();

  return genT(locale, genNamespace, dictionary, options);
}
