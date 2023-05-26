"use client";

import { FC } from "react";
import { ReadableArea } from "./adaptive-containers";
import { registerSlot } from "./slot";
import { format as formatDate } from "date-fns";

const [FooterSlotPortal, _FooterSlot] = registerSlot("footer");

FooterSlotPortal.displayName = "FooterSlotPortal";
_FooterSlot.displayName = "FooterSlot";

export const Footer: FC = () => {
  return (
    <footer className="pt-6 pb-16 md:pb-24">
      <ReadableArea className="flex justify-between">
        <p className="text-foreground-secondary text-center md:text-left text-sm font-light">
          © {formatDate(Date.now(), "yyyy")} Cyandev
        </p>
        <FooterSlotPortal />
      </ReadableArea>
    </footer>
  );
};

export const FooterSlot = _FooterSlot;
