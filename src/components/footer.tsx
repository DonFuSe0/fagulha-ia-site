export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface text-muted py-6 mt-10">
      <div className="container mx-auto text-center text-xs">
        &copy; {new Date().getFullYear()} Fagulha. Todos os direitos reservados.
      </div>
    </footer>
  );
}