import { localeConfig } from "../config";
import { NextLocTypes } from "../types";

export function getShouldSuppressENOENT(
  locale: NextLocTypes.Locale | NextLocTypes.GlobalDirNameType
) {
  const configValue = localeConfig.other.suppress.missingDictionary;
  if ((configValue as boolean) === true) return true;
  if (Array.isArray(configValue) && configValue.includes(locale)) return true;
  return false;
}
