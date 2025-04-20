import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  console.log("getRequestConfig - Received locale:", locale);
  // Define supported locales and default locale
  const supportedLocales = ["en", "zh", "es", "ja"];
  const validLocale = supportedLocales.includes(locale) ? locale : "en";

  console.log("getRequestConfig - Using locale:", validLocale);

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});