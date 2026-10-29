import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import Script from "next/script";
import { CookieNotice } from "@/features/cookie-consent";
import {
  siteDescription,
  siteJsonLd,
  siteName,
  siteTitle,
  siteUrl,
} from "@/shared/config";
import {
  GoogleAnalytics,
  GoogleTagManagerBody,
  GoogleTagManagerHead,
  YandexMetrika,
} from "@/widgets/analytics";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-manrope",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090a18",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "анонимный чат",
    "знакомства",
    "общение",
    "знакомства ВКонтакте",
    "знакомства Telegram",
    "neon chat",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: siteName,
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    yandex: "0a745ec40396da59",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const jsonLd = JSON.stringify(siteJsonLd()).replace(/</g, "\\u003c");

  return (
    <html lang="ru" className={manrope.variable}>
      <body className={manrope.className}>
        <GoogleTagManagerHead />
        <GoogleAnalytics />
        <GoogleTagManagerBody />
        <a className="skip" href="#main">
          К содержанию
        </a>
        <Script
          id="site-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
        <CookieNotice />
        {children}
        <YandexMetrika />
      </body>
    </html>
  );
}
