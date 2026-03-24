import { Card } from "@/components/ui/Card";

export function QuizResult() {
  return (
    <Card className="border border-white/10 !bg-white/[0.03] p-6 text-white shadow-none">
      <p className="text-sm font-semibold text-emerald-400">Result</p>
      <p className="mt-2 text-base leading-7 text-zinc-300">
        Scarcity matters because users can trust the supply rules in advance instead of relying on a central issuer to stay disciplined.
      </p>
    </Card>
  );
}
