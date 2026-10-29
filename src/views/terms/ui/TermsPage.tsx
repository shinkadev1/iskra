import { readFileSync } from "node:fs";
import path from "node:path";
import { Markdown } from "@/shared/ui/markdown";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

const terms = readFileSync(
  path.join(process.cwd(), "src/shared/content/terms.md"),
  "utf8",
);

export function TermsPage() {
  return (
    <>
      <Header />
      <main id="main" className="doc-main">
        <article className="doc wrap">
          <Markdown source={terms} />
        </article>
      </main>
      <Footer />
    </>
  );
}
