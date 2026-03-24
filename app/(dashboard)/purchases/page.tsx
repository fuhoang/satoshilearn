export default function PurchasesPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm text-zinc-500">Purchases</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Subscription and purchase history
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            This page is where active plans, invoices, and future purchase history
            will appear once billing is connected.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Current state
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
            <p>No purchases are linked to this account yet.</p>
            <p>
              When Stripe subscription sync is added, this page can list plans,
              billing status, renewals, and invoice links.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
