import { FC, PropsWithChildren } from "react";
import { selectClass } from "@/utils";

type ReadableAreaProps = {
  hasVerticalMargins?: boolean;
  className?: string;
};
export const ReadableArea: FC<PropsWithChildren<ReadableAreaProps>> = ({
  hasVerticalMargins,
  className,
  children,
}) => {
  return (
    <div
      className={selectClass(
        {
          "mx-auto max-w-3xl px-4": true,
          "my-16": hasVerticalMargins,
        },
        className
      )}
    >
      {children}
    </div>
  );
};
