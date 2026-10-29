import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";
import { HomeLanding } from "@/widgets/home-landing";

export function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <HomeLanding />
      </main>
      <Footer />
    </>
  );
}
