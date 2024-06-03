import { localeConfig } from "../config";

import type { TFunction as Type_TFunction } from "../translate";

export namespace NextLocTypes {
  export type Locale = (typeof localeConfig.supported.locales)[number];
  export type RootNamespace =
    (typeof localeConfig.supported.namespaces)[number];
  export type Namespace = RootNamespace | `${RootNamespace}.${string}`;
  export type LocaleDictionary = Record<RootNamespace, Internal.Reference>;
  export type Dictionary = Record<Locale, LocaleDictionary>;
  export type LocaleParam = Readonly<{ params: LocaleProp }>;
  export type LocaleProp = Readonly<{ locale: Locale }>;
  export type DictionaryProp = Readonly<{ dictionary: Dictionary }>;
  export type TFunction = Type_TFunction;

  export namespace Internal {
    export type Reference = { [key: string]: string | Reference };
  }
}
