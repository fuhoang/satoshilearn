import type { Route } from "next";

export type PublicGuide = {
  description: string;
  eyebrow: string;
  faq: Array<{
    answer: string;
    question: string;
  }>;
  href: Route;
  id:
    | "learn-crypto"
    | "bitcoin-for-beginners"
    | "crypto-wallet-basics"
    | "what-is-bitcoin"
    | "how-crypto-transactions-work"
    | "crypto-security-basics";
  intro: string;
  ogTitle: string;
  ogSubtitle: string;
  sections: Array<{
    body: string;
    title: string;
  }>;
  summary: string;
  title: string;
};

export const publicGuides: PublicGuide[] = [
  {
    id: "learn-crypto",
    href: "/learn-crypto",
    eyebrow: "Crypto basics",
    title: "Learn crypto with a clear starting path",
    summary:
      "Get a practical introduction to crypto through simple explanations, guided lessons, and a live Bitcoin-first learning track.",
    description:
      "Learn crypto with a beginner-friendly roadmap, starting with a live Bitcoin track, practical explanations, quizzes, and an AI tutor in Blockwise.",
    intro:
      "Crypto makes more sense when you learn the core ideas in order. Blockwise starts with Bitcoin because it gives beginners a clear foundation in money, wallets, ownership, and network trust before expanding into more tracks.",
    ogTitle: "Learn crypto with a clear path.",
    ogSubtitle: "Beginner lessons, quizzes, and tutor support starting with Bitcoin.",
    sections: [
      {
        title: "Start with the foundations",
        body:
          "Learn why money matters, what makes digital assets different, and how open networks handle trust, ownership, and scarcity.",
      },
      {
        title: "Move into wallets and transactions",
        body:
          "Build confidence around self-custody, seed phrases, fees, confirmations, and the mistakes beginners should avoid early on.",
      },
      {
        title: "Use guided practice",
        body:
          "Lessons, quizzes, and the AI tutor work together so you can reinforce concepts instead of passively reading through them.",
      },
    ],
    faq: [
      {
        question: "Is Blockwise only for Bitcoin right now?",
        answer:
          "The live curriculum is Bitcoin-first today, but the product is designed to grow into broader crypto tracks without changing the learning flow.",
      },
      {
        question: "Who is this guide for?",
        answer:
          "It is built for beginners who want structure, safer explanations, and a clearer path into crypto than scattered videos or social posts.",
      },
      {
        question: "Do I need technical experience?",
        answer:
          "No. The goal is to explain core crypto concepts in plain language and build intuition before deeper technical details.",
      },
    ],
  },
  {
    id: "bitcoin-for-beginners",
    href: "/bitcoin-for-beginners",
    eyebrow: "Bitcoin beginners",
    title: "Bitcoin for beginners, without the noise",
    summary:
      "Understand Bitcoin step by step with beginner lessons on money, scarcity, wallets, transactions, and security.",
    description:
      "Explore Bitcoin for beginners with lessons on money, scarcity, wallets, transactions, and self-custody in Blockwise.",
    intro:
      "Bitcoin is the best place to start if you want to understand crypto clearly. It teaches the foundations of digital scarcity, ownership, and network verification without requiring you to memorize jargon first.",
    ogTitle: "Bitcoin for beginners.",
    ogSubtitle: "A calmer starting point for money, scarcity, wallets, and security.",
    sections: [
      {
        title: "Understand why Bitcoin exists",
        body:
          "Start with the monetary problems Bitcoin responds to, then build toward how scarcity, decentralization, and open verification fit together.",
      },
      {
        title: "Learn safe ownership habits",
        body:
          "Beginner-friendly lessons explain wallets, keys, seed phrases, and the practical security habits that matter most.",
      },
      {
        title: "Practice with simple reinforcement",
        body:
          "Use quizzes and guided tutor prompts to test what you understand and slow down when a topic needs another pass.",
      },
    ],
    faq: [
      {
        question: "Why start with Bitcoin instead of another crypto asset?",
        answer:
          "Bitcoin gives beginners the clearest starting point for understanding scarcity, ownership, and open monetary networks before they compare other systems.",
      },
      {
        question: "Will this help with wallets and transactions?",
        answer:
          "Yes. The curriculum covers wallet basics, self-custody, transaction flow, confirmations, and common mistakes.",
      },
      {
        question: "Can I learn at my own pace?",
        answer:
          "Yes. The lessons are short, progress is saved to your account, and the AI tutor is there when you want extra explanation.",
      },
    ],
  },
  {
    id: "crypto-wallet-basics",
    href: "/crypto-wallet-basics",
    eyebrow: "Wallet basics",
    title: "Crypto wallet basics for real beginners",
    summary:
      "Learn what a crypto wallet actually does, how keys work, and how to avoid the most common beginner mistakes.",
    description:
      "Understand crypto wallet basics, including keys, seed phrases, self-custody, and safer storage habits with Blockwise.",
    intro:
      "Most beginners think a wallet holds coins. In practice, wallets manage keys and access. Once that clicks, the rest of self-custody becomes much easier to understand.",
    ogTitle: "Crypto wallet basics.",
    ogSubtitle: "Understand keys, seed phrases, custody, and safer habits early.",
    sections: [
      {
        title: "What a wallet really controls",
        body:
          "A wallet manages your keys and helps you sign actions on-chain. That means the core lesson is ownership and access, not coins sitting inside an app.",
      },
      {
        title: "Why seed phrases matter",
        body:
          "Recovery phrases are the backup to your access. Understanding them early makes the difference between safe custody and fragile setup habits.",
      },
      {
        title: "How beginners stay safer",
        body:
          "Good wallet habits are boring on purpose: verify addresses, slow down, protect backups, and understand custodial versus non-custodial tradeoffs.",
      },
    ],
    faq: [
      {
        question: "Is this only about Bitcoin wallets?",
        answer:
          "The live examples in Blockwise start with Bitcoin, but the underlying wallet concepts apply broadly across crypto.",
      },
      {
        question: "Do I need a hardware wallet immediately?",
        answer:
          "Not always. Beginners first need to understand keys, recovery, and custody tradeoffs before deciding what setup fits them best.",
      },
      {
        question: "What is the biggest wallet mistake beginners make?",
        answer:
          "Treating the wallet like a normal app account instead of understanding that keys and recovery phrases are the real source of access.",
      },
    ],
  },
  {
    id: "what-is-bitcoin",
    href: "/what-is-bitcoin",
    eyebrow: "Bitcoin explained",
    title: "What is Bitcoin, in plain language?",
    summary:
      "Understand Bitcoin as a scarce, open monetary network and why it matters as the live starting track inside Blockwise.",
    description:
      "Learn what Bitcoin is in plain language, why it matters, and how beginners can approach it without technical overload in Blockwise.",
    intro:
      "Bitcoin can sound abstract until you frame it around money, ownership, and open verification. For beginners, it is less helpful to memorize buzzwords than to understand why the network exists and what problem it is trying to solve.",
    ogTitle: "What is Bitcoin?",
    ogSubtitle: "A plain-language explanation for beginners starting in crypto.",
    sections: [
      {
        title: "Bitcoin is a monetary network",
        body:
          "At its core, Bitcoin is a system for tracking ownership and value without requiring a bank or company to control the ledger alone.",
      },
      {
        title: "Scarcity changes how people think about it",
        body:
          "Bitcoin has a fixed supply policy, which makes it different from systems where rules can change more easily or issuance can expand.",
      },
      {
        title: "Begin with the practical view",
        body:
          "For beginners, the most useful first questions are how ownership works, how wallets fit in, and why transactions need verification.",
      },
    ],
    faq: [
      {
        question: "Is Bitcoin the same thing as crypto?",
        answer:
          "Bitcoin is one part of the broader crypto landscape, but it is often the clearest place for beginners to build first-principles understanding.",
      },
      {
        question: "Why does Blockwise start with Bitcoin?",
        answer:
          "It is the live track today and gives beginners a strong foundation in scarcity, self-custody, and network trust before they compare other systems.",
      },
      {
        question: "Do I need to buy Bitcoin to learn it?",
        answer:
          "No. You can learn the concepts first, understand the risks, and build judgment before deciding whether ownership makes sense for you.",
      },
    ],
  },
  {
    id: "how-crypto-transactions-work",
    href: "/how-crypto-transactions-work",
    eyebrow: "Transactions",
    title: "How crypto transactions work for beginners",
    summary:
      "Learn the simple flow behind addresses, signing, network verification, fees, and confirmations without drowning in jargon.",
    description:
      "Understand how crypto transactions work, including signing, fees, confirmations, and common beginner mistakes in Blockwise.",
    intro:
      "Crypto transactions are easier to understand when you stop thinking about them like a bank transfer and start thinking about signed messages that a network verifies. That shift makes fees, confirmations, and wallet behavior much more intuitive.",
    ogTitle: "How crypto transactions work.",
    ogSubtitle: "From signing to confirmations, without the jargon overload.",
    sections: [
      {
        title: "A transaction starts with a signed instruction",
        body:
          "Your wallet uses keys to authorize a movement of value. The network then checks whether that instruction is valid and spendable.",
      },
      {
        title: "Fees pay for inclusion and priority",
        body:
          "Fees are part of how networks prioritize limited block space, which is why they can rise and fall depending on demand.",
      },
      {
        title: "Confirmations build confidence",
        body:
          "Once included, later blocks strengthen the confidence that the transaction is final enough for the context.",
      },
    ],
    faq: [
      {
        question: "Why do crypto transactions take time?",
        answer:
          "Because networks need to validate and include them, and later confirmations increase confidence that the transaction is settled.",
      },
      {
        question: "Why do fees change?",
        answer:
          "Fees usually reflect how much demand there is for limited block space at a given moment.",
      },
      {
        question: "Does this guide only apply to Bitcoin?",
        answer:
          "The live examples in Blockwise are Bitcoin-first, but the basic mental model of signing, broadcasting, and confirmation helps across crypto networks.",
      },
    ],
  },
  {
    id: "crypto-security-basics",
    href: "/crypto-security-basics",
    eyebrow: "Security basics",
    title: "Crypto security basics for beginners",
    summary:
      "Learn the safety habits that matter most early on: seed phrase handling, phishing awareness, wallet checks, and slowing down before mistakes.",
    description:
      "Learn crypto security basics in Blockwise, including seed phrase handling, phishing awareness, wallet verification, and safer beginner habits.",
    intro:
      "Security is where many beginners feel overwhelmed, but the fundamentals are simpler than they look. The goal is not paranoia. It is learning a few habits that reduce the biggest avoidable mistakes before you move real value.",
    ogTitle: "Crypto security basics.",
    ogSubtitle: "Seed phrases, phishing, wallet checks, and safer habits for beginners.",
    sections: [
      {
        title: "Protect access before anything else",
        body:
          "Good security starts with understanding what gives access: keys, seed phrases, devices, and recovery paths. Once you know what matters, the rest gets clearer.",
      },
      {
        title: "Slow down around addresses and links",
        body:
          "A large share of beginner mistakes come from rushing. Verifying addresses, links, and app sources is boring by design, and that is exactly why it works.",
      },
      {
        title: "Treat self-custody like a real responsibility",
        body:
          "The main tradeoff in crypto security is control versus convenience. Beginners do better when they understand that tradeoff before copying setups from the internet.",
      },
    ],
    faq: [
      {
        question: "What is the first crypto security habit to learn?",
        answer:
          "Understand what your wallet, keys, and recovery phrase actually control. That makes almost every other security decision easier.",
      },
      {
        question: "Do beginners need perfect security immediately?",
        answer:
          "No. They need strong fundamentals first: verify addresses, protect recovery information, avoid rushing, and understand custody tradeoffs.",
      },
      {
        question: "Is this guide only about Bitcoin security?",
        answer:
          "The live examples in Blockwise start with Bitcoin, but these core safety habits apply broadly across crypto.",
      },
    ],
  },
];

export function getPublicGuide(id: PublicGuide["id"]) {
  return publicGuides.find((guide) => guide.id === id);
}
