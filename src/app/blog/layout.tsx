import { PropsWithChildren } from "react";
import { NavBar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ReadableArea } from "@/components/adaptive-containers";
import { SlotProvider } from "@/components/slot";

export default function BlogLayout({ children }: PropsWithChildren) {
  return (
    <SlotProvider>
      <NavBar />
      <ReadableArea hasVerticalMargins>{children}</ReadableArea>
      <Footer />
    </SlotProvider>
  );
}
