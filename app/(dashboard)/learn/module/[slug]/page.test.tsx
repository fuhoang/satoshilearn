import { render, screen } from "@testing-library/react";

import LearnModulePage from "@/app/(dashboard)/learn/module/[slug]/page";

const notFound = vi.fn(() => {
  throw new Error("notFound");
});

vi.mock("next/navigation", () => ({
  notFound: () => notFound(),
}));

vi.mock("@/components/learn/ModuleOverview", () => ({
  default: ({
    module,
  }: {
    module: { title: string; lessons: { title: string }[] };
  }) => (
    <div data-testid="module-overview">
      <h1>{module.title}</h1>
      <p>{module.lessons.length} lessons</p>
    </div>
  ),
}));

describe("learn module page route", () => {
  beforeEach(() => {
    notFound.mockClear();
  });

  it("renders the module overview for a valid module slug", async () => {
    const page = await LearnModulePage({
      params: Promise.resolve({ slug: "foundations" }),
    });

    render(page);

    expect(screen.getByTestId("module-overview")).toBeInTheDocument();
    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByText("5 lessons")).toBeInTheDocument();
  });

  it("calls notFound for an unknown module slug", async () => {
    await expect(
      LearnModulePage({
        params: Promise.resolve({ slug: "missing-module" }),
      }),
    ).rejects.toThrow("notFound");
  });
});
