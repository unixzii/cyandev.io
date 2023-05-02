import { FunctionComponent } from "react";
import { Typewriter } from "@/components/typewriter";
import { buildMetadata } from "@/utils";
import { Links, LinkItem } from "./Links";

export const metadata = buildMetadata({
  description: "👋 Hi, I'm Cyandev. This is my personal homepage, welcome.",
  ogUrl: "https://cyandev.app",
  ogImage: "https://cyandev.app/twitter-cards/common.png",
});

type HomeProps = {
  descriptiveStatements: string[];
  links: LinkItem[];
};

const Home: FunctionComponent<HomeProps> = ({
  descriptiveStatements,
  links,
}) => {
  return (
    <div className="flex flex-col min-h-screen justify-center">
      <main className="flex px-4 py-16 flex-col items-center">
        <div className="mt-12 md:mt-24 mb-6 md:mb-12 text-4xl md:text-6xl font-bold">
          👋&nbsp;&nbsp;Hi, I&apos;m Cyandev
        </div>
        <Typewriter snippets={descriptiveStatements} />
        <Links links={links} />
      </main>
    </div>
  );
};

// For server-side rendering.
import me from "@/../data/me.json";

export default function Page() {
  return (
    <Home descriptiveStatements={me.descriptive_statements} links={me.links} />
  );
}
