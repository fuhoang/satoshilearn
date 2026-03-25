import { AuthForm } from "@/components/auth/AuthForm";
import { sanitizeNextPath } from "@/lib/auth-redirects";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl pt-4">
          <p className="text-sm text-zinc-500">Authentication</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Create an account before wiring progress to the database.
          </h1>
          <p className="mt-5 text-base leading-8 text-zinc-400 sm:text-lg">
            This is the first step toward real user-owned lesson progress, quiz
            history, and subscription state in Supabase.
          </p>
        </div>
        <AuthForm mode="register" nextPath={nextPath} />
      </div>
    </main>
  );
}
