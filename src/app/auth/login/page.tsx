import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function Page() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
