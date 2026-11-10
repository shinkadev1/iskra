import type { Metadata } from "next";
import { AccountPage } from "@/views/account";

export const metadata: Metadata = {
  title: "Личный кабинет",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountPage />;
}
