"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RevealHighlightPlatter } from "@/components/reveal-highlight";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { Menu, MenuButton } from "@/components/menu";

export type LinkItem = {
  title: string;
  icon?: string;
  url: string;
};

export function Links(props: { links: LinkItem[] }) {
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
      className={`pt-24 md:px-24 md:py-24 ${
        menuOpened ? "md:opacity-100" : "md:opacity-60"
      } md:hover:opacity-100 md:transition-opacity md:duration-500`}
    >
      <RevealHighlightPlatter innerClassName="flex gap-1">
        {inlineLinks.map((link) => (
          <Button
            key={link.url}
            elementType={Link}
            extraClassName="!py-2"
            title={link.title}
            aria-label={link.title}
            href={link.url}
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
                    elementType={Link}
                    active={active}
                    aria-label={link.title}
                    href={link.url}
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
