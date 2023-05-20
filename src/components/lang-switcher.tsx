"use client";

import { Switch } from "@headlessui/react";
import { selectClass } from "@/utils";

export type LangSwitcherProps = {
  value?: boolean;
  onChange?: (value: boolean) => void;
};

export function LangSwitcher(props: LangSwitcherProps) {
  const { value, onChange } = props;

  return (
    <Switch
      checked={value}
      onChange={onChange}
      className={selectClass({
        "relative inline-flex h-[32px] w-[58px] box-content items-center border-border border rounded-full":
          true,
      })}
      aria-label="查看中文翻译"
    >
      <span className="sr-only">查看中文翻译</span>
      <span
        className={selectClass({
          "inline-block h-[28px] w-[28px] transform rounded-full bg-border transition duration-300":
            true,
          "translate-x-[28px]": value,
          "translate-x-[2px]": !value,
        })}
      />
      <div className="absolute flex left-0 top-0 w-full h-full items-center text-center text-xs px-[2px] select-none">
        <span
          className={selectClass({
            "flex-1 transition-colors duration-300": true,
            "text-foreground font-semibold": !value,
            "text-foreground/50": value,
          })}
        >
          A
        </span>
        <span
          className={selectClass({
            "flex-1 transition-colors duration-300": true,
            "text-foreground font-semibold": value,
            "text-foreground/50": !value,
          })}
        >
          中
        </span>
      </div>
    </Switch>
  );
}
