import Link from 'next/link'
import Image from 'next/image'
import { login, signup } from '@/app/actions'
import strata from '../../public/folded-strata.jpg'

const inputClass =
  'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent'

// desktop: visual panel | form column. mobile: form only.
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[88rem] px-4">
    <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:min-h-[calc(100svh-11rem)]">
      <aside className="relative hidden h-full min-h-[520px] overflow-hidden rounded-2xl border border-line shadow-card lg:block">
        <Image src={strata} alt="" aria-hidden="true" fill sizes="(min-width: 1280px) 700px, (min-width: 1024px) 55vw, 0px" className="object-cover object-[65%_center]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/55 to-transparent" />
        <p className="font-display absolute bottom-0 max-w-md p-10 text-[clamp(1.3rem,2vw,1.9rem)] font-semibold leading-snug text-foreground">
          Read the strata, meet the people who mapped them.
        </p>
      </aside>
      <div className="mx-auto w-full max-w-sm lg:max-w-lg">{children}</div>
    </div>
    </div>
  )
}

export function SignupForm({ role, error }: { role: 'student' | 'alumni'; error?: string }) {
  const student = role === 'student'
  return (
    <AuthShell>
      <div>
        <p className="text-sm font-medium text-accent">{student ? 'Students' : 'Alumni'}</p>
        <h1 className="font-display mb-1 text-[clamp(1.75rem,2.8vw,2.5rem)] font-semibold tracking-tight">Create account</h1>
        <p className="mb-6 text-sm text-muted">
          {student
            ? 'Use your @iiserb.ac.in email — confirmation lands instantly and no approval needed.'
            : 'Any email works. An EES admin verifies your account before you become visible — usually within a day.'}
        </p>

        {error && (
          <p className="mb-4 rounded-lg border border-opportunity/40 bg-opportunity/10 px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <form action={signup} className="space-y-4">
          <input type="hidden" name="role" value={role} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Full name</span>
            <input type="text" name="name" required maxLength={60} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email{student ? ' (must be @iiserb.ac.in)' : ''}</span>
            <input type="email" name="email" required autoComplete="email" className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password (min 8 chars)</span>
            <input type="password" name="password" required minLength={8} autoComplete="new-password" className={inputClass} />
          </label>
          <button type="submit" className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:shadow-card hover:brightness-110">
            Sign up
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <Link href="/signup" className="hover:underline">← other kind of account</Link>
          <span>
            Member?{' '}
            <Link href={`/login/${role}`} className="font-medium text-accent hover:underline">Sign in</Link>
          </span>
        </div>
      </div>
    </AuthShell>
  )
}

export function LoginForm({
  role,
  error,
  notice,
}: {
  role: 'student' | 'alumni'
  error?: string
  notice?: string
}) {
  const student = role === 'student'
  return (
    <AuthShell>
      <div>
        <p className="text-sm font-medium text-accent">{student ? 'Students' : 'Alumni'}</p>
        <h1 className="font-display mb-1 text-[clamp(1.75rem,2.8vw,2.5rem)] font-semibold tracking-tight">Sign in</h1>
        <p className="mb-6 text-sm text-muted">
          {student
            ? 'Sign in with your IISER Bhopal email and password.'
            : 'Sign in with the email you signed up with. Pending approval? You can sign in — you\'ll see your status right after.'}
        </p>

        {error && (
          <p className="mb-4 rounded-lg border border-opportunity/40 bg-opportunity/10 px-3 py-2 text-sm">
            {error}
          </p>
        )}
        {notice && (
          <p className="mb-4 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
            {notice}
          </p>
        )}

        <form action={login} className="space-y-4">
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="next" value="/feed" />
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input type="email" name="email" required autoComplete="email" className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input type="password" name="password" required autoComplete="current-password" className={inputClass} />
          </label>
          <button type="submit" className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:shadow-card hover:brightness-110">
            Sign in
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <Link href="/login" className="hover:underline">← other kind of account</Link>
          <span>
            No account?{' '}
            <Link href={`/signup/${role}`} className="font-medium text-accent hover:underline">Sign up</Link>
          </span>
        </div>
      </div>
    </AuthShell>
  )
}

// ---- chooser pages ----

export function AuthChooser({ kind }: { kind: 'login' | 'signup' }) {
  const isLogin = kind === 'login'
  return (
    <AuthShell>
      <div>
        <h1 className="font-display mb-1 text-[clamp(1.75rem,2.8vw,2.5rem)] font-semibold tracking-tight">
          {isLogin ? 'Sign in' : 'Join EES Connect'}
        </h1>
        <p className="mb-6 text-sm text-muted">
          {isLogin
            ? 'Are you a current student or a department alum?'
            : 'Pick yours — both get the same site, slightly different doors.'}
        </p>
        <div className="grid gap-3">
          <Link href={`/${kind}/student`} className="card card-hover p-5">
            <p className="font-semibold">I&apos;m a student</p>
            <p className="mt-1 text-sm text-muted">Currently at IISER Bhopal — {isLogin ? 'signs in with' : 'signs up with'} an @iiserb.ac.in email.</p>
          </Link>
          <Link href={`/${kind}/alumni`} className="card card-hover p-5">
            <p className="font-semibold">I&apos;m an alum</p>
            <p className="mt-1 text-sm text-muted">EES grad. Approval takes a moment the first time — after that it&apos;s instant.</p>
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}
