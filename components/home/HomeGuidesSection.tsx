import Link from "next/link";

import { homePublicGuides } from "@/components/home/homeData";

export function HomeGuidesSection() {
  return (
    <section id="guides" className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-zinc-500">Public guides</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start with indexable guides, then go deeper inside the product.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-zinc-400">
            These public pages explain the basics clearly, give search engines
            real educational content to index, and point beginners toward the
            live Bitcoin track inside Blockwise.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-4 lg:grid-cols-3">
          {homePublicGuides.map((guide) => (
            <article
              key={guide.id}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-left"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                {guide.eyebrow}
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                {guide.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {guide.summary}
              </p>
              <Link
                href={guide.href}
                className="mt-6 inline-flex items-center text-sm font-semibold text-orange-300 transition hover:text-orange-200"
              >
                Read guide
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
