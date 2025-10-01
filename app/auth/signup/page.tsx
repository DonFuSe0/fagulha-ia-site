'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SignupInner() {
  const params = useSearchParams();
  const serverError = params.get('error');
  const serverOk = params.get('ok');

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-white">Criar conta</h1>

      {serverOk && (
        <div className="rounded border border-emerald-700 bg-emerald-900/30 p-3 text-sm text-emerald-200">
          {serverOk}
        </div>
      )}
      {serverError && (
        <div className="rounded border border-red-700 bg-red-900/40 p-3 text-sm text-red-200">
          {serverError}
        </div>
      )}

      <form action="/api/auth/signup" method="POST" className="space-y-4">
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

        {/* Turnstile widget */}
        <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}></div>

        <button
          type="submit"
          className="w-full rounded bg-brand px-4 py-2 font-medium text-black hover:bg-brand-light"
        >
          Criar conta
        </button>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400">Carregando…</div>}>
      <SignupInner />
    </Suspense>
  );
}
