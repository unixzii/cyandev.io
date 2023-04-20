import "@/styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Cyandev</title>
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
