"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";

type NavLink = {
  href: Route | "/#demo" | "/#pricing";
  label: string;
};

type NavbarClientProps = {
  isAuthenticated: boolean;
  userLabel: string | null;
};

const NAV_LINKS = [
  { href: "/learn", label: "Curriculum" },
  { href: "/#pricing", label: "Pricing" },
] satisfies NavLink[];

const BRAND_FONT_STACK =
  '"Bungee", Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif';

export function NavbarClient({
  isAuthenticated,
  userLabel,
}: NavbarClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/90 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex items-center justify-between md:hidden">
          <Link
            href="/"
            className="flex items-end justify-center gap-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <span
              className="text-center text-xl uppercase tracking-[0.08em] text-white sm:text-2xl"
              style={{ fontFamily: BRAND_FONT_STACK }}
            >
              Satoshi Learn
            </span>
            <span
              aria-hidden="true"
              className="mb-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-black text-black"
            >
              ₿
            </span>
          </Link>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            <span
              className={`h-0.5 w-5 rounded-full bg-white transition-transform ${
                isMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 rounded-full bg-white transition-opacity ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 rounded-full bg-white transition-transform ${
                isMenuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        <nav className="hidden items-center gap-6 justify-self-start text-sm text-zinc-400 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className="hidden items-end justify-center gap-2 md:flex md:justify-self-center"
        >
          <span
            className="text-center text-xl uppercase tracking-[0.08em] text-white sm:text-2xl md:text-3xl"
            style={{ fontFamily: BRAND_FONT_STACK }}
          >
            Satoshi Learn
          </span>
          <span
            aria-hidden="true"
            className="mb-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-black text-black"
          >
            ₿
          </span>
        </Link>
        <div className="hidden items-center justify-center gap-3 md:flex md:justify-self-end">
          {isAuthenticated ? (
            <>
              {userLabel ? (
                <span className="max-w-48 truncate text-sm text-zinc-400">
                  {userLabel}
                </span>
              ) : null}
              <a
                href="/auth/logout"
                className="text-sm text-zinc-400 transition hover:text-white"
                rel="nofollow"
              >
                Log out
              </a>
              <Link href="/learn">
                <Button className="bg-orange-500 !text-white hover:bg-orange-400 hover:!text-white">
                  Continue learning
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                Log in
              </Link>
              <Link href="/learn">
                <Button className="bg-orange-500 !text-white hover:bg-orange-400 hover:!text-white">
                  Start Learning
                </Button>
              </Link>
            </>
          )}
        </div>

        {isMenuOpen ? (
          <div
            id="mobile-navigation"
            className="rounded-3xl border border-white/10 bg-white/5 p-4 md:hidden"
          >
            <nav className="flex flex-col gap-3 text-sm text-zinc-300">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
              {isAuthenticated ? (
                <>
                  {userLabel ? (
                    <p className="truncate text-center text-xs uppercase tracking-[0.16em] text-zinc-500">
                      {userLabel}
                    </p>
                  ) : null}
                  <a
                    href="/auth/logout"
                    onClick={() => setIsMenuOpen(false)}
                    rel="nofollow"
                  >
                    <Button className="w-full" variant="secondary">
                      Log out
                    </Button>
                  </a>
                  <Link href="/learn" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-orange-500 !text-white hover:bg-orange-400 hover:!text-white">
                      Continue learning
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full" variant="secondary">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/learn" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full px-3 py-1.5 text-[11px] bg-orange-500 !text-white hover:bg-orange-400 hover:!text-white">
                      Start Learning
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
