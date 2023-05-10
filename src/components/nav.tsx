"use client";

import { FC, Fragment, useEffect, useRef, useState } from "react";
import { selectClass } from "@/utils";
import { Link } from "./link";
import { ReadableArea } from "./adaptive-containers";

export const NavBar: FC = () => {
  const [hairlineVisible, setHairlineVisible] = useState(false);
  const scrollDetectorElementRef = useRef(null);
  useEffect(() => {
    const scrollDetectorElement = scrollDetectorElementRef.current;
    if (!scrollDetectorElement) {
      return;
    }

    const ob = new IntersectionObserver(
      (entries) => {
        const ratio = entries[0].intersectionRatio;
        setHairlineVisible(ratio < 0.1);
      },
      { threshold: [0, 0.1, 1] }
    );
    ob.observe(scrollDetectorElement);
    return () => {
      ob.disconnect();
    };
  }, [scrollDetectorElementRef, setHairlineVisible]);

  return (
    <Fragment>
      <nav
        className={selectClass({
          "fixed top-0 w-full py-4 z-50 backdrop-blur bg-background/80 border-b transition-colors duration-500":
            true,
          "border-border": hairlineVisible,
          "border-transparent": !hairlineVisible,
        })}
      >
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
      <div className="h-16" ref={scrollDetectorElementRef} />
    </Fragment>
  );
};
