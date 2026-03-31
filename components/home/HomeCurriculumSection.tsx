import Link from "next/link";

import { homeModules } from "@/components/home/homeData";

export function HomeCurriculumSection() {
  return (
    <section id="curriculum" className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm text-zinc-500">Curriculum</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            A clearer path into crypto.
          </h2>
          <p className="mt-4 text-base leading-8 text-zinc-400">
            Start with the live Bitcoin track, build confidence around security
            and transactions, and use AI prompts for deeper understanding as more
            tracks arrive.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {homeModules.map((module) => (
            <div
              key={module.slug}
              className={`group relative flex h-full overflow-hidden rounded-[1.75rem] border bg-black p-6 text-left transition-transform duration-200 hover:-translate-y-1 ${module.border}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${module.accent} opacity-80 transition-opacity duration-200 group-hover:opacity-100`}
              />
              <div className="relative flex h-full flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-400">
                    Module {String(module.order).padStart(2, "0")}
                  </p>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-300">
                    {module.lessons.length} lessons
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {module.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {module.description}
                </p>
                <div className="mt-auto pt-6">
                  <Link
                    href={module.href}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black shadow-none transition hover:bg-orange-400"
                  >
                    {module.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
