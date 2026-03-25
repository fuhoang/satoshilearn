import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
        <p>© 2026 BlockWise</p>
        <nav className="flex gap-5">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/learn">Curriculum</Link>
          <Link href="/auth/login">Log in</Link>
        </nav>
      </div>
    </footer>
  );
}
