import type { Metadata } from "next";
import { siteName } from "@/shared/config";
import { PolicyPage } from "@/views/policy";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: `Политика конфиденциальности сайта ${siteName}.`,
  alternates: {
    canonical: "/policy/",
  },
  openGraph: {
    url: "/policy/",
    title: `Политика конфиденциальности в ${siteName}`,
    description: `Политика конфиденциальности сайта ${siteName}.`,
  },
};

export default function Page() {
  return <PolicyPage />;
}
