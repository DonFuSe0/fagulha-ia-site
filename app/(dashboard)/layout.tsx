export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O Header já é renderizado pelo layout raiz (app/layout.tsx).
  // Este layout agora apenas serve para agrupar as rotas.
  // Podemos até remover este arquivo, mas mantê-lo pode ser útil para futuras customizações do dashboard.
  // Por enquanto, ele apenas passa o conteúdo adiante.
  return <>{children}</>;
}
