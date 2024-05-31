import { checkLocaleConfig } from "../internal/checks";

export const LocaleLogProvider = () => {
  checkLocaleConfig();
  return null;
};
