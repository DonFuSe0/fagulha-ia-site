export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ConfirmarEmailPage() {
  return (
    <div className="max-w-lg mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold mb-2">Confirme seu e-mail</h1>
      <p className="text-white/80">
        Enviamos um link de confirmação para o seu e-mail. Após confirmar, você será redirecionado ao Dashboard.
      </p>
    </div>
  );
}
