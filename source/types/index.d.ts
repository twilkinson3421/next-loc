import { localeConfig } from "../config";
import { dictionary } from "../internal/compileDictionary";
import { GLOBAL_DICT_DIR_NAME } from "../internal/constants";

import type { TFunction as Type_TFunction } from "../translate";

export namespace NextLocTypes {
  export type Locale = (typeof localeConfig.supported.locales)[number];
  export type RootNamespace =
    (typeof localeConfig.supported.namespaces)[number];
  export type RootGlobalNamespace =
    (typeof localeConfig.supported.globalNamespaces)[number];
  export type Namespace =
    | RootNamespace
    | RootGlobalNamespace
    | `${RootNamespace | RootGlobalNamespace}.${string}`;
  export type LocaleDictionary = Record<RootNamespace, Internal.Reference>;
  export type GlobalDictionary = Record<
    RootGlobalNamespace,
    Internal.Reference
  >;
  export type Dictionary = Record<Locale, LocaleDictionary> & GlobalDictionary;
  export type CompressedDictionary = string;
  export type ThisDictionaryType = typeof dictionary;
  export type LocaleParam = Readonly<{ params: LocaleProp }>;
  export type LocaleProp = Readonly<{ locale: Locale }>;
  export type DictionaryProp = Readonly<{ dictionary: Dictionary }>;
  export type TFunction = Type_TFunction;
  export type GlobalDirNameType = typeof GLOBAL_DICT_DIR_NAME;

  export namespace Internal {
    export type Reference = { [key: string]: string | Reference };
  }
}
