import Link from "next/link";
import type { ReactNode } from "react";

const linkPattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function isSafeHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;

  for (const match of text.matchAll(linkPattern)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));

    const label = match[1] ?? "";
    const href = match[2] ?? "";
    if (!isSafeHref(href)) {
      nodes.push(label);
    } else if (href.startsWith("/")) {
      nodes.push(
        <Link key={`${index}-${href}`} href={href}>
          {label}
        </Link>,
      );
    } else {
      nodes.push(
        <a key={`${index}-${href}`} href={href}>
          {label}
        </a>,
      );
    }

    last = index + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").split(/\n{2,}/);

  return blocks.map((block, index) => {
    const text = block.trim();
    if (!text) return null;

    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    const isList = lines.length > 0 && lines.every((line) => /^[-*·]\s+/.test(line));
    if (isList) {
      return (
        <ul key={index}>
          {lines.map((line, itemIndex) => (
            <li key={itemIndex}>{renderInline(line.replace(/^[-*·]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    const heading = /^(#{1,3})\s+([\s\S]+)$/.exec(text);
    if (heading) {
      const level = heading[1]?.length ?? 1;
      const content = (heading[2] ?? "").replace(/\s+/g, " ");
      if (level === 1) return <h1 key={index}>{renderInline(content)}</h1>;
      if (level === 2) return <h2 key={index}>{renderInline(content)}</h2>;
      return <h3 key={index}>{renderInline(content)}</h3>;
    }

    const flat = text.replace(/\s+/g, " ");
    const clause = /^(\d+(?:\.\d+)+)\.?(?:\s|$)/.exec(flat);
    const depth = clause ? clause[1].split(".").length : 0;
    const className = depth > 2 ? `clause-${depth}` : undefined;

    return (
      <p key={index} className={className}>
        {renderInline(flat)}
      </p>
    );
  });
}
