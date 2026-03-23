import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <main className="min-h-screen w-full">{children}</main>;
}
