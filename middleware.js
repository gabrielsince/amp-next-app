import { NextResponse } from "next/server";

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  console.log("Middleware - Pathname:", pathname);

  const supportedLocales = ["en", "zh", "es", "ja"];
  const defaultLocale = "en";

  // Check if the pathname starts with a supported locale
  const locale = pathname.split("/")[1];
  console.log("Middleware - Extracted locale:", locale);

  if (!supportedLocales.includes(locale)) {
    console.log(`Middleware - Redirecting to /${defaultLocale}${pathname}`);
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};