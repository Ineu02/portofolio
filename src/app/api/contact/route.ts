import { NextResponse } from 'next/server';
import { isValidEmail } from '@/lib/utils';

/**
 * Contact form API route.
 *
 * Sends an email via Resend (https://resend.com) when the contact form is
 * submitted. To enable it:
 *   1. npm install resend
 *   2. Add these to your environment (.env.local locally, project settings on Vercel):
 *        RESEND_API_KEY=re_xxxxxxxx
 *        CONTACT_TO_EMAIL=you@yourdomain.com      # where messages are delivered
 *        CONTACT_FROM_EMAIL=portfolio@yourdomain.com  # a verified Resend sender
 *
 * If RESEND_API_KEY is absent (e.g. in local dev before setup), the route
 * logs the message and returns success so the UI still works end-to-end.
 */

// Force the Node.js runtime — the Resend SDK isn't edge-compatible.
export const runtime = 'nodejs';

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  // Honeypot field — bots fill it, humans never see it.
  company?: unknown;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { name, email, message, company } = body;

  // Honeypot: silently accept and drop spam submissions.
  if (isNonEmptyString(company)) {
    return NextResponse.json({ ok: true });
  }

  // Server-side validation mirrors the client to prevent bad/abusive input.
  if (!isNonEmptyString(name)) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 422 });
  }
  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 422 });
  }
  if (!isNonEmptyString(message) || message.trim().length < 10) {
    return NextResponse.json(
      { error: 'Message must be at least 10 characters.' },
      { status: 422 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  // Graceful fallback: if email isn't configured yet, log and succeed so the
  // UI flow can be demoed without external setup.
  if (!apiKey || !to || !from) {
    console.info('[contact] Resend not configured — message received:', {
      name,
      email,
      message,
    });
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    // Dynamic import so the app builds/runs even before `resend` is installed.
    // The specifier is held in a variable so the type checker does not try to
    // resolve the (optional) dependency at build time.
    const resendModule = 'resend';
    const { Resend } = (await import(resendModule)) as {
      Resend: new (apiKey: string) => {
        emails: {
          send: (opts: {
            from: string;
            to: string;
            replyTo: string;
            subject: string;
            text: string;
          }) => Promise<{ error?: unknown }>;
        };
      };
    };
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    if (error) {
      console.error('[contact] Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
