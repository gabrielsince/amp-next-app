import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";

export const metadata = {
  title: "MCP Map Query",
  description: "A map query application using AMAP MCP",
};

export default async function LocaleLayout({ children, params: { locale } }) {
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}