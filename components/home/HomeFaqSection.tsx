import { homeFaq } from "@/components/home/homeData";

export function HomeFaqSection() {
  return (
    <section className="border-t border-white/10">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-zinc-500">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Common questions before you start learning.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-zinc-400">
            The public guides explain the basics, and these answers clarify how
            Blockwise is positioned today.
          </p>
        </div>

        <div className="mt-10 grid gap-4">
          {homeFaq.map((item) => (
            <article
              key={item.question}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-lg font-semibold text-white">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
