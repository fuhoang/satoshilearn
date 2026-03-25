import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("includes the public homepage, pricing page, and guide pages", () => {
    const result = sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        "http://localhost:3000/",
        "http://localhost:3000/pricing",
        "http://localhost:3000/learn-crypto",
        "http://localhost:3000/bitcoin-for-beginners",
        "http://localhost:3000/crypto-wallet-basics",
        "http://localhost:3000/what-is-bitcoin",
        "http://localhost:3000/how-crypto-transactions-work",
        "http://localhost:3000/crypto-security-basics",
      ]),
    );
  });
});
