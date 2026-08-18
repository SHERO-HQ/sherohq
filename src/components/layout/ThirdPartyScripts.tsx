import Script from "next/script";

interface ThirdPartyScriptsProps {
  gaId?: string;
}

export function ThirdPartyScripts({ gaId }: ThirdPartyScriptsProps) {
  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="lazyOnload"
          />
          <Script id="google-analytics" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
      {/* 
        Future Facebook Pixel or other heavy marketing scripts should also use strategy="lazyOnload"
        Critical widgets (like a customer support chat box) can use strategy="afterInteractive"
      */}
    </>
  );
}
