import Link from "next/link";

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
      { title: "How Bitcoin works (simple view)", href: "/learn/what-is-bitcoin" },
      { title: "The blockchain explained", href: "/learn/transactions" },
      { title: "What makes Bitcoin secure?", href: "/learn/security" },
      { title: "Why Bitcoin is scarce (21 million)", href: "/learn/what-is-bitcoin" },
      { title: "Decentralisation explained", href: "/learn/what-is-bitcoin" },
    ],
  },
  {
    title: "Wallets & Ownership",
    description:
      "This is where most people get confused",
    lessons: [
      { title: "What is a Bitcoin wallet?", href: "/learn/wallets" },
      { title: "Custodial vs non-custodial wallets", href: "/learn/wallets" },
      { title: "Private keys explained", href: "/learn/wallets" },
      { title: "Seed phrases (very important)", href: "/learn/security" },
      { title: "How to store Bitcoin safely", href: "/learn/security" },
    ],
  },
  {
    title: "Transactions",
    description: "How Bitcoin actually moves",
    lessons: [
      { title: "How transactions work", href: "/learn/transactions" },
      { title: "What are fees?", href: "/learn/transactions" },
      { title: "Confirmations explained", href: "/learn/transactions" },
      { title: "Sending and receiving Bitcoin", href: "/learn/transactions" },
      { title: "Common transaction mistakes", href: "/learn/transactions" },
    ],
  },
  {
    title: "Mining & Network",
    description: "What keeps Bitcoin running",
    lessons: [
      { title: "What is mining?", href: "/learn/what-is-bitcoin" },
      { title: "Proof of Work explained", href: "/learn/what-is-bitcoin" },
      { title: "Why miners exist", href: "/learn/what-is-bitcoin" },
      { title: "Difficulty and hash rate", href: "/learn/what-is-bitcoin" },
      { title: "Energy and Bitcoin (simple explanation)", href: "/learn/what-is-bitcoin" },
    ],
  },
  {
    title: "Safety & Mistakes",
    description: "Critical for beginners",
    lessons: [
      { title: "Common Bitcoin scams", href: "/learn/security" },
      { title: "How people lose Bitcoin", href: "/learn/security" },
      { title: "Exchange risks", href: "/learn/security" },
      { title: "Phishing and fake apps", href: "/learn/security" },
      { title: "Safety checklist", href: "/learn/security" },
    ],
  },
  {
    title: "Real World Use",
    description: "Make it practical",
    lessons: [
      { title: "How to buy Bitcoin", href: "/learn/what-is-bitcoin" },
      { title: "Where to buy (exchanges vs P2P)", href: "/learn/what-is-bitcoin" },
      { title: "Using Bitcoin in daily life", href: "/learn/transactions" },
      { title: "Storing vs spending", href: "/learn/wallets" },
      { title: "Long-term thinking", href: "/learn/what-is-money" },
    ],
  },
  {
    title: "Advanced Basics (still beginner-friendly)",
    description: "Level up understanding",
    lessons: [
      { title: "Nodes explained", href: "/learn/what-is-bitcoin" },
      { title: "Lightning Network (simple)", href: "/learn/transactions" },
      { title: "Hard forks vs soft forks", href: "/learn/what-is-bitcoin" },
      { title: "Bitcoin vs other crypto", href: "/learn/what-is-bitcoin" },
      { title: "Why Bitcoin is different", href: "/learn/what-is-bitcoin" },
    ],
  },
  {
    title: "Mindset & Strategy",
    description: "This is what most people miss",
    lessons: [
      { title: "Volatility explained", href: "/learn/what-is-money" },
      { title: "Long-term vs short-term thinking", href: "/learn/what-is-money" },
      { title: "Emotional mistakes beginners make", href: "/learn/security" },
      { title: "Why people panic sell", href: "/learn/what-is-money" },
      { title: "Building conviction", href: "/learn/what-is-bitcoin" },
    ],
  },
] as const;

export default function LearnPage() {
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
                0 of 9 lessons completed
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
