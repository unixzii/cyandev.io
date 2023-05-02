"use client";

import {
  ComponentProps,
  ForwardedRef,
  MouseEvent,
  forwardRef,
  useEffect,
  useRef,
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

export type LinkProps = ComponentProps<typeof NextLink>;

export const Link = forwardRef(function Link(
  props: LinkProps,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const memorizedPending = useRef(false);
  const globalLoadingIndicator = useGlobalLoadingIndicator();

  useEffect(() => {
    memorizedPending.current = isPending;
    if (isPending) {
      globalLoadingIndicator.startLoading();
    }
    return () => {
      if (memorizedPending.current) {
        globalLoadingIndicator.endLoading();
      }
    };
  }, [isPending, memorizedPending, globalLoadingIndicator]);

  const navigate = (e: MouseEvent<HTMLAnchorElement>): boolean => {
    if (isModifiedEvent(e)) {
      return false;
    }

    const url = e.currentTarget.href;
    if (!isLocalURL(url)) {
      return false;
    }

    router.push(url);
    return true;
  };

  return (
    <NextLink
      {...props}
      ref={ref}
      onClick={(e) => {
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
