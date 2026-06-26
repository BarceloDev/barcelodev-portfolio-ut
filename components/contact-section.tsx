'use client'

import { useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, Mail, Send } from 'lucide-react'
import { SOCIALS } from '@/lib/portfolio-data'

type Errors = Partial<Record<'name' | 'email' | 'message', string>>
type Status = 'idle' | 'sending' | 'sent' | 'error'

export function ContactSection() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function validate(): Errors {
    const next: Errors = {}
    if (!name.trim()) next.name = 'Por favor, informe seu nome.'
    if (!email.trim()) {
      next.email = 'Por favor, informe seu email.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Informe um email válido.'
    }
    if (!message.trim()) next.message = 'Escreva uma mensagem.'
    return next
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || 'Não foi possível enviar sua mensagem.')
      }

      setName('')
      setEmail('')
      setMessage('')
      setErrors({})
      setStatus('sent')
      setTimeout(() => setStatus('idle'), 6000)
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Não foi possível enviar sua mensagem. Tente novamente.',
      )
    }
  }

  const fieldClass =
    'w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30'

  return (
    <section id="contato" className="px-5 py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-balance text-center text-3xl font-bold sm:text-4xl">
          Entre em Contato <span>📬</span>
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          Tem uma ideia, oportunidade ou só quer trocar uma ideia? Me mande uma
          mensagem.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className={fieldClass}
              aria-invalid={!!errors.name}
              disabled={status === 'sending'}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className={fieldClass}
              aria-invalid={!!errors.email}
              disabled={status === 'sending'}
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
              Mensagem
            </label>
            <textarea
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Olá, vim pelo seu portfolio..."
              className={`${fieldClass} resize-none`}
              aria-invalid={!!errors.message}
              disabled={status === 'sending'}
            />
            {errors.message && (
              <p className="mt-1.5 text-sm text-destructive">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'sending' ? (
              <>Enviando...</>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Enviar mensagem
              </>
            )}
          </button>

          {status === 'sent' && (
            <p className="flex items-center justify-center gap-2 text-center text-sm font-medium text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
              Agradeço pelo contato! Responderei em breve 😊
            </p>
          )}

          {status === 'error' && (
            <p className="flex items-center justify-center gap-2 text-center text-sm font-medium text-destructive">
              <AlertCircle className="h-5 w-5" />
              {errorMessage}
            </p>
          )}

          
            href={`mailto:${SOCIALS.email}`}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <Mail className="h-4 w-4" />
            {SOCIALS.email}
          </a>
        </form>
      </div>
    </section>
  )
}
