import "@/styles/globals.css";
import { useEffect } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { NavBar } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function App({ Component, pageProps }: AppProps) {
  const { staticMetadata } = Component;

  useEffect(() => {
    const platform = window.navigator.platform;
    if (platform !== "iPhone" && platform !== "iPad") {
      return;
    }

    function handleResize() {
      const root = window.document.documentElement;
      root.style.setProperty(
        "--apple-compat-screen-height",
        `${window.innerHeight * 0.999}px`
      );
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const pageTitle = staticMetadata?.title;
  const ogUrl = staticMetadata?.ogUrl;
  const ogImage = staticMetadata?.ogImage;
  const ogDescription = staticMetadata?.ogDescription;

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
      <div>
        {!staticMetadata?.hidesNavBar && <NavBar />}
        <Component {...pageProps} />
        {!staticMetadata?.hidesNavBar && <Footer />}
      </div>
      <Analytics />
    </>
  );
}
