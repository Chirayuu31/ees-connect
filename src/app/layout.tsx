import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";
import { NavbarShell } from "@/components/navbar-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavGate } from "@/components/nav-gate";
import { getCurrentProfile, unreadCount } from "@/lib/db";
import type { Profile } from "@/lib/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "EES Connect — IISER Bhopal",
  description:
    "The Earth & Environmental Sciences community platform of IISER Bhopal. Students and alumni sharing doubts, opportunities, resources and mentorship.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        <Root>{children}</Root>
      </body>
    </html>
  );
}

async function Root({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const unread = profile ? await unreadCount() : 0;
  return (
    <>
      {/* navbar renders for members; hidden entirely on auth pages,
          where the (auth)-layout GuestHeader owns the top bar */}
      {profile && (
        <NavGate>
          <NavbarShell
            profile={profile as Profile}
            unread={unread}
            admin={profile.role === "admin" && profile.verified}
          />
        </NavGate>
      )}
      {!profile && (
        <NavGate auth>
          <GuestBar />
        </NavGate>
      )}
      <main className="w-full flex-1">{children}</main>
      <Footer signed={!!profile} />
    </>
  );
}

function Footer({ signed }: { signed: boolean }) {
  return (
    <footer className="border-t border-line bg-background/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left">
        <p className="font-display text-sm font-semibold">
          EES<span className="text-accent">·</span>Connect
          <span className="ml-3 font-sans text-[11px] font-normal leading-5 text-muted">
            Earth &amp; Environmental Sciences, IISER Bhopal
          </span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
          <Link href="/feed" className="link-underline">Feed</Link>
          <Link href="/directory" className="link-underline">People</Link>
          <Link href="/tags" className="link-underline">Tags</Link>
          {signed ? (
            <Link href="/settings" className="link-underline">Settings</Link>
          ) : (
            <Link href="/login" className="link-underline">Sign in</Link>
          )}
        </div>
      </div>
    </footer>
  );
}

function GuestBar() {
  return (
    <header className="glass border-b border-line">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 18c2-6 4-9 7-9s4 3 7 3 3-2 4-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M3 14c2-5 4-8 7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            EES<span className="text-accent">·</span>Connect
          </span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/directory" className="link-underline text-muted hover:text-foreground">People</Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="btnpress rounded-lg bg-accent px-3.5 py-1.5 font-medium text-accent-fg transition hover:brightness-110"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
