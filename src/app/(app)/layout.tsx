// pared down: auth pages keep their own guest chrome; the (app) group's layout
// owns the member navbar for every other route.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
