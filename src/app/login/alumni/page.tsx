import { LoginForm } from '@/components/auth-forms'

export default async function AlumniLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>
}) {
  const { error, notice } = await searchParams
  return <LoginForm role="alumni" error={error ? error : undefined} notice={notice} />
}
