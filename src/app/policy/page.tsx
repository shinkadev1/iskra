import type { Metadata } from "next";
import { siteName } from "@/shared/config";
import { PolicyPage } from "@/views/policy";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: `Политика конфиденциальности приложения Neon Chat, сайта и ботов ${siteName}: какие данные собираются, зачем и сколько хранятся.`,
  alternates: {
    canonical: "/policy/",
  },
  openGraph: {
    url: "/policy/",
    title: `Политика конфиденциальности в ${siteName}`,
    description: `Политика конфиденциальности приложения Neon Chat, сайта и ботов ${siteName}: какие данные собираются, зачем и сколько хранятся.`,
  },
};

export default function Page() {
  return <PolicyPage />;
}
