// the (app) group owns the member chrome for every non-auth page. The
// proxy redirects unauthenticated visitors to /login before any (app)
// page renders, so guests never reach this layout.
import { NavbarShell } from "@/components/navbar-shell";
import { getCurrentProfile, unreadCount } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const unread = profile ? await unreadCount() : 0;

  if (!profile) {
    const url = "/login";
    redirect(url);
  }

  return (
    <>
      <NavbarShell
        profile={profile as Profile}
        unread={unread}
        admin={profile.role === "admin" && profile.verified}
      />
      <main className="w-full flex-1">{children}</main>
    </>
  );
}
