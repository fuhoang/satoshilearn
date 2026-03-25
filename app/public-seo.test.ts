import { metadata as bitcoinForBeginnersMetadata } from "@/app/(marketing)/bitcoin-for-beginners/page";
import { metadata as securityMetadata } from "@/app/(marketing)/crypto-security-basics/page";
import { metadata as walletBasicsMetadata } from "@/app/(marketing)/crypto-wallet-basics/page";
import { metadata as transactionsMetadata } from "@/app/(marketing)/how-crypto-transactions-work/page";
import { metadata as learnCryptoMetadata } from "@/app/(marketing)/learn-crypto/page";
import { metadata as pricingMetadata } from "@/app/(marketing)/pricing/page";
import { metadata as whatIsBitcoinMetadata } from "@/app/(marketing)/what-is-bitcoin/page";
import { metadata as homeMetadata } from "@/app/page";

describe("public metadata", () => {
  it("keeps the homepage positioned around crypto learning", () => {
    expect(homeMetadata.title).toBe("Learn crypto the structured way");
    expect(homeMetadata.description).toContain("Learn crypto");
  });

  it("includes metadata for indexable guide pages", () => {
    expect(learnCryptoMetadata.alternates?.canonical).toBe("http://localhost:3000/learn-crypto");
    expect(learnCryptoMetadata.description).toContain("live Bitcoin track");
    expect(bitcoinForBeginnersMetadata.alternates?.canonical).toBe(
      "http://localhost:3000/bitcoin-for-beginners",
    );
    expect(bitcoinForBeginnersMetadata.description).toContain("Bitcoin for beginners");
    expect(walletBasicsMetadata.alternates?.canonical).toBe(
      "http://localhost:3000/crypto-wallet-basics",
    );
    expect(walletBasicsMetadata.description).toContain("crypto wallet basics");
    expect(whatIsBitcoinMetadata.alternates?.canonical).toBe(
      "http://localhost:3000/what-is-bitcoin",
    );
    expect(whatIsBitcoinMetadata.description).toContain("what Bitcoin is");
    expect(transactionsMetadata.alternates?.canonical).toBe(
      "http://localhost:3000/how-crypto-transactions-work",
    );
    expect(transactionsMetadata.description).toContain("crypto transactions work");
    expect(securityMetadata.alternates?.canonical).toBe(
      "http://localhost:3000/crypto-security-basics",
    );
    expect(securityMetadata.description).toContain("crypto security basics");
  });

  it("uses dedicated social images on public marketing pages", () => {
    expect(pricingMetadata.openGraph?.images).toEqual([
      {
        url: "http://localhost:3000/pricing/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Pricing",
      },
    ]);
    expect(learnCryptoMetadata.openGraph?.images).toEqual([
      {
        url: "http://localhost:3000/learn-crypto/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Learn crypto",
      },
    ]);
    expect(whatIsBitcoinMetadata.openGraph?.images).toEqual([
      {
        url: "http://localhost:3000/what-is-bitcoin/opengraph-image",
        width: 1200,
        height: 630,
        alt: "What is Bitcoin",
      },
    ]);
    expect(transactionsMetadata.openGraph?.images).toEqual([
      {
        url: "http://localhost:3000/how-crypto-transactions-work/opengraph-image",
        width: 1200,
        height: 630,
        alt: "How crypto transactions work",
      },
    ]);
    expect(securityMetadata.openGraph?.images).toEqual([
      {
        url: "http://localhost:3000/crypto-security-basics/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Crypto security basics",
      },
    ]);
  });
});
