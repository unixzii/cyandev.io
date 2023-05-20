import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET(
  request: Request,
  {
    params: { slug },
  }: {
    params: { slug: string };
  }
) {
  const url = new URL(request.url);
  url.pathname = `/blog/${slug}/en`;
  url.search = ""; // Remove the extra search params.
  return NextResponse.redirect(url);
}
