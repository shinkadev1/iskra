import type { Metadata } from "next";
import { siteName } from "@/shared/config";
import { TermsPage } from "@/views/terms";

export const metadata: Metadata = {
  title: "Пользовательское соглашение",
  description: `Пользовательское соглашение об использовании сервисов ${siteName}.`,
  alternates: {
    canonical: "/terms/",
  },
  openGraph: {
    url: "/terms/",
    title: `Пользовательское соглашение в ${siteName}`,
    description: `Пользовательское соглашение об использовании сервисов ${siteName}.`,
  },
};

export default function Page() {
  return <TermsPage />;
}
