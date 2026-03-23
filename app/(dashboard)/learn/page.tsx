const modules = [
  {
    title: "Foundations",
    description:
      "Understand the basics before anything else",
    lessons: [
      "What is money?",
      "The problem with traditional money",
      "What is Bitcoin?",
      "Who created Bitcoin?",
      "Why does Bitcoin matter?",
    ],
  },
  {
    title: "Core Concepts",
    description:
      "Build real understanding",
    lessons: [
      "How Bitcoin works (simple view)",
      "The blockchain explained",
      "What makes Bitcoin secure?",
      "Why Bitcoin is scarce (21 million)",
      "Decentralisation explained",
    ],
  },
  {
    title: "Wallets & Ownership",
    description:
      "This is where most people get confused",
    lessons: [
      "What is a Bitcoin wallet?",
      "Custodial vs non-custodial wallets",
      "Private keys explained",
      "Seed phrases (very important)",
      "How to store Bitcoin safely",
    ],
  },
  {
    title: "Transactions",
    description: "How Bitcoin actually moves",
    lessons: [
      "How transactions work",
      "What are fees?",
      "Confirmations explained",
      "Sending and receiving Bitcoin",
      "Common transaction mistakes",
    ],
  },
  {
    title: "Mining & Network",
    description: "What keeps Bitcoin running",
    lessons: [
      "What is mining?",
      "Proof of Work explained",
      "Why miners exist",
      "Difficulty and hash rate",
      "Energy and Bitcoin (simple explanation)",
    ],
  },
  {
    title: "Safety & Mistakes",
    description: "Critical for beginners",
    lessons: [
      "Common Bitcoin scams",
      "How people lose Bitcoin",
      "Exchange risks",
      "Phishing and fake apps",
      "Safety checklist",
    ],
  },
  {
    title: "Real World Use",
    description: "Make it practical",
    lessons: [
      "How to buy Bitcoin",
      "Where to buy (exchanges vs P2P)",
      "Using Bitcoin in daily life",
      "Storing vs spending",
      "Long-term thinking",
    ],
  },
  {
    title: "Advanced Basics (still beginner-friendly)",
    description: "Level up understanding",
    lessons: [
      "Nodes explained",
      "Lightning Network (simple)",
      "Hard forks vs soft forks",
      "Bitcoin vs other crypto",
      "Why Bitcoin is different",
    ],
  },
  {
    title: "Mindset & Strategy",
    description: "This is what most people miss",
    lessons: [
      "Volatility explained",
      "Long-term vs short-term thinking",
      "Emotional mistakes beginners make",
      "Why people panic sell",
      "Building conviction",
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
                      key={lesson}
                      className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                    >
                      <div>
                        <p className="text-xs text-zinc-500">
                          Lesson 0{lessonIndex + 1}
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {lesson}
                        </p>
                      </div>
                      <button
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/5"
                        type="button"
                      >
                        Open
                      </button>
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
            <button
              className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
              type="button"
            >
              Open “What is Bitcoin?”
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
