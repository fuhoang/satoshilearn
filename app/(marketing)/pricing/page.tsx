import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { createPageMetadata } from "@/lib/seo";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Core lessons and preview access to the tutor.",
  },
  {
    name: "Pro",
    price: "$19",
    description: "Full curriculum, quizzes, and AI tutor support.",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "Pricing",
  description:
    "View Blockwise pricing for Bitcoin learning plans, including curriculum access, quizzes, and AI tutor support.",
  pathname: "/pricing",
});

export default function PricingPage() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          Pricing
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">Simple plans for serious learners</h1>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.name} className="p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{plan.name}</p>
            <h2 className="mt-4 text-5xl font-black">{plan.price}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{plan.description}</p>
            <Link href="/learn" className="mt-8 inline-flex text-sm font-semibold text-[var(--accent-strong)]">
              Choose {plan.name}
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
