import { PropsWithChildren, HTMLAttributes } from "react";
import { useRevealHighlight } from "./reveal-highlight";

export type ButtonProps = {
  // TBD.
  extraClassName?: string;
} & HTMLAttributes<HTMLDivElement>;

export default function Button(props: PropsWithChildren<ButtonProps>) {
  const { extraClassName, children } = props;

  const revealHighlight = useRevealHighlight();

  const innerProps = Object.assign({}, props);
  delete innerProps["extraClassName"];

  return (
    <div
      className={`px-3 py-1.5 font-medium opacity-60 hover:opacity-100 transition-opacity duration-200 ${
        extraClassName || ""
      }`}
      role="button"
      {...revealHighlight}
      {...innerProps}
    >
      {children}
    </div>
  );
}
