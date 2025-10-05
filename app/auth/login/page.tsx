// app/auth/login/page.tsx
'use client'

import { useForm, type UseFormReturn } from 'react-hook-form'
import { Button } from "@/app/_components/ui/button"
import { Form, FormField } from "@/app/_components/ui/form"
import { Input } from "@/app/_components/ui/input"
import TurnstileExplicit from "@/app/_components/TurnstileExplicit"

type LoginForm = {
  email: string
  password: string
  captcha: string
}

export default function LoginPage() {
  const form = useForm<LoginForm>()
  const { register, handleSubmit, formState: { errors } } = form

  async function onSubmit(data: LoginForm) {
    // lógica de login
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-gray-800 p-8 rounded-lg space-y-6"
      >
        <h2 className="text-2xl font-bold text-white">Entrar</h2>

        {/* Passa o form como props para FormProvider */}
        <Form {...form}>
          <FormField
            name="email"
            render={({ field, error }: { field: any; error?: string }) => (
              <>
                <label className="block text-sm text-gray-300">Email</label>
                <Input {...field} type="email" />
                {error && <p className="text-red-500 text-xs">{error}</p>}
              </>
            )}
          />

          <FormField
            name="password"
            render={({ field, error }: { field: any; error?: string }) => (
              <>
                <label className="block text-sm text-gray-300">Senha</label>
                <Input {...field} type="password" />
                {error && <p className="text-red-500 text-xs">{error}</p>}
              </>
            )}
          />

          <FormField
            name="captcha"
            render={({ field }: { field: any }) => (
              <TurnstileExplicit onVerify={(token: string) => field.onChange(token)} />
            )}
          />
        </Form>

        <Button type="submit" className="w-full">
          Entrar
        </Button>

        <div className="text-center text-gray-400 text-sm">
          Não tem conta? <a href="/auth/signup" className="text-orange-400 hover:underline">Cadastre-se</a>
        </div>
      </form>
    </div>
  )
}
