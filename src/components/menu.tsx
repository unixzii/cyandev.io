import { Fragment, ReactElement } from "react";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import { RevealHighlightPlatter } from "./reveal-highlight";

export const MenuButton = HeadlessMenu.Button;

export type MenuProps<T> = {
  button: ReactElement;
  items: T[];
  itemRenderer: (item: T) => [(active: boolean) => ReactElement, string];
};

export default function Menu<T>(props: MenuProps<T>) {
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
        <HeadlessMenu.Items className="absolute bottom-12 right-0 w-40 px-1.5 py-1.5 origin-bottom-right rounded-xl backdrop-blur bg-background/60 border border-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <RevealHighlightPlatter>
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
