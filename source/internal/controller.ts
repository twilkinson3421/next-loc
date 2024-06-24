import type { NextLocTypes } from "../types";

export function createLocaleConfig<
  SupportedLocales extends Readonly<string[]>,
  SupportedNamespaces extends Readonly<string[]>,
  GlobalNamespaces extends Readonly<string[]>,
  DefaultLocale extends SupportedLocales[number],
  DefaultNamespace extends SupportedNamespaces[number],
  CookieName extends Readonly<string>,
  LocalePattern extends Readonly<RegExp>,
  DictionaryPath extends Readonly<string>,
  Inherits extends Readonly<
    Partial<{
      [Locale in SupportedLocales[number]]: Array<
        Exclude<SupportedLocales[number], Locale>
      >;
    }>
  >,
  IgnoreMiddleware extends Readonly<string[]>,
  Suppress extends Readonly<{
    missingDictionary:
      | boolean
      | Array<SupportedLocales[number] | NextLocTypes.GlobalDirNameType>;
    localeSatisfiesPattern: boolean;
    defaultLocaleIsSupported: boolean;
  }>,
  OptOutCompression extends Readonly<boolean>
>({
  supportedLocales,
  supportedNamespaces,
  globalNamespaces,
  defaultLocale,
  defaultNamespace,
  cookieName,
  localePattern,
  dictionaryPath,
  inherits,
  ignoreMiddleware,
  suppress,
  optOutCompression,
}: Readonly<{
  supportedLocales: SupportedLocales;
  supportedNamespaces: SupportedNamespaces;
  globalNamespaces: GlobalNamespaces;
  defaultLocale: DefaultLocale;
  defaultNamespace: DefaultNamespace;
  cookieName: CookieName;
  localePattern: LocalePattern;
  dictionaryPath: DictionaryPath;
  inherits: Inherits;
  ignoreMiddleware: IgnoreMiddleware;
  suppress: Suppress;
  optOutCompression: OptOutCompression;
}>) {
  return {
    supported: {
      locales: supportedLocales,
      namespaces: supportedNamespaces,
      globalNamespaces,
    },
    defaults: { locale: defaultLocale, namespace: defaultNamespace },
    meta: { inherits },
    server: { cookieName, ignoreMiddleware },
    other: { localePattern, dictionaryPath, suppress, optOutCompression },
  };
}
