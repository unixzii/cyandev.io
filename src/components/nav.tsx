import { FC, Fragment } from "react";
import Link from "next/link";
import { ReadableArea } from "./adaptive-containers";

export const NavBar: FC = () => {
  return (
    <Fragment>
      <nav className="fixed top-0 w-full py-4 backdrop-blur bg-background/80 border-b border-border">
        <ReadableArea className="flex gap-12">
          <a className="font-bold">Cyandev</a>
          <div className="flex gap-6 font-light text-foreground-secondary">
            <Link className="hover:text-foreground transition-colors" href="/">
              Home
            </Link>
            <Link
              className="hover:text-foreground transition-colors"
              href="/blog"
            >
              Blog
            </Link>
          </div>
        </ReadableArea>
      </nav>
      <div className="h-16" />
    </Fragment>
  );
};
