import type { Metadata } from "next";
import { siteName } from "@/shared/config";
import { ChatPage } from "@/views/chat";

export const metadata: Metadata = {
  title: "Текстовый чат",
  description: `Анонимный чат ${siteName} прямо на сайте: общение без регистрации в браузере, VK и Telegram.`,
  alternates: {
    canonical: "/chat/",
  },
  openGraph: {
    url: "/chat/",
    title: `Чат в ${siteName}`,
  },
};

export default function Page() {
  return <ChatPage />;
}
