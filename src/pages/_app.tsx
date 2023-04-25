import "@/styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { NavBar } from "@/components/nav";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  const { staticMetadata, getDynamicMetadata } = Component;

  const pageMetadata = (() => {
    if (getDynamicMetadata) {
      return getDynamicMetadata(pageProps);
    }
    return staticMetadata;
  })();

  const pageTitle = pageMetadata?.title;
  const ogUrl = pageMetadata?.ogUrl;
  const ogImage = pageMetadata?.ogImage;
  const ogDescription = pageMetadata?.ogDescription;

  const title = `${(pageTitle && `${pageTitle} | `) || ""}Cyandev`;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>{title}</title>
        <meta property="msapplication-TileColor" content="#000000" />
        <meta property="theme-color" content="#000" />
        <meta property="twitter:site" content="@unixzii" />
        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />
        {ogUrl && <meta property="og:url" content={ogUrl} />}
        {ogImage && <meta property="og:image" content={ogImage} />}
        {ogImage && <meta property="twitter:image" content={ogImage} />}
        {(ogImage || ogDescription) && (
          <meta name="twitter:card" content="summary_large_image" />
        )}
        {ogDescription && (
          <meta property="og:description" content={ogDescription} />
        )}
        {ogDescription && (
          <meta property="twitter:description" content={ogDescription} />
        )}
        {ogDescription && (
          <meta property="description" content={ogDescription} />
        )}
      </Head>
      <div className={inter.className}>
        {!pageMetadata?.hidesNavBar && <NavBar />}
        <Component {...pageProps} />
        {!pageMetadata?.hidesNavBar && <Footer />}
      </div>
      <Analytics />
    </>
  );
}
