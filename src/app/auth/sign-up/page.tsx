import SignUpForm from '@/components/auth/SignUpForm';

export const metadata = {
  title: 'Cadastrar — Fagulha',
};

export default function Page() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4">
      <SignUpForm />
    </div>
  );
}
