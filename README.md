# **Next Loc**

A modern localisation solution for Next.js. _This is a very early version; Next Loc will improve and evolve in the future._

- **Proper TypeScript support**
- **Easy Setup**
- **Support for SSR**
- **Middleware Included**

## Basic Usage

> **_⚠️ Next Loc requires TypeScript to function properly!_**

Install Next Loc globally:

```bash
npm install -g next-loc
```

Configure Next Loc in your project:

```bash
npx next-loc
```

![Basic Usage](./assets/basic_usage.png)

_Made a mistake? Just run the command again to overwrite the existing configuration!_

Next, import the generated middleware into your `middleware.ts` or `middleware.js` file. Refer to the [Next.js docs](https://nextjs.org/docs/app/building-your-application/routing/middleware) for more information.

Create a directory for each locale (with the same name), following the format described by the `dictionaryPath` option in the `config.ts` file.

Create a JSON file for each namespace (with the same name) within each locale directory, following the format described by the `dictionaryPath` option in the `config.ts` file.

For example, using the default configuration, the following dictionary files should be created:

- `src/locale/dictionary/en-GB/common.json`

## Flags

| Flag             | Alternative | Description                                            |
| ---------------- | ----------- | ------------------------------------------------------ |
| `--default`      | `-d`        | Use the default configuration.                         |
| `--default-dest` | `-dd`       | Use the default destination directory (`/src/locale`). |
| `--manual`       | `-m`        | Don't automatically install required dependencies.     |

Example:

```bash
npx next-loc -d --manual
```

The above command will assume the default configuration, and will not automatically install any dependencies, leaving it to you.

The required dependencies are:

- [string-replace-utils](https://www.npmjs.com/package/string-replace-utils)
- [accept-language](https://www.npmjs.com/package/accept-language)
- [rolling-ts-utils](https://www.npmjs.com/package/rolling-ts-utils) (installed with `--dev`)

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
