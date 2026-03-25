import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl pt-4">
          <p className="text-sm text-zinc-500">Authentication</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Set a new password.
          </h1>
          <p className="mt-5 text-base leading-8 text-zinc-400 sm:text-lg">
            This page completes the reset flow after you open the secure email
            link from Blockwise.
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
