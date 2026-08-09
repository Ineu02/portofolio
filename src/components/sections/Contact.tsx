'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { profile, socialLinks } from '@/lib/data';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { isValidEmail, cn } from '@/lib/utils';
import { fadeUp, viewportOnce } from '@/lib/animations';

type FormState = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof FormState, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

/** Channels surfaced as buttons, in the order requested. */
const CHANNEL_ORDER = ['Email', 'GitHub', 'LinkedIn', 'Telegram', 'Twitter'];

const contactChannels = CHANNEL_ORDER.map((label) =>
  socialLinks.find((s) => s.label === label)
).filter((s): s is (typeof socialLinks)[number] => Boolean(s));

/**
 * Contact section — a validated contact form alongside contact details
 * and social links. Validation runs on submit and per-field on change
 * once a field has been touched. On submit it POSTs to /api/contact,
 * which delivers the message via Resend (see that route for setup).
 * Includes a hidden honeypot field for spam protection.
 */
export function Contact() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  // Honeypot: bots tend to fill every field; real users never see this one.
  const [honeypot, setHoneypot] = useState('');

  // Validate all fields and return the collected errors.
  const validate = (values: FormState): Errors => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = 'Please enter your name.';
    if (!values.email.trim()) next.email = 'Please enter your email.';
    else if (!isValidEmail(values.email)) next.email = 'That email looks invalid.';
    if (!values.message.trim()) next.message = 'Please enter a message.';
    else if (values.message.trim().length < 10)
      next.message = 'Message should be at least 10 characters.';
    return next;
  };

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      // Re-validate the single field if it already had an error.
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: validate({ ...form, [field]: value })[field],
        }));
      }
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus('submitting');
    setServerError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company: honeypot }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? 'Failed to send message.');
      }

      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Something went wrong.'
      );
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="bg-gold-radial absolute inset-x-0 bottom-0 h-96 opacity-30" aria-hidden />
      <div className="container-px relative">
        <SectionHeading
          eyebrow="Get in touch"
          title="Have a project or research idea?"
          highlight="Let's build it."
          description="Open to security research, smart contract review, AI agent work, and Web3 infrastructure. The form reaches my inbox directly, or use any channel below."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          {/* Contact details */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="space-y-4"
          >
            <GlassCard gold className="p-8">
              <h3 className="font-display text-xl font-semibold text-white">
                Contact details
              </h3>

              <a
                href={`mailto:${profile.email}`}
                className="mt-6 flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/5"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl glass-strong text-gold">
                  <Mail className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-widest text-ink-faint">
                    Email
                  </span>
                  <span className="text-sm text-ink">{profile.email}</span>
                </span>
              </a>

              <div className="mt-2 flex items-center gap-4 rounded-xl p-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl glass-strong text-gold">
                  <MapPin className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-widest text-ink-faint">
                    Location
                  </span>
                  <span className="text-sm text-ink">{profile.location}</span>
                </span>
              </div>

              {/* Direct channels — labelled, in the order most people use them */}
              <div className="mt-6 border-t border-white/10 pt-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">
                  Direct channels
                </span>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {contactChannels.map((social) => {
                    const Icon = social.icon;
                    const label = social.label === 'Twitter' ? 'X' : social.label;
                    return (
                      <Magnetic key={social.label} strength={7}>
                        <a
                          href={social.href}
                          {...(social.href.startsWith('mailto:')
                            ? {}
                            : { target: '_blank', rel: 'noopener noreferrer' })}
                          className="inline-flex h-10 items-center gap-2 rounded-full glass px-4 text-sm text-ink-muted transition-colors duration-300 hover:border-gold/40 hover:text-gold"
                        >
                          <Icon className="h-4 w-4" aria-hidden />
                          {label}
                        </a>
                      </Magnetic>
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact form */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <GlassCard className="p-8 sm:p-10">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-full min-h-[20rem] flex-col items-center justify-center text-center"
                >
                  {/*
                    Success. The ring expands outward from the check once and
                    stops — a confirmation should land and then be still, not
                    keep pulsing at someone who has already read it.
                  */}
                  <div className="relative grid h-16 w-16 place-items-center">
                    <motion.span
                      className="absolute inset-0 rounded-full border border-gold/60"
                      initial={{ scale: 0.6, opacity: 0.9 }}
                      animate={{ scale: 1.9, opacity: 0 }}
                      transition={{ duration: 1.1, ease: 'easeOut' }}
                      aria-hidden
                    />
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.08 }}
                    >
                      <CheckCircle2 className="h-16 w-16 text-gold" />
                    </motion.span>
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold text-white">
                    Message sent!
                  </h3>
                  <p className="mt-2 max-w-sm text-ink-muted">
                    Thanks for reaching out — I&apos;ll get back to you within a day
                    or two.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-8"
                    onClick={() => setStatus('idle')}
                  >
                    Send another
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Honeypot — visually hidden & off the a11y tree; bots fill it. */}
                  <div className="absolute left-[-9999px]" aria-hidden="true">
                    <label htmlFor="company">Company</label>
                    <input
                      id="company"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field
                      id="name"
                      label="Name"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={handleChange('name')}
                      error={errors.name}
                    />
                    <Field
                      id="email"
                      type="email"
                      label="Email"
                      placeholder="jane@company.com"
                      value={form.email}
                      onChange={handleChange('email')}
                      error={errors.email}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium text-ink"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Tell me about your project…"
                      value={form.message}
                      onChange={handleChange('message')}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      className={cn(
                        'w-full resize-none rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-ink-faint focus:outline-none focus:ring-1',
                        errors.message
                          ? 'border-red-500/50 focus:ring-red-500/50'
                          : 'border-white/10 focus:border-gold/40 focus:ring-gold/40'
                      )}
                    />
                    {errors.message && (
                      <p id="message-error" className="mt-2 text-xs text-red-400">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/*
                    Server-side / network error feedback. It slides in and
                    settles with one short lateral nudge — enough to draw the
                    eye without the jitter of a shake, which reads as alarm.
                    `role="alert"` is what actually announces it; the motion is
                    only for people who can see it.
                  */}
                  {status === 'error' && serverError && (
                    <motion.p
                      role="alert"
                      initial={{ opacity: 0, y: -6, x: 0 }}
                      animate={{ opacity: 1, y: 0, x: [0, -5, 4, 0] }}
                      transition={{ duration: 0.42, ease: 'easeOut' }}
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                      {serverError}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={status === 'submitting'}
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Reusable labeled input with inline error messaging.
 *
 * The focus treatment is a gold underline that grows from the centre, layered
 * beneath the existing ring. It is decoration only — the `:focus-visible`
 * outline from globals.css still does the accessibility work, so keyboard
 * users get the standard indicator whether or not this renders.
 */
function Field({
  id,
  label,
  error,
  type = 'text',
  ...props
}: {
  id: string;
  label: string;
  error?: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'peer w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-ink-faint focus:outline-none focus:ring-1',
            error
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-white/10 focus:border-gold/40 focus:ring-gold/40'
          )}
          {...props}
        />
        <span
          className="pointer-events-none absolute inset-x-3 bottom-0 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-gold to-transparent transition-transform duration-500 peer-focus:scale-x-100"
          aria-hidden
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
