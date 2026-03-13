import type { Metadata } from "next";
import { ThemeProvider } from "../../components/providers/ThemeProvider";
import "../globals.css";
import { isRTL } from "@uniflo/i18n";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }, { locale: "fr" }, { locale: "de" }];
}

export const metadata: Metadata = {
  title: "Uniflo — Unified Ops & Support Platform",
  description: "Unified operations and support for distributed enterprises",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = isRTL(locale as "en" | "ar" | "fr" | "de") ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
