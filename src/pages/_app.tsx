import "@/styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }: AppProps) {
  const { staticMetadata } = Component;

  const pageTitle = staticMetadata?.title;
  const ogUrl = staticMetadata?.ogUrl;
  const ogImage = staticMetadata?.ogImage;
  const ogDescription = staticMetadata?.ogDescription;

  const title = `${(pageTitle && `${pageTitle} | `) || ""}Cyandev`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="msapplication-TileColor" content="#000000" />
        <meta property="theme-color" content="#000" />
        <meta property="og:title" content={title} />
        {ogUrl && <meta property="og:url" content={ogUrl} />}
        {ogImage && <meta property="og:image" content={ogImage} />}
        {ogImage && <meta name="twitter:card" content="summary_large_image" />}
        {ogDescription && (
          <meta property="og:description" content={ogDescription} />
        )}
        {ogDescription && (
          <meta property="description" content={ogDescription} />
        )}
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
