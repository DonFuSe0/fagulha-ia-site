// Página de callback pós-confirmação de e-mail
export default function AuthCallback() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">E-mail confirmado!</h1>
        <p>Sua conta foi ativada com sucesso. Você já pode fazer login.</p>
      </div>
    </main>
  )
}
