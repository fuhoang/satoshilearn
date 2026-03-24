"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function QuizCard() {
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    "Bitcoin is valuable because it is easy to create.",
    "Bitcoin is valuable because supply is predictable and verification is open.",
    "Bitcoin is valuable because banks can print more of it when demand rises.",
  ];

  return (
    <Card className="border border-white/10 !bg-white/[0.03] p-6 text-white shadow-none">
      <p className="text-sm font-semibold text-zinc-500">Quick Check</p>
      <h3 className="mt-2 text-xl font-bold text-white">
        Which statement best explains Bitcoin scarcity?
      </h3>
      <div className="mt-5 space-y-3">
        {options.map((option) => (
          <button
            key={option}
            className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
              selected === option
                ? "border-orange-500/40 bg-orange-500/10 text-white"
                : "border-white/10 bg-black/40 text-zinc-300 hover:bg-white/[0.05]"
            }`}
            onClick={() => setSelected(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <Button className="w-full bg-orange-500 !text-black hover:bg-orange-400" variant="primary">
          {selected === options[1] ? "Correct answer selected" : "Select an answer"}
        </Button>
      </div>
    </Card>
  );
}
