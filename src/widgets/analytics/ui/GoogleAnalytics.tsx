import Script from "next/script";

const gaId = "G-K1K2VE0FLM";

const snippet = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`;

/** Google Analytics (gtag.js) на всех страницах. */
export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {snippet}
      </Script>
    </>
  );
}
