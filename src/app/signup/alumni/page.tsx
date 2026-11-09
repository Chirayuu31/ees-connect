import { SignupForm } from '@/components/auth-forms'

export default async function AlumniSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return <SignupForm role="alumni" error={error} />
}
