export default function ConfirmPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20">
        <h1 className="text-4xl font-bold text-white">
          Quase lá!
        </h1>
        <p className="text-lg text-text-secondary">
          Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.
        </p>
        <p className="text-sm text-text-secondary pt-4">
          Você pode fechar esta aba.
        </p>
      </div>
    </div>
  );
}
