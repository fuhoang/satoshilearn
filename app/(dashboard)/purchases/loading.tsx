import {
  SkeletonCard,
  SkeletonChipRow,
  SkeletonContainer,
  SkeletonCopy,
  SkeletonEyebrow,
  SkeletonPage,
  SkeletonSection,
  SkeletonTitle,
} from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PurchasesLoading() {
  return (
    <SkeletonPage className="px-6 py-12">
      <SkeletonContainer>
        <SkeletonSection>
          <SkeletonEyebrow />
          <SkeletonTitle />
          <SkeletonCopy
            className="mt-4 max-w-2xl"
            lines={["w-full", "w-[88%] max-w-2xl"]}
          />
        </SkeletonSection>

        <SkeletonSection>
          <SkeletonChipRow chips={["w-32", "w-36", "w-28"]} />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <SkeletonCard>
                <SkeletonEyebrow />
                <Skeleton className="mt-5 h-10 w-full max-w-sm" />
                <SkeletonCopy className="mt-4" lines={["w-full", "w-[92%]"]} />
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </SkeletonCard>

              <SkeletonCard>
                <SkeletonEyebrow />
                <div className="mt-5 space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </SkeletonCard>
            </div>

            <div className="space-y-6">
              <SkeletonCard>
                <SkeletonEyebrow className="w-20" />
                <SkeletonCopy className="mt-5" lines={["w-full", "w-[82%]"]} />
                <div className="mt-6 space-y-3">
                  <Skeleton className="h-12 w-full rounded-full" />
                  <Skeleton className="h-12 w-full rounded-full" />
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>
              </SkeletonCard>

              <SkeletonCard>
                <SkeletonEyebrow className="w-28" />
                <div className="mt-5 space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              </SkeletonCard>
            </div>
          </div>
        </SkeletonSection>
      </SkeletonContainer>
    </SkeletonPage>
  );
}
