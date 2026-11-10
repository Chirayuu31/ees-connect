import { getCurrentProfile, unreadCount } from "@/lib/db";
import { NavbarShell } from "@/components/navbar-shell";
import { GuestHeader } from "@/components/guest-header";
import { Footer } from "@/components/guest-footer";

// the (site) group owns the landing page's chrome: rendered fresh server-side
// per request, resolving to the member navbar (signed in) or the guest header
// (signed out) — no router-cache payload can leak the wrong top bar onto it.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <>
      {profile ? (
        <NavbarShell
          profile={profile}
          unread={await unreadCount()}
          admin={profile.role === "admin" && profile.verified}
        />
      ) : (
        <GuestHeader />
      )}
      {children}
      <Footer signed={!!profile} />
    </>
  );
}
