import { useLocaleContext } from "../context/provider";
import { genT } from "../translate";

import type { NextLocTypes } from "../types";

export function useAutoGenT(
  genNamespace?: NextLocTypes.Namespace
): NextLocTypes.TFunction {
  const { locale, dictionary } = useLocaleContext();
  return genT(locale, genNamespace, dictionary);
}
