import acceptLanguage from "accept-language";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { localeConfig } from "../config";

export function localeMiddleware(request: NextRequest, _event: NextFetchEvent) {
  acceptLanguage.languages([...localeConfig.supported.locales]);
  const hostLocale = request.nextUrl.pathname.split("/")[1];

  const destinationLocale: string = (() => {
    if (request.cookies.has(localeConfig.server.cookieName))
      return acceptLanguage.get(
        request.cookies.get(localeConfig.server.cookieName)!.value
      )!;
    return (
      acceptLanguage.get(request.headers.get("Accept-Language")) ??
      localeConfig.defaults.locale
    );
  })();

  for (const i_ignoreUrl of localeConfig.server.ignoreMiddleware)
    if (request.nextUrl.pathname.startsWith(i_ignoreUrl))
      return NextResponse.next();

  if (!hostLocale)
    return NextResponse.redirect(new URL(`/${destinationLocale}`, request.url));

  if (
    localeConfig.supported.locales.some((iLocale) => iLocale === hostLocale)
  ) {
    const response = NextResponse.next();
    response.cookies.set(localeConfig.server.cookieName, hostLocale);
    return response;
  }

  const pattern = (() => {
    let output = localeConfig.other.localePattern.toString();

    if (output.startsWith("/")) output = output.slice(1);
    if (output.endsWith("/")) output = output.slice(0, -1);
    if (!output.startsWith("^")) output = `^${output}`;
    if (!output.endsWith("$")) output = `${output}$`;

    return new RegExp(output);
  })();

  if (pattern.test(hostLocale)) {
    const bestDestination = destinationLocale; // TODO Add best match - THIS WILL BE IMPLEMENTED IN A FUTURE RELEASE !!!
    const keep = request.nextUrl.pathname.split("/").slice(2);
    const location = !!keep.length ? `/${keep.join("/")}` : "";
    const newPath = `/${bestDestination}${location}`;
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return NextResponse.redirect(
    new URL(`/${destinationLocale}${request.nextUrl.pathname}`, request.url)
  );
}
