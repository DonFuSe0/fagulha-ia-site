import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Entrar — Fagulha',
};

export default function Page() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
