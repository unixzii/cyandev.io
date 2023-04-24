import { FunctionComponent, useState, useMemo } from "react";
import { GetStaticProps } from "next";
import { Inter } from "next/font/google";
import { Typewriter } from "@/components/typewriter";
import { RevealHighlightPlatter } from "@/components/reveal-highlight";
import { Button } from "@/components/button";
import { Menu, MenuButton } from "@/components/menu";
import { Icon } from "@/components/icon";

// For server-side rendering.
import me from "@/data/me.json";

const inter = Inter({ subsets: ["latin"] });

type MyLink = {
  title: string;
  icon?: string;
  url: string;
};

function Links(props: { links: MyLink[] }) {
  const { links } = props;
  const [inlineLinks, overflowLinks] = useMemo(() => {
    if (links.length <= 3) {
      return [links, []];
    }
    return [links.slice(0, 3), links.slice(3)];
  }, [links]);
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <div
      className={`pt-16 md:px-24 md:py-16 ${
        menuOpened ? "md:opacity-100" : "md:opacity-60"
      } md:hover:opacity-100 md:transition-opacity md:duration-500`}
    >
      <RevealHighlightPlatter innerClassName="flex gap-1">
        {inlineLinks.map((link) => (
          <Button
            key={link.url}
            elementType="a"
            extraClassName="!py-2"
            title={link.title}
            aria-label={link.title}
            href={link.url}
            target="_blank"
          >
            <Icon icon={link.icon as unknown as any} size="lg" />
          </Button>
        ))}
        {inlineLinks.length !== links.length && (
          <Menu
            button={
              <MenuButton
                as={
                  /* HACK: indirect generics not working here */
                  Button as any
                }
                extraClassName="!py-2"
                title="More"
                aria-label="More"
              >
                <Icon icon="ellipsis" size="lg" />
              </MenuButton>
            }
            menuContainerClassName="flex flex-col"
            items={overflowLinks}
            itemRenderer={(link) => {
              return [
                (active) => (
                  <Button
                    elementType="a"
                    active={active}
                    aria-label={link.title}
                    href={link.url}
                    target="_blank"
                  >
                    {link.title}
                  </Button>
                ),
                link.url,
              ];
            }}
            onOpen={() => {
              setMenuOpened(true);
            }}
            onClose={() => {
              setMenuOpened(false);
            }}
          />
        )}
      </RevealHighlightPlatter>
    </div>
  );
}

type HomeProps = {
  descriptiveStatements: string[];
  links: MyLink[];
};

const Home: FunctionComponent<HomeProps> = ({
  descriptiveStatements,
  links,
}) => {
  return (
    <main className="flex px-4 py-16 min-h-apple-compat-screen flex-col items-center justify-center gap-4">
      <div
        className={`${inter.className} mt-12 md:mt-24 mb-2 md:mb-8 text-4xl md:text-6xl font-bold`}
      >
        👋&nbsp;&nbsp;Hi, I&apos;m Cyandev
      </div>
      <Typewriter snippets={descriptiveStatements} />
      <Links links={links} />
    </main>
  );
};
export default Home;

Home.staticMetadata = {
  ogUrl: "https://cyandev.app",
  ogImage: "https://cyandev.app/twitter-cards/common.png",
  ogDescription: "👋 Hi, I'm Cyandev. This is my personal homepage, welcome.",
  hidesNavBar: true,
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  return {
    props: {
      descriptiveStatements: me.descriptive_statements,
      links: me.links,
    },
  };
};
