import Link from 'next/link'
import Image from 'next/image'
import { MessagesSquare, Compass, BookOpen, Sprout } from 'lucide-react'
import strata from '../../../public/folded-strata.jpg'

const FEATURES = [
  [
    MessagesSquare,
    'Ask doubts',
    'From core-course confusion to career forks — answered by seniors and alumni who have been there.',
  ],
  [
    Compass,
    'Opportunities',
    'Internships, PhD openings, scholarships and fellowships, posted by people who know the department.',
  ],
  [
    BookOpen,
    'Resources',
    "Notes, lab material, entrance prep — the department's collective brain, in one shelf.",
  ],
  [
    Sprout,
    'Find mentors',
    'Alumni who explicitly opted in to guide students, across geology, hydrology, EES and environmental sciences.',
  ],
] as const

export default async function LandingPage() {
  return (
    <div>
      {/* ——— hero: the dealt moment, strata photo full-bleed ——— */}
      <section className="relative overflow-hidden">
        <Image
          src={strata}
          alt=""
          aria-hidden="true"
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-[65%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 sm:pt-28 sm:pb-20 2xl:max-w-7xl">
          <h1 className="rise font-display font-semibold leading-[1.04] text-balance [font-size:clamp(2.6rem,7vw,4.75rem)]">
            The EES community of IISER&nbsp;Bhopal, one place at last.
          </h1>
          <p className="rise rise-2 mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Students and alumni of the Earth &amp; Environmental Sciences department,
            trading doubts, opportunities, resources and mentorship where none of it
            ever lived before.
          </p>
          <div className="rise rise-3 mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/signup/student"
              className="btnpress rounded-xl bg-accent px-5 py-2.5 font-medium text-accent-fg shadow-lift transition hover:brightness-110"
            >
              I&apos;m a student →
            </Link>
            <Link
              href="/signup/alumni"
              className="btnpress rounded-xl border border-line bg-surface px-5 py-2.5 font-medium shadow-card transition hover:shadow-lift"
            >
              I&apos;m an alum →
            </Link>
            <Link href="/login" className="link-underline px-1 py-0.5 text-sm text-muted hover:text-foreground">
              already a member
            </Link>
          </div>
        </div>
      </section>

      {/* ——— what lives here ——— */}
      <section className="mx-auto max-w-6xl border-t border-line py-16 2xl:max-w-7xl">
        <dl className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([Icon, title, body]) => (
            <div key={title} className="group max-w-sm lg:max-w-none">
              <dt className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-accent shadow-card transition-colors duration-300 group-hover:border-accent/40 group-hover:bg-accent-soft">
                  <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="font-display text-lg font-semibold">{title}</span>
              </dt>
              <dd className="mt-2.5 pl-13 text-sm leading-relaxed text-muted">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ——— the trust band ——— */}
      <section className="border-t border-line py-14 text-sm leading-relaxed text-muted">
        <p className="mx-auto max-w-2xl px-4">
          <span className="font-medium text-foreground">Students</span> sign up with their{' '}
          <span className="font-mono text-xs">@iiserb.ac.in</span> address and walk straight in.{' '}
          <span className="font-medium text-foreground">Alumni</span> enroll with any email — an
          admin verifies each one before anything is visible, so no bad actors ever see the room.
        </p>
      </section>
    </div>
  )
}
