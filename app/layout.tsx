import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import { CookieNotice } from "@/components/cookie-notice";
import { siteDescription, siteJsonLd, siteName, siteTitle, siteUrl } from "@/lib/site";
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
  themeColor: "#ff7420",
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
    "Искра",
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
        <a className="skip" href="#main">
          К содержанию
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        <CookieNotice />
        {children}
      </body>
    </html>
  );
}
