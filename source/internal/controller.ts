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
  IgnoreMiddleware extends Readonly<string[]>
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
    other: { localePattern, dictionaryPath },
  };
}
