import type { Lesson } from "@/types/lesson";

export function LessonContent({ lesson }: { lesson: Lesson }) {
  const paragraphs = lesson.body.split("\n\n");

  return (
    <article className="rounded-[2rem] border border-white/10 bg-black p-8 text-white">
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Lesson walkthrough
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Read the core idea clearly</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Reading time
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-200">{lesson.duration}</p>
        </div>
      </div>
      <div className="space-y-6">
        {paragraphs.map((paragraph, index) => (
          <section
            key={`${lesson.slug}-${index + 1}`}
            className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Part 0{index + 1}
            </p>
            <p className="mt-3 text-base leading-8 text-zinc-200">{paragraph}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
