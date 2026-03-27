"use client";

import { useEffect, useState } from "react";

import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonTutorPanel } from "@/components/lesson/LessonTutorPanel";
import type { Lesson } from "@/types/lesson";

export function LessonWorkspace({
  keyPoints,
  lesson,
}: {
  keyPoints: string[];
  lesson: Lesson;
}) {
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  useEffect(() => {
    if (isTutorOpen) {
      document.body.dataset.lessonTutorOpen = "true";
    } else {
      delete document.body.dataset.lessonTutorOpen;
    }

    return () => {
      delete document.body.dataset.lessonTutorOpen;
    };
  }, [isTutorOpen]);

  return (
    <div>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <LessonContent lesson={lesson} />
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              In this lesson
            </p>
            <div className="mt-5 space-y-3">
              {keyPoints.map((point, index) => (
                <div
                  key={`${lesson.slug}-point-${index + 1}`}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                    Key idea 0{index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-zinc-300">{point}</p>
                </div>
              ))}
            </div>
          </div>
          <LessonTutorPanel
            isOpen={isTutorOpen}
            lessonTitle={lesson.title}
            onOpenChange={setIsTutorOpen}
          />
        </aside>
      </div>
    </div>
  );
}
