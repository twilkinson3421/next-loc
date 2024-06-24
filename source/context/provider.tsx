"use client";

import { createContext, useContext } from "react";

import { localeConfig } from "../config";
import { genT } from "../translate";

import type { NextLocTypes } from "../types";

type LocaleContextValue = {
  locale: NextLocTypes.Locale;
  dictionary?: NextLocTypes.ThisDictionaryType;
};

type TranslationContextValue = {
  translator: NextLocTypes.TFunction;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: localeConfig.defaults.locale,
  dictionary: undefined,
});

const TranslationContext = createContext<TranslationContextValue>({
  translator: genT(),
});

export const LocaleContextProvider = ({
  children,
  locale,
  dictionary,
}: Readonly<{ children: React.ReactNode }> & LocaleContextValue) => (
  <LocaleContext.Provider value={{ locale, dictionary }}>
    {children}
  </LocaleContext.Provider>
);

export const TranslationContextProvider = ({
  children,
  translator,
}: Readonly<{ children: React.ReactNode }> & TranslationContextValue) => {
  return (
    <TranslationContext.Provider value={{ translator }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useLocaleContext = () => useContext(LocaleContext);
export const useTranslationContext = () => useContext(TranslationContext);
