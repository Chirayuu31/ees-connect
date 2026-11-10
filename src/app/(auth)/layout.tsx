import { GuestHeader } from "@/components/guest-header";

// auth pages render ONLY guest chrome — no session-dependent navbar, so a
// stale client payload or router-cache entry can never leak member UI
// (Feed/People/Messages/Sign out) onto the sign-in/sign-up screens.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuestHeader />
      {children}
    </>
  );
}
