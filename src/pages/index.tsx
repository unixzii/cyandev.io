import { useState } from "react";
import { Link } from "react-router";

import * as env from "@/env";
import {
  Logo,
  isAnimationAllowed as isLogoAnimationAllowed,
  disableAnimation as disableLogoAnimation,
} from "@/components/Logo";
import { FormattedTime } from "@/components/FormattedTime";
import postIndex from "virtual:postIndex";

function PostItem({ post }: { post: PostMetadata }) {
  const date = new Date(post.date!);

  return (
    <li className="flex flex-col gap-1 mb-8">
      <Link
        className="text-xl font-semibold underline decoration-transparent hover:decoration-primary transition-colors duration-200"
        data-cuelume-release="release"
        to={`/post/${post.slug}`}
      >
        {post.title}
      </Link>
      <FormattedTime className="text-sm text-secondary" dateTime={date} />
    </li>
  );
}

export default function RootPage() {
  const [logoAnimated] = useState(() => {
    const value = isLogoAnimationAllowed();
    if (env.getType() === "client") {
      disableLogoAnimation();
    }
    return value;
  });

  return (
    <main>
      <h1 className="page-title">
        <Logo animated={logoAnimated} />
      </h1>
      <p className="page-subtitle">
        A random guy on the internet, a software engineer.
      </p>
      <div className="mt-16">
        <ul>
          {postIndex.map((post) => (
            <PostItem key={post.slug} post={post} />
          ))}
        </ul>
      </div>
    </main>
  );
}
