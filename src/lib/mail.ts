// Email notifications via Resend. Without RESEND_API_KEY it logs and
// skips — the app never blocks on mail.
const FROM = process.env.EMAIL_FROM ?? 'EES Connect <onboarding@resend.dev>'

export function sendMail(to: string | undefined, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.log(`[mail:skipped] to=${to ?? '(unknown)'} subject=${subject}`)
    return Promise.resolve(null)
  }
  if (!to) return Promise.resolve(null)

  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, text }),
  }).catch((e) => {
    console.error('[mail:error]', e)
    return null
  })
}
