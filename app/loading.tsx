import {
  SkeletonChipRow,
  SkeletonCopy,
  SkeletonEyebrow,
  SkeletonPage,
} from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AppLoading() {
  return (
    <SkeletonPage className="overflow-x-hidden">
      <section className="relative overflow-visible border-b border-white/10">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-16 pt-18 text-center lg:pb-24 lg:pt-24">
          <div className="relative z-10 w-full max-w-5xl">
            <Skeleton className="mx-auto h-14 w-full max-w-4xl" />
            <SkeletonCopy
              className="mx-auto mt-5 max-w-2xl"
              lines={["w-full"]}
            />
            <SkeletonChipRow
              className="mt-8 items-center justify-center"
              chips={["w-32 rounded-xl", "w-32 rounded-xl", "w-36 rounded-xl"]}
            />
          </div>

          <div className="relative z-10 mt-28 flex w-full max-w-4xl flex-col items-center">
            <div className="w-full rounded-3xl border border-white/10 bg-zinc-900/80 p-5">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/40 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <div className="mt-3 flex items-center justify-between border-t border-white/10 px-2 pt-3">
                  <Skeleton className="h-4 w-40 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <SkeletonEyebrow className="mx-auto w-28" />
            <Skeleton className="mx-auto mt-4 h-10 w-full max-w-2xl" />
            <SkeletonCopy
              className="mx-auto mt-4 max-w-3xl"
              lines={["w-full"]}
            />
          </div>
          <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-3">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <SkeletonEyebrow className="mx-auto w-20" />
            <Skeleton className="mx-auto mt-4 h-10 w-full max-w-2xl" />
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </section>
    </SkeletonPage>
  );
}
