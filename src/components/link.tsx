"use client";

import {
  ComponentProps,
  ForwardedRef,
  MouseEvent,
  forwardRef,
  useEffect,
  useTransition,
} from "react";
import { default as NextLink } from "next/link";
import { useRouter } from "next/navigation";
import { isLocalURL } from "next/dist/shared/lib/router/utils/is-local-url";
import { useGlobalLoadingIndicator } from "./loading";

function isModifiedEvent(event: MouseEvent) {
  const eventTarget = event.currentTarget;
  const target = eventTarget.getAttribute("target");
  return (
    (target && target !== "_self") ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    (event.nativeEvent && event.nativeEvent.which === 2)
  );
}

export type LinkProps = ComponentProps<"a">;

export const Link = forwardRef(function Link(
  props: LinkProps,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const { href, onClick, ...restProps } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const globalLoadingIndicator = useGlobalLoadingIndicator();

  useEffect(() => {
    if (isPending) {
      globalLoadingIndicator.startLoading();
    }
    return () => {
      if (isPending) {
        globalLoadingIndicator.endLoading();
      }
    };
  }, [isPending, globalLoadingIndicator]);

  const navigate = (e: MouseEvent<HTMLAnchorElement>): boolean => {
    if (isModifiedEvent(e)) {
      return false;
    }

    const url = e.currentTarget.href;
    router.push(url);
    return true;
  };

  if (!href || !isLocalURL(href)) {
    return <a {...restProps} ref={ref} href={href} onClick={onClick} />;
  }

  return (
    <NextLink
      {...restProps}
      ref={ref}
      href={href}
      onClick={(e) => {
        onClick?.(e);

        if (e.defaultPrevented) {
          return;
        }

        let handled = false;
        startTransition(() => {
          handled = navigate(e);
        });
        if (handled) {
          e.preventDefault();
        }
      }}
    />
  );
});
