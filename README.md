# **Next Loc**

A modern localisation solution for Next.js. _This is a very early version; Next Loc will improve and evolve in the future._

- **Proper TypeScript support**
- **Easy Setup**
- **Support for SSR**
- **Middleware Included**

## Basic Usage

> **_⚠️ Next Loc requires TypeScript to function properly!_**

_Next Loc will automatically install the required dependencies with **npm** or **pnpm**. If you are using another package manager, the required dependencies will not be installed unless you use the `--force-install` flag (will use `npm`). This means that you will have to install them in your project manually._

### Installation

Install Next Loc globally:

```bash
npm install -g next-loc
```

### Configuration

Configure Next Loc in your project:

```bash
npx next-loc@latest
```

![Basic Usage](./assets/basic_usage.png)

_Made a mistake during configuration? Just run the command again to overwrite the existing configuration!_

### Middleware

Next, import the generated middleware into your `middleware.ts` or `middleware.js` file. Refer to the [Next.js docs](https://nextjs.org/docs/app/building-your-application/routing/middleware) for more information. Here is an example implementation:

```ts
import { localeMiddleware } from "./path/to/middleware";

export const middleware = (request: NextRequest, _event: NextFetchEvent) => {
  return localeMiddleware(request, _event);
};

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
```

### Dictionary Setup

Create a directory for each locale (with the same name), following the format described by the `dictionaryPath` option in the `config.ts` file.

Create a JSON file for each namespace (with the same name) within each locale directory, following the format described by the `dictionaryPath` option in the `config.ts` file.

For example, using the default configuration, the following dictionary files should be created:

- `src/locale/dictionary/en-GB/common.json`

### Localisation

**Using `translate(key, dictionary, locale)` _(not preferred)_**

- During SSR, the dictionary can be omitted as it is imported automatically within the `translate` function.
- If no dictionary is provided during client-side-rendering, an empty dictionary will be used, thus all translations will not be found.
- If no locale is provided, the default locale will be used.
- `key` refers to the full **dot notation** path to the translation. For example, `"common.greetings.welcome"`, would be found at the `welcome` key, within the `greetings` object, within the JSON object in the `common.json` file.

_When using SSR_

```ts
import { dictionary } from "./path/to/dictionary";

// Get locale from URL params

const str = translate("common.greetings.welcome", dictionary, locale);
```

_When using client components_

```ts
const { dictionary, locale } = useLocaleContext();
const str = translate("common.greetings.welcome", dictionary, locale);
```

_See the [context documentation](#context)_ for more information.

**Using `genT(locale, namespace, dictionary)` _(preferred)_**

- Returns a translate function
  - Default locale in the returned function is set to the value of `locale` here
  - The `key` is appended to the value of `namespace` here (`.` is added automatically)
  - If a dictionary is provided, it will be used by default in the returned function
  - All parameters can be overriden by passing them in the returned function (except from `key` which is **always** appended to the `namespace` here)
- During SSR, the dictionary can be omitted as it is imported automatically within the `translate` function.
- If no dictionary is provided during client-side-rendering, an empty dictionary will be used, thus all translations will not be found.
- If no locale is provided, the default locale will be used.

_When using SSR_

```ts
const t = genT(locale, "common.greetings");
const str = t("welcome");
```

_When using client components_

```ts
const t = genT(locale, "common.greetings", dictionary);
const str = t("welcome");
```

## Context

### Locale & Dictionary

Next Loc includes a locale context provider to make it easier to access the locale and dictionary in client components. The recommended usage is to set the context at the app root.

```tsx
export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{ children: React.ReactNode }> & NextLocTypes.LocaleParam) {
  return (
    <html lang={locale}>
      <body>
        <LocaleContextProvider {...{ locale, dictionary }}>
          {children}
        </LocaleContextProvider>
        <LocaleLogProvider />
      </body>
    </html>
  );
}
```

Use `useLocaleContext()` to access the locale and dictionary in client components.

```tsx
const { locale, dictionary } = useLocaleContext();
```

### Translate Function

Next Loc also includes a context provider for the `translate` function. This allows you to create a translate function using `genT`, then pass it to the `<TranslationContextProvider />` component, then use `useTranslationContext()` to access the translate function in client components.

```tsx
// Using SSR

export const Component = () => {
  const t = genT(locale, "common.greetings");

  return (
    <TranslationContextProvider translator={t}>
      <ChildComponent />
    </TranslationContextProvider>
  );
};
```

```tsx
// Child (client) component

export const ChildComponent = () => {
  const { translator: t } = useTranslationContext();

  return <p>{t("welcome")}</p>;
};
```

## Log Errors & Warnings

Next Loc makes some checks to ensure that localisation will function as expected (these can be expected in `internal/checks.ts`). To enable these checks, add the `<LocaleLogProvider />` component at the app root.

These checks cover:

- Checking that all supported locales satisfy the `localePattern` specified in the `config.ts` file
- Checking that the default locale is included as a supported locale

## Flags

| Flag               | Alternative | Description                                                                 |
| ------------------ | ----------- | --------------------------------------------------------------------------- |
| `--default`        | `-d`        | Use the default configuration.                                              |
| `--default-dir`    | `-dd`       | Use the default destination directory (`/src/locale`).                      |
| `--manual-install` | `-m`        | Don't automatically install required dependencies.                          |
| `--force-install`  | `-f`        | Force installation of required dependencies (overrides `--manual-install`). |

Example:

```bash
npx next-loc -d --manual-install
```

The above command will assume the default configuration, and will not automatically install any dependencies, leaving it to you.

The required dependencies are:

- [chalk-konsole](https://www.npmjs.com/package/chalk-konsole)
- [string-replace-utils](https://www.npmjs.com/package/string-replace-utils)
- [accept-language](https://www.npmjs.com/package/accept-language)

## Configuration

Next Loc generates a configuration file, `config.ts` within the destination directory. This file can be freely modified to suit your needs. This is the default configuration that is generated with the default options during setup:

```ts
{
  supportedLocales: ["en-GB"],
  supportedNamespaces: ["common"],
  defaultLocale: "en-GB",
  defaultNamespace: "common",
  cookieName: "hl",
  localePattern: /[a-z]{2}-[A-Z]{2}/,
  dictionaryPath: "src/locale/dictionary/{locale}/{namespace}.json",
  ignoreMiddleware: [
    "/static",
    "/api",
    "/_next",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
  ],
}
```

**`supportedLocales`**

A string array, containing the locales supported by your application.

**`supportedNamespaces`**

A string array, containing the namespaces supported by your application. Each namespace corresponds to an indiviual JSON file located inside each dictionary directory.

**`defaultLocale`**

The default locale, used when no cookie is set, and the request URL contains no supported locale.

**`defaultNamespace`**

The namespace used for finding localisations when no namespace is provided to the translator function.

**`cookieName`**

The name of the cookie used to store the selected locale in the user's browser.

**`localePattern`**

The pattern for supported locales. This is used when the request URL does not contain a supported locale, to determine if the user is trying to access a valid, but not supported locale. For example, using the default configuration, the URL `/de-DE/page` would be redirected to `en-GB/page`, because `de-DE` satisfies the `localePattern`. Whereas the URL `something/page` would be redirected to `en-GB/something/page`, because `something` does not satisfy the `localePattern`.

**`dictionaryPath`**

The path to the JSON dictionary files. This should include `{locale}` and `{namespace}` to point to the correct files for each locale and namespace during dictionary compilation. See [Using Non-JSON Dictionaries](#using-non-json-dictionaries) below for more information.

**`ignoreMiddleware`**

An array of paths for which the middleware will return an unmodified response. This is useful for ignoring static files which should not differ based on locale, such as `/favicon.ico`. Middleware execution can be prevented via the `config` object within `middleware.ts`, as referenced by the [Next.js docs](https://nextjs.org/docs/app/building-your-application/routing/middleware#matching-paths). Paths in `ignoreMiddleware` will **NOT** prevent middleware from being executed.

## Using Non-JSON Dictionaries

Next Loc currently does not have out-of-the-box support for non-JSON dictionaries. You may be able to achieve this functionality by doing the following:

- Modify the `dictionaryPath` option in the configuration file, to use the necessary file extension.
- Modify the `compileDictionary` function in `internal/compileDictionary.ts`,
  - Change `JSON.parse(fileContents)` to a custom function
  - The function must parse the format of your dictionary file, and return a JSON object
