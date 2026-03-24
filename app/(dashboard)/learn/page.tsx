import Link from "next/link";
import { lessonConfig } from "@/content/config";

const modules = [
  {
    title: "Foundations",
    description:
      "Understand the basics before anything else",
    lessons: [
      { title: "What is money?", href: "/learn/what-is-money" },
      {
        title: "The problem with traditional money",
        href: "/learn/the-problem-with-traditional-money",
      },
      { title: "What is Bitcoin?", href: "/learn/what-is-bitcoin" },
      { title: "Who created Bitcoin?", href: "/learn/who-created-bitcoin" },
      {
        title: "Why does Bitcoin matter?",
        href: "/learn/why-does-bitcoin-matter",
      },
    ],
  },
  {
    title: "Core Concepts",
    description:
      "Build real understanding",
    lessons: [
      {
        title: "How Bitcoin works (simple view)",
        href: "/learn/how-bitcoin-works-simple-view",
      },
      {
        title: "The blockchain explained",
        href: "/learn/the-blockchain-explained",
      },
      {
        title: "What makes Bitcoin secure?",
        href: "/learn/what-makes-bitcoin-secure",
      },
      {
        title: "Why Bitcoin is scarce (21 million)",
        href: "/learn/why-bitcoin-is-scarce",
      },
      {
        title: "Decentralisation explained",
        href: "/learn/decentralisation-explained",
      },
    ],
  },
  {
    title: "Wallets & Ownership",
    description:
      "This is where most people get confused",
    lessons: [
      {
        title: "What is a Bitcoin wallet?",
        href: "/learn/what-is-a-bitcoin-wallet",
      },
      {
        title: "Custodial vs non-custodial wallets",
        href: "/learn/custodial-vs-non-custodial-wallets",
      },
      {
        title: "Private keys explained",
        href: "/learn/private-keys-explained",
      },
      { title: "Seed phrases (very important)", href: "/learn/seed-phrases" },
      {
        title: "How to store Bitcoin safely",
        href: "/learn/how-to-store-bitcoin-safely",
      },
    ],
  },
  {
    title: "Transactions",
    description: "How Bitcoin actually moves",
    lessons: [
      { title: "How transactions work", href: "/learn/how-transactions-work" },
      { title: "What are fees?", href: "/learn/what-are-fees" },
      {
        title: "Confirmations explained",
        href: "/learn/confirmations-explained",
      },
      {
        title: "Sending and receiving Bitcoin",
        href: "/learn/sending-and-receiving-bitcoin",
      },
      {
        title: "Common transaction mistakes",
        href: "/learn/common-transaction-mistakes",
      },
    ],
  },
  {
    title: "Mining & Network",
    description: "What keeps Bitcoin running",
    lessons: [
      { title: "What is mining?", href: "/learn/what-is-mining" },
      {
        title: "Proof of Work explained",
        href: "/learn/proof-of-work-explained",
      },
      { title: "Why miners exist", href: "/learn/why-miners-exist" },
      {
        title: "Difficulty and hash rate",
        href: "/learn/difficulty-and-hash-rate",
      },
      {
        title: "Energy and Bitcoin (simple explanation)",
        href: "/learn/energy-and-bitcoin",
      },
    ],
  },
  {
    title: "Safety & Mistakes",
    description: "Critical for beginners",
    lessons: [
      {
        title: "Common Bitcoin scams",
        href: "/learn/common-bitcoin-scams",
      },
      {
        title: "How people lose Bitcoin",
        href: "/learn/how-people-lose-bitcoin",
      },
      { title: "Exchange risks", href: "/learn/exchange-risks" },
      {
        title: "Phishing and fake apps",
        href: "/learn/phishing-and-fake-apps",
      },
      { title: "Safety checklist", href: "/learn/safety-checklist" },
    ],
  },
  {
    title: "Real World Use",
    description: "Make it practical",
    lessons: [
      { title: "How to buy Bitcoin", href: "/learn/how-to-buy-bitcoin" },
      {
        title: "Where to buy (exchanges vs P2P)",
        href: "/learn/where-to-buy-bitcoin",
      },
      {
        title: "Using Bitcoin in daily life",
        href: "/learn/using-bitcoin-in-daily-life",
      },
      { title: "Storing vs spending", href: "/learn/storing-vs-spending" },
      { title: "Long-term thinking", href: "/learn/long-term-thinking" },
    ],
  },
  {
    title: "Advanced Basics (still beginner-friendly)",
    description: "Level up understanding",
    lessons: [
      { title: "Nodes explained", href: "/learn/nodes-explained" },
      {
        title: "Lightning Network (simple)",
        href: "/learn/lightning-network-simple",
      },
      {
        title: "Hard forks vs soft forks",
        href: "/learn/hard-forks-vs-soft-forks",
      },
      {
        title: "Bitcoin vs other crypto",
        href: "/learn/bitcoin-vs-other-crypto",
      },
      {
        title: "Why Bitcoin is different",
        href: "/learn/why-bitcoin-is-different",
      },
    ],
  },
  {
    title: "Mindset & Strategy",
    description: "This is what most people miss",
    lessons: [
      {
        title: "Volatility explained",
        href: "/learn/volatility-explained",
      },
      {
        title: "Long-term vs short-term thinking",
        href: "/learn/long-term-vs-short-term-thinking",
      },
      {
        title: "Emotional mistakes beginners make",
        href: "/learn/emotional-mistakes-beginners-make",
      },
      {
        title: "Why people panic sell",
        href: "/learn/why-people-panic-sell",
      },
      {
        title: "Building conviction",
        href: "/learn/building-conviction",
      },
    ],
  },
] as const;

export default function LearnPage() {
  const totalLessons = lessonConfig.length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-sm text-zinc-500">Curriculum</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Start learning Bitcoin step by step.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            A simple learning path for beginners who want clear explanations,
            steady progress, and a better understanding of Bitcoin.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm text-zinc-400">Progress</p>
              <p className="mt-1 text-lg font-semibold text-white">
                0 of {totalLessons} lessons completed
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm text-zinc-400">Level</p>
              <p className="mt-1 text-lg font-semibold text-white">Beginner</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {modules.map((module, moduleIndex) => (
              <div
                key={module.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >
                <p className="text-sm text-zinc-500">Module 0{moduleIndex + 1}</p>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  {module.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {module.description}
                </p>

                <div className="mt-6 space-y-3">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={`${lesson.title}-${lessonIndex + 1}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                    >
                      <div>
                        <p className="text-xs text-zinc-500">
                          Lesson 0{lessonIndex + 1}
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {lesson.title}
                        </p>
                      </div>
                      <Link
                        href={lesson.href}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/5"
                      >
                        Open
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-sm text-zinc-500">Ready to begin?</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Start with the first lesson.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-zinc-400">
              The best place to begin is with the basics. Build a strong
              foundation first, then move deeper as you go.
            </p>
            <Link
              href="/learn/what-is-money"
              className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
            >
              Open “What is Money?”
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
