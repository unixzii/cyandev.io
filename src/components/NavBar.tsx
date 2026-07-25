import type { PropsWithChildren } from "react";
import { Link } from "react-router";
import clsx from "clsx";

import { Logo } from "./Logo";

const LinkWrapper = ({
  visible,
  direction,
  children,
}: PropsWithChildren<{ visible: boolean; direction: "previous" | "next" }>) => {
  return (
    <div
      className={clsx(
        "absolute h-full flex items-center transition-all duration-300",
        {
          "opacity-0 blur-xs pointer-events-none": !visible,
          "translate-x-4": !visible && direction == "next",
          "-translate-x-4": !visible && direction == "previous",
        },
      )}
    >
      {children}
    </div>
  );
};

interface NavBarProps {
  hideHome?: boolean;
}

export const NavBar = (props: NavBarProps) => {
  const { hideHome } = props;

  return (
    <nav className="relative h-24">
      <LinkWrapper visible={!hideHome} direction="next">
        <Link data-cuelume-release="release" to="/">
          <Logo />
        </Link>
      </LinkWrapper>
      <LinkWrapper visible={!!hideHome} direction="previous">
        <Link
          className="text-secondary hover:text-primary transition-colors duration-200"
          data-cuelume-release="release"
          to="/page/about"
        >
          about
        </Link>
      </LinkWrapper>
    </nav>
  );
};
