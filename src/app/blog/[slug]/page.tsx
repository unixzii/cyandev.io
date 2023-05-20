import { redirect } from "next/navigation";

export default function Page({
  params: { slug },
}: {
  params: { slug: string };
}) {
  return redirect(`/blog/${slug}/en`);
}
