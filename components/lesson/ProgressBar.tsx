export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-zinc-500">
        <span>Course Progress</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 rounded-full bg-white/10">
        <div
          className="h-3 rounded-full bg-[linear-gradient(90deg,#f97316,#f59e0b)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
