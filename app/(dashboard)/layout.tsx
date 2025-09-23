import Header from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Este layout é um Server Component. Ele pode renderizar o Header (que também é Server Component)
  // e, abaixo dele, renderizar o {children}, que pode ser um Client Component (como nossa página de tokens).
  return (
    <div>
      <Header />
      {/* A tag <main> agora será responsabilidade de cada página filha */}
      {children}
    </div>
  );
}
