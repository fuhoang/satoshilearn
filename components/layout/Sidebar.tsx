import Link from "next/link";

import { lessonConfig } from "@/content/config";
import { cn } from "@/lib/utils";

export function Sidebar({ activeSlug }: { activeSlug?: string }) {
  return (
    <aside className="surface h-fit rounded-3xl p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Curriculum
      </p>
      <div className="space-y-2">
        {lessonConfig.map((lesson) => (
          <Link
            key={lesson.slug}
            href={`/learn/${lesson.slug}`}
            className={cn(
              "block rounded-2xl px-4 py-3 transition-colors",
              activeSlug === lesson.slug
                ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "hover:bg-black/5",
            )}
          >
            <p className="text-sm font-semibold">{lesson.title}</p>
            <p className="text-xs text-[var(--muted)]">{lesson.duration}</p>
          </Link>
        ))}
      </div>
    </aside>
  );
}
