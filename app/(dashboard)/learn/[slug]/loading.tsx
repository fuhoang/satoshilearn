import {
  SkeletonChipRow,
  SkeletonCopy,
  SkeletonEyebrow,
  SkeletonPage,
  SkeletonSection,
  SkeletonTitle,
} from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LessonLoading() {
  return (
    <SkeletonPage className="space-y-8 px-6 py-10">
      <SkeletonSection>
        <SkeletonEyebrow className="w-28" />
        <SkeletonTitle />
        <SkeletonCopy
          className="mt-4 max-w-2xl"
          lines={["w-full", "w-3/4 max-w-xl"]}
        />
        <SkeletonChipRow
          className="mt-8"
          chips={["w-36", "w-40", "w-32"]}
        />
      </SkeletonSection>

      <SkeletonSection className="p-6">
        <Skeleton className="h-4 w-full rounded-full" />
      </SkeletonSection>

      <section
        id="lesson-content"
        className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="space-y-6">
          <SkeletonSection>
            <Skeleton className="aspect-video w-full rounded-[1.75rem]" />
          </SkeletonSection>

          <SkeletonSection>
            <SkeletonEyebrow />
            <Skeleton className="mt-6 h-10 w-full max-w-2xl" />
            <SkeletonCopy
              className="mt-8 space-y-4"
              lines={["w-full", "w-[94%]", "w-[88%]", "w-[91%]", "w-[78%]"]}
            />
          </SkeletonSection>
        </div>

        <aside className="space-y-6">
          <SkeletonSection className="p-6">
            <SkeletonEyebrow className="w-20" />
            <SkeletonCopy className="mt-5" lines={["w-full", "w-[90%]", "w-[82%]"]} />
          </SkeletonSection>

          <SkeletonSection className="p-6">
            <SkeletonEyebrow />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </SkeletonSection>
        </aside>
      </section>

      <SkeletonSection>
        <SkeletonEyebrow className="w-28" />
        <Skeleton className="mt-6 h-8 w-full max-w-xl" />
        <div className="mt-8 grid gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </SkeletonSection>
    </SkeletonPage>
  );
}
