import { localeConfig } from "../config";

export function checkLocaleConfig() {
  for (const i_locale of localeConfig.supported.locales) {
    if (localeConfig.other.suppress.localeSatisfiesPattern) break;

    if (!localeConfig.other.localePattern.test(i_locale)) {
      console.warn(
        `Locale \x1b[3;33m${i_locale}\x1b[0m does not match the pattern \x1b[3;33m${localeConfig.other.localePattern}\x1b[0m specified in the config file`
      );
    }
  }

  if (
    !localeConfig.supported.locales.includes(localeConfig.defaults.locale) &&
    localeConfig.other.suppress.defaultLocaleIsSupported
  ) {
    console.error(
      `Default locale \x1b[3;33m${localeConfig.defaults.locale}\x1b[0m is not included as a supported locale`
    );
  }
}
