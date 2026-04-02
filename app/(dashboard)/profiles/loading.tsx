import {
  SkeletonCard,
  SkeletonContainer,
  SkeletonCopy,
  SkeletonEyebrow,
  SkeletonPage,
  SkeletonSection,
  SkeletonTitle,
} from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfilesLoading() {
  return (
    <SkeletonPage className="px-6 py-12">
      <SkeletonContainer>
        <SkeletonSection>
          <SkeletonEyebrow className="w-20" />
          <SkeletonTitle className="max-w-2xl" />
          <SkeletonCopy
            className="mt-4 max-w-3xl"
            lines={["w-full", "w-[85%] max-w-2xl"]}
          />
        </SkeletonSection>

        <SkeletonSection>
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <SkeletonEyebrow className="w-32" />
              <Skeleton className="mt-4 h-10 w-full max-w-sm" />
              <SkeletonCopy
                className="mt-4 max-w-2xl"
                lines={["w-full max-w-md", "w-full max-w-2xl", "w-[88%] max-w-2xl"]}
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4 border-t border-white/10 pt-8 md:grid-cols-2">
            <SkeletonCard className="rounded-2xl p-4">
              <SkeletonEyebrow className="w-20" />
              <Skeleton className="mt-4 h-5 w-32" />
            </SkeletonCard>
            <SkeletonCard className="rounded-2xl p-4">
              <SkeletonEyebrow className="w-24" />
              <Skeleton className="mt-4 h-5 w-full" />
            </SkeletonCard>
          </div>
        </SkeletonSection>

        <SkeletonSection>
          <SkeletonEyebrow className="w-28" />
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <SkeletonEyebrow />
              <Skeleton className="mt-3 h-12 w-full" />
            </div>
            <div>
              <SkeletonEyebrow />
              <Skeleton className="mt-3 h-12 w-full" />
            </div>
          </div>
          <div className="mt-5">
            <SkeletonEyebrow />
            <Skeleton className="mt-3 h-14 w-full" />
          </div>
          <div className="mt-5">
            <SkeletonEyebrow className="w-16" />
            <Skeleton className="mt-3 h-28 w-full" />
          </div>
          <Skeleton className="mt-6 h-11 w-40 rounded-full" />
        </SkeletonSection>

        <SkeletonSection>
          <SkeletonEyebrow className="w-28" />
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
          <Skeleton className="mt-6 h-11 w-44 rounded-full" />
        </SkeletonSection>

        <SkeletonSection>
          <SkeletonEyebrow />
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.9fr]">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        </SkeletonSection>
      </SkeletonContainer>
    </SkeletonPage>
  );
}
