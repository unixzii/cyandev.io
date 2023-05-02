import { PropsWithChildren } from "react";
import { NavBar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ReadableArea } from "@/components/adaptive-containers";

export default function BlogLayout({ children }: PropsWithChildren) {
  return (
    <>
      <NavBar />
      <ReadableArea hasVerticalMargins>{children}</ReadableArea>
      <Footer />
    </>
  );
}
