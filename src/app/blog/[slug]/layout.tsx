import { ReactNode } from "react";
import { fetchPosts } from "@/server/post";

export async function generateStaticParams() {
  return (await fetchPosts(false)).map((post) => ({ slug: post.slug }));
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
