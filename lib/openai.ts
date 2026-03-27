type TutorTopic =
  | "Bitcoin foundations"
  | "Wallets"
  | "Transactions"
  | "Mining"
  | "Market psychology"
  | "Network basics";

const TOPIC_MATCHERS: Array<{
  pattern: RegExp;
  topic: TutorTopic;
}> = [
  {
    pattern: /(wallet|seed|custody|private key|self-custody)/,
    topic: "Wallets",
  },
  {
    pattern: /(fee|transaction|send|receive|confirm)/,
    topic: "Transactions",
  },
  {
    pattern: /(mining|miner|hash|energy|difficulty)/,
    topic: "Mining",
  },
  {
    pattern: /(price|volatile|panic|market|conviction)/,
    topic: "Market psychology",
  },
  {
    pattern: /(blockchain|node|decentralized|network)/,
    topic: "Network basics",
  },
];

const TOPIC_CONTENT: Record<
  TutorTopic,
  {
    nextStep: string;
    primer: string;
  }
> = {
  "Bitcoin foundations": {
    primer:
      "Bitcoin gets easier when you anchor it to ownership, scarcity, and how value moves without a central operator.",
    nextStep:
      "A strong next step is to compare Bitcoin to a bank ledger and ask what changes when nobody controls the ledger alone.",
  },
  Wallets: {
    primer:
      "Wallets are really about key control, not coin storage. That framing makes most beginner wallet confusion disappear.",
    nextStep:
      "A strong next step is to compare custodial and non-custodial wallets, then map where the keys actually live.",
  },
  Transactions: {
    primer:
      "Bitcoin transactions are messages the network verifies, not transfers approved by a company.",
    nextStep:
      "A strong next step is to trace one payment from wallet creation to confirmation and notice where fees and confirmations matter.",
  },
  Mining: {
    primer:
      "Mining is best understood as the process that orders transactions into blocks while competing under shared rules.",
    nextStep:
      "A strong next step is to connect mining, confirmations, and node verification so the roles do not blur together.",
  },
  "Market psychology": {
    primer:
      "Price moves often confuse beginners, so it helps to separate Bitcoin's long-term design from short-term market emotion.",
    nextStep:
      "A strong next step is to separate price volatility from the protocol itself and focus on time horizon before conclusions.",
  },
  "Network basics": {
    primer:
      "The network matters because many independent participants verify the same rules rather than trusting one operator.",
    nextStep:
      "A strong next step is to distinguish what nodes do from what miners do, because that clears up many security questions.",
  },
};

const DEFAULT_TOPIC: TutorTopic = "Bitcoin foundations";

export function inferTutorTopic(message: string) {
  const lowered = message.toLowerCase();

  return (
    TOPIC_MATCHERS.find(({ pattern }) => pattern.test(lowered))?.topic ??
    DEFAULT_TOPIC
  );
}

export async function createTutorReply(message: string) {
  const cleaned = message.trim();

  if (!cleaned) {
    return "Ask about Bitcoin, money, wallets, or transactions and I will break it down step by step.";
  }

  const topic = inferTutorTopic(cleaned);
  const content = TOPIC_CONTENT[topic];

  return `${content.primer}\n\nYou asked: "${cleaned}"\n\n${content.nextStep}`;
}
