import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl pt-4">
          <p className="text-sm text-zinc-500">Authentication</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Recover access to your learning account.
          </h1>
          <p className="mt-5 text-base leading-8 text-zinc-400 sm:text-lg">
            Request a secure reset link if you can no longer sign in with your
            current password.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
