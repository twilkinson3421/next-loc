# **Next Loc**

A modern localisation solution for Next.js. _This is a very early version; Next Loc will improve and evolve in the future._

- **Proper TypeScript support**
- **Easy Setup**
- **Support for SSR**
- **Middleware Included**

## Basic Usage

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

| Flag             | Alternative | Description                                           |
| ---------------- | ----------- | ----------------------------------------------------- |
| `--default`      | `-d`        | Use the default configuration.                        |
| `--default-dest` | `-dd`       | Use the default destination directory (/src/locale`). |
| `--manual`       | `-m`        | Don't automatically install required dependencies.    |

Example:

```bash
npx next-loc -d --manual
```

The above command will assume the default configuration, and will not automatically install any dependencies, leaving it to you.

The required dependencies are:

- [string-replace-utils](https://www.npmjs.com/package/string-replace-utils)
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
