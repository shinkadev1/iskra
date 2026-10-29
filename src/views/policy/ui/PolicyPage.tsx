import { readFileSync } from "node:fs";
import path from "node:path";
import { Markdown } from "@/shared/ui/markdown";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

const policy = readFileSync(
  path.join(process.cwd(), "src/shared/content/policy.md"),
  "utf8",
);

export function PolicyPage() {
  return (
    <>
      <Header />
      <main id="main" className="doc-main">
        <article className="doc wrap">
          <Markdown source={policy} />
        </article>
      </main>
      <Footer />
    </>
  );
}
