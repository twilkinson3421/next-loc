import { useDictionaryContext, useLocaleContext } from "../context/provider";
import { genT } from "../translate";

import type { NextLocTypes } from "../types";

export function useAutoGenT(
  genNamespace?: NextLocTypes.Namespace,
  options?: { delayDecompression?: boolean }
): NextLocTypes.TFunction {
  const { locale } = useLocaleContext();
  const { dictionary } = useDictionaryContext();
  return genT(locale, genNamespace, dictionary, {
    delayDecompression: options?.delayDecompression,
  });
}
