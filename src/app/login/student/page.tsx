import { LoginForm } from '@/components/auth-forms'

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>
}) {
  const { error, notice } = await searchParams
  return <LoginForm role="student" error={error ? error : undefined} notice={notice} />
}
