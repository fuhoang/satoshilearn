import {
  SkeletonCard,
  SkeletonChipRow,
  SkeletonCopy,
  SkeletonEyebrow,
  SkeletonPage,
  SkeletonTitle,
} from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LearnLoading() {
  return (
    <SkeletonPage>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SkeletonEyebrow />
          <SkeletonTitle />
          <SkeletonCopy className="mt-4 max-w-2xl" lines={["w-full"]} />

          <SkeletonChipRow
            className="mt-8"
            chips={["h-20 w-40 rounded-xl", "h-20 w-48 rounded-xl", "h-20 w-32 rounded-xl", "h-20 w-40 rounded-xl"]}
          />
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            <SkeletonCard className="rounded-3xl bg-white/[0.03]">
              <SkeletonEyebrow />
              <Skeleton className="mt-5 h-8 w-full max-w-xs" />
              <SkeletonCopy className="mt-4" lines={["w-full"]} />
              <div className="mt-6 space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="mt-8 h-11 w-full rounded-xl" />
            </SkeletonCard>
            <SkeletonCard className="rounded-3xl bg-white/[0.03]">
              <SkeletonEyebrow />
              <Skeleton className="mt-5 h-8 w-full max-w-xs" />
              <SkeletonCopy className="mt-4" lines={["w-full"]} />
              <div className="mt-6 space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="mt-8 h-11 w-full rounded-xl" />
            </SkeletonCard>
            <SkeletonCard className="rounded-3xl bg-white/[0.03]">
              <SkeletonEyebrow />
              <Skeleton className="mt-5 h-8 w-full max-w-xs" />
              <SkeletonCopy className="mt-4" lines={["w-full"]} />
              <div className="mt-6 space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="mt-8 h-11 w-full rounded-xl" />
            </SkeletonCard>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <SkeletonEyebrow className="mx-auto w-28" />
            <Skeleton className="mx-auto mt-4 h-10 w-full max-w-xl" />
            <Skeleton className="mx-auto mt-4 h-5 w-full max-w-2xl" />
            <Skeleton className="mx-auto mt-6 h-11 w-56 rounded-xl" />
          </div>
        </div>
      </section>
    </SkeletonPage>
  );
}
