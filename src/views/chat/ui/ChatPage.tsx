import { ChatRoom } from "@/features/anonymous-chat";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

export function ChatPage() {
  return (
    <>
      <Header />
      <main id="main" className="chat-main">
        <ChatRoom />
      </main>
      <Footer />
    </>
  );
}
