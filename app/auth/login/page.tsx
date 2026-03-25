import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/AuthForm";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Log in",
  description: "Log in to your Blockwise account to continue your Bitcoin learning progress.",
  pathname: "/auth/login",
  noIndex: true,
});
import {
  getAuthErrorFromSearchParam,
  getAuthMessageFromSearchParam,
} from "@/lib/auth-feedback";
import { sanitizeNextPath } from "@/lib/auth-redirects";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);
  const initialError = getAuthErrorFromSearchParam(params.error);
  const initialMessage = getAuthMessageFromSearchParam(params.message, nextPath);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl pt-4">
          <p className="text-sm text-zinc-500">Authentication</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Continue your Bitcoin learning with a real account.
          </h1>
          <p className="mt-5 text-base leading-8 text-zinc-400 sm:text-lg">
            Supabase Auth will handle sign in, session cookies, and future user-owned
            progress persistence for BlockWise.
          </p>
        </div>
        <AuthForm
          initialError={initialError}
          initialMessage={initialMessage}
          mode="login"
          nextPath={nextPath}
        />
      </div>
    </main>
  );
}
