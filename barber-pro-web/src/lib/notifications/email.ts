import { Resend } from 'resend'
import { buildEmail, type EmailTemplateInput } from './templates'

const resend = new Resend(process.env.RESEND_API_KEY || '')

const FROM =
  process.env.RESEND_FROM_EMAIL || 'Barber Pro <onboarding@resend.dev>'

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder_123')
}

export async function sendNotificationEmail(
  to: string,
  templateKind: string,
  data: EmailTemplateInput
): Promise<{ ok: boolean; error?: string }> {
  if (!to || !isEmailConfigured()) {
    return { ok: false, error: 'Email no configurado o destinatario vacío' }
  }

  try {
    const { subject, html } = buildEmail(templateKind, data)
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error enviando email' }
  }
}

export async function sendAdminEmail(
  templateKind: string,
  data: EmailTemplateInput
): Promise<{ ok: boolean; error?: string }> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
  if (!adminEmail) return { ok: false, error: 'ADMIN_NOTIFICATION_EMAIL no definido' }
  return sendNotificationEmail(adminEmail, templateKind, data)
}
