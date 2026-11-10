import { SignupForm } from '@/components/auth-forms'

export default async function StudentSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return <SignupForm role="student" error={error} />
}
