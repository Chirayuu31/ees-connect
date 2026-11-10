import { redirect } from "next/navigation";
import { NavbarShell } from "@/components/navbar-shell";
import { Footer } from "@/components/guest-footer";
import { getCurrentProfile, unreadCount } from "@/lib/db";
import type { Profile } from "@/lib/types";

// the (app) group owns the member chrome + footer for every non-auth page.
// The proxy redirects unauthenticated visitors to /login before any (app)
// page renders, so guests never reach this layout.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const unread = profile ? await unreadCount() : 0;

  if (!profile) redirect("/login");

  return (
    <>
      <NavbarShell
        profile={profile as Profile}
        unread={unread}
        admin={profile.role === "admin" && profile.verified}
      />
      <main className="w-full flex-1">{children}</main>
      <Footer signed />
    </>
  );
}
