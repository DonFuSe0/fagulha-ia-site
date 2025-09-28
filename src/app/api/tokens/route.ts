import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = supabaseServer();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
  }
  const { data: balance } = await supabase.rpc('get_my_balance');
  const { data: ledger } = await supabase
    .from('token_ledger')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  return NextResponse.json({ balance, ledger });
}