import Link from "next/link";
import { siteName } from "@/shared/config";

/** Neon badge from the header mockup: gradient ring, dark tile, glowing letter. */
export function Logo() {
  return (
    <Link className="logo" href="/" aria-label={`${siteName}, на главную`}>
      <span className="logo-badge" aria-hidden="true">
        <span className="logo-badge-inner">
          <span className="logo-badge-letter">
            {siteName.slice(0, 1).toLowerCase()}
          </span>
        </span>
      </span>
      <span className="logo-name">{siteName.toLowerCase()}</span>
    </Link>
  );
}
