'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-white">Criar conta</h1>

      <form action="/api/auth/signup" method="POST" className="space-y-4" onSubmit={() => setLoading(true)}>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-gray-300">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-gray-200 focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-gray-300">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-gray-200 focus:border-brand focus:outline-none"
          />
        </div>

        {/* Turnstile container (widget client-side) */}
        <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}></div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-brand px-4 py-2 font-medium text-black hover:bg-brand-light disabled:opacity-60"
        >
          {loading ? 'Enviando…' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
}
