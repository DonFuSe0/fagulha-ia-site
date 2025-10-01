"use client";

import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const params = useSearchParams();
  const serverError = params.get('error');

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-white">Entrar</h1>

      {serverError && (
        <div className="rounded border border-red-700 bg-red-900/40 p-3 text-sm text-red-200">
          {serverError}
        </div>
      )}

      <form action="/api/auth/login" method="POST" className="space-y-4">
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

        <button
          type="submit"
          className="w-full rounded bg-brand px-4 py-2 font-medium text-black hover:bg-brand-light"
        >
          Entrar
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-400">
        Ainda não tem conta?{' '}
        <a href="/auth/signup" className="text-brand hover:underline">
          Criar conta
        </a>
      </p>
    </div>
  );
}
