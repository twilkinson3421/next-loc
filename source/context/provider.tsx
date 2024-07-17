"use client";

import { createContext, useContext } from "react";

import { localeConfig } from "../config";
import { genT } from "../translate";

import type { NextLocTypes } from "../types";

type LocaleContextValue = {
  locale: NextLocTypes.Locale;
};

type DictionaryContextValue = {
  dictionary: NextLocTypes.ThisDictionaryType;
};

type TranslationContextValue = {
  translator: NextLocTypes.TFunction;
};

export const LocaleContext = createContext<LocaleContextValue>({
  locale: localeConfig.defaults.locale,
});

export const DictionaryContext = createContext<DictionaryContextValue>({
  dictionary: undefined,
});

export const TranslationContext = createContext<TranslationContextValue>({
  translator: genT(),
});

export const LocaleContextProvider = ({
  children,
  locale,
}: Readonly<{ children: React.ReactNode }> & LocaleContextValue) => (
  <LocaleContext.Provider value={{ locale }}>{children}</LocaleContext.Provider>
);

export const DictionaryContextProvider = ({
  children,
  dictionary,
}: Readonly<{ children: React.ReactNode }> & DictionaryContextValue) => (
  <DictionaryContext.Provider value={{ dictionary }}>
    {children}
  </DictionaryContext.Provider>
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
export const useDictionaryContext = () => useContext(DictionaryContext);
export const useTranslationContext = () => useContext(TranslationContext);
