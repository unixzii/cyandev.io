"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LangSwitcher } from "@/components/lang-switcher";

export type LangSwitcherInteractionProps = {
  slug: string;
  translationEnabled: boolean;
};

export function LangSwitcherInteraction(props: LangSwitcherInteractionProps) {
  const { slug, translationEnabled } = props;

  const [pendingValue, setPendingValue] = useState<boolean | undefined>(
    undefined
  );

  const router = useRouter();
  function handleValueChange(value: boolean) {
    if (pendingValue !== undefined) {
      return;
    }

    setPendingValue(value);
    setTimeout(() => {
      if (value) {
        router.replace(`/blog/${slug}/zh_CN`);
      } else {
        router.replace(`/blog/${slug}`);
      }
    }, 200);
  }

  return (
    <div className="mb-2">
      <LangSwitcher
        value={pendingValue === undefined ? translationEnabled : pendingValue}
        onChange={handleValueChange}
      />
    </div>
  );
}
