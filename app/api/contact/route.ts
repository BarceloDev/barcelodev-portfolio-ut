import { NextResponse } from 'next/server'

const TO_EMAIL = 'guilhermebrcneves@gmail.com'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  let body: { name?: string; email?: string; message?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Requisição inválida.' },
      { status: 400 },
    )
  }

  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim()
  const message = (body.message ?? '').trim()

  if (!name || !email || !message || !isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Preencha todos os campos corretamente.' },
      { status: 400 },
    )
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error(
      'RESEND_API_KEY não configurada. Defina a variável de ambiente para o envio funcionar.',
    )
    return NextResponse.json(
      { error: 'Serviço de envio não configurado no servidor.' },
      { status: 500 },
    )
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfólio <onboarding@resend.dev>',
        to: TO_EMAIL,
        reply_to: email,
        subject: `Novo contato de ${name} (via portfólio)`,
        text: `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`,
        html: `<p><strong>Nome:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Mensagem:</strong></p><p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Falha ao enviar email via Resend:', res.status, errText)
      return NextResponse.json(
        { error: 'Não foi possível enviar sua mensagem agora. Tente novamente em breve.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro inesperado ao enviar email:', err)
    return NextResponse.json(
      { error: 'Erro inesperado ao enviar sua mensagem.' },
      { status: 500 },
    )
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
