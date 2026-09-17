import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import env from "@/env";
import { routing } from "@/i18n/routing";
import LayoutProvider from "../widgets/layout-provider/layout-provider";
import "./globals.css";
import { getTranslations } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ogLocaleMap: Record<string, string> = {
  pt: "pt_BR",
  en: "en_US",
  es: "es_ES",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Layout" });

  const title = t("title");
  const description = t("description");
  const ogDescription = t("ogDescription");

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_WEBSITE_URL),
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: ogDescription,
      url: `${env.NEXT_PUBLIC_WEBSITE_URL}/${locale}`,
      siteName: "Victor Zarzar | Front-end Developer",
      images: [
        {
          url: "/static/og-image.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: ogLocaleMap[locale] ?? "en_US",
      type: "website",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "pt-BR": "/pt",
        "en-US": "/en",
        "es-ES": "/es",
      },
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale: string) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <LayoutProvider>{children}</LayoutProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
