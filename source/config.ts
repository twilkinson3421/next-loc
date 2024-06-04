import { createLocaleConfig } from "./internal/controller";

export const localeConfig = createLocaleConfig({
  supportedLocales: ["en-GB"],
  supportedNamespaces: ["common"],
  globalNamespaces: [],
  defaultLocale: "en-GB",
  defaultNamespace: "common",
  cookieName: "hl",
  localePattern: /[a-z]{2}-[A-Z]{2}/,
  dictionaryPath: "src/locale/dictionary/{locale}/{namespace}.json",
  inherits: {},
  ignoreMiddleware: [
    "/static",
    "/api",
    "/_next",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
  ],
} as const);
