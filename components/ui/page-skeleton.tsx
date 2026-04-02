import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/Skeleton";

export function SkeletonPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "min-h-screen bg-zinc-950 text-white",
        className,
      )}
    >
      {children}
    </main>
  );
}

export function SkeletonSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-white/10 bg-white/[0.03] p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SkeletonContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto max-w-5xl space-y-8", className)}>{children}</div>;
}

export function SkeletonEyebrow({
  className,
}: {
  className?: string;
}) {
  return <Skeleton className={cn("h-4 w-24 rounded-full", className)} />;
}

export function SkeletonTitle({
  className,
}: {
  className?: string;
}) {
  return <Skeleton className={cn("mt-5 h-12 w-full max-w-3xl", className)} />;
}

export function SkeletonCopy({
  lines = ["w-full", "w-[88%]"],
  className,
}: {
  lines?: string[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {lines.map((lineClass, index) => (
        <Skeleton key={`${lineClass}-${index}`} className={cn("h-5", lineClass)} />
      ))}
    </div>
  );
}

export function SkeletonChipRow({
  chips,
  className,
}: {
  chips: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {chips.map((chip, index) => (
        <Skeleton
          key={`${chip}-${index}`}
          className={cn("h-10 rounded-full", chip)}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/10 bg-black/30 p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
