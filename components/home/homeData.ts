import type { Route } from "next";

import { moduleConfig } from "@/content/config";
import { publicGuides } from "@/lib/public-guides";

const MODULE_ACCENTS = [
  {
    accent: "from-amber-400/25 via-orange-500/10 to-transparent",
    border: "border-amber-400/25",
  },
  {
    accent: "from-emerald-400/25 via-cyan-500/10 to-transparent",
    border: "border-emerald-400/25",
  },
  {
    accent: "from-sky-400/25 via-indigo-500/10 to-transparent",
    border: "border-sky-400/25",
  },
  {
    accent: "from-rose-400/25 via-red-500/10 to-transparent",
    border: "border-rose-400/25",
  },
  {
    accent: "from-violet-400/25 via-fuchsia-500/10 to-transparent",
    border: "border-violet-400/25",
  },
  {
    accent: "from-lime-400/25 via-green-500/10 to-transparent",
    border: "border-lime-400/25",
  },
] as const;

export const homeModules = moduleConfig.slice(0, 3).map((module, index) => ({
  ...module,
  cta: "Open module",
  href: `/learn/module/${module.slug}` as Route,
  ...MODULE_ACCENTS[index % MODULE_ACCENTS.length],
}));

export const homePricingPlans = [
  {
    name: "Monthly plan",
    price: "£14.99",
    cadence: "/month",
    description:
      "Full curriculum, 30 AI tutor questions per day, quizzes, progress tracking, and deeper security lessons.",
    footnote: null,
    cta: "Start monthly plan",
    plan: "pro_monthly" as const,
  },
  {
    name: "Yearly plan",
    price: "£149.99",
    cadence: "/year",
    description:
      "Full curriculum, 30 AI tutor questions per day, quizzes, progress tracking, and deeper security lessons with a fixed annual price.",
    footnote: "Save compared with the monthly plan.",
    cta: "Start yearly plan",
    plan: "pro_yearly" as const,
  },
] as const;

export const homePromptHighlights = [
  "Clear lessons",
  "Safe guidance",
  "Built for beginners",
] as const;

export const homeChatStarters = [
  "What is Bitcoin in plain English?",
  "How do wallets actually work?",
  "Why do transaction fees exist?",
] as const;

export const homeHeroChatStarters = homeChatStarters.slice(0, 2);

export const homeInChatStarters = [
  "Explain Bitcoin simply",
  "How do wallets work?",
  "Why do fees exist?",
] as const;

export const homePublicGuides = publicGuides;

export const homeFaq = [
  {
    question: "Is Blockwise for complete beginners?",
    answer:
      "Yes. The public guides and live curriculum are designed for people who want plain-language explanations and a clearer starting path into crypto.",
  },
  {
    question: "Why does Blockwise start with Bitcoin?",
    answer:
      "Bitcoin is the live learning track today and gives beginners a strong foundation in money, ownership, wallets, and network trust before newer tracks arrive.",
  },
  {
    question: "Do I need to buy crypto to use Blockwise?",
    answer:
      "No. You can use the guides, lessons, and tutor to learn the concepts first and build judgment before deciding whether ownership makes sense for you.",
  },
  {
    question: "Will Blockwise cover more than Bitcoin later?",
    answer:
      "Yes. The product is designed for multiple crypto tracks over time, while keeping the current live learning path focused and coherent.",
  },
] as const;
