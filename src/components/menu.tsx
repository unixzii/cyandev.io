import { Fragment, ReactElement, useEffect } from "react";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import { useOpaqueRef } from "@/utils";
import { RevealHighlightPlatter } from "./reveal-highlight";

export const MenuButton = HeadlessMenu.Button;

export type MenuProps<T> = {
  button: ReactElement;
  menuContainerClassName?: string;
  items: T[];
  itemRenderer: (item: T) => [(active: boolean) => ReactElement, string];
  onOpen?: () => void;
  onClose?: () => void;
};

function _MenuOpenStateListener(
  props: Pick<MenuProps<any>, "onOpen" | "onClose">
) {
  const { onOpen, onClose } = props;
  const onOpenRef = useOpaqueRef(onOpen);
  const onCloseRef = useOpaqueRef(onClose);
  useEffect(() => {
    onOpenRef.current?.call(null);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      onCloseRef.current?.call(null);
    };
  }, [onOpenRef, onCloseRef]);
  return <></>;
}

export function Menu<T>(props: MenuProps<T>) {
  return (
    <HeadlessMenu as={Fragment}>
      {props.button}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-75"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-75"
      >
        <HeadlessMenu.Items className="absolute bottom-12 right-0 w-40 px-1.5 py-1.5 origin-bottom-right rounded-xl backdrop-blur bg-background/60 border border-border shadow-[0_8px_32px_10px_rgba(0,0,0,0.8)] ring-0 outline-none select-none">
          <_MenuOpenStateListener
            onOpen={props.onOpen}
            onClose={props.onClose}
          />
          <RevealHighlightPlatter innerClassName={props.menuContainerClassName}>
            {props.items.map((item) => {
              const [childFn, key] = props.itemRenderer(item);
              return (
                <HeadlessMenu.Item as={Fragment} key={key}>
                  {({ active }) => childFn(active)}
                </HeadlessMenu.Item>
              );
            })}
          </RevealHighlightPlatter>
        </HeadlessMenu.Items>
      </Transition>
    </HeadlessMenu>
  );
}
