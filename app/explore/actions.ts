'use server'; // Define que todas as funções neste arquivo são Server Actions

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

const IMAGES_PER_PAGE = 20; // Quantas imagens carregar por vez

export async function fetchGenerations(page: number) {
  const supabase = createServerComponentClient<Database>({ cookies });

  const from = page * IMAGES_PER_PAGE;
  const to = from + IMAGES_PER_PAGE - 1;

  const { data, error } = await supabase
    .from('generations')
    .select('id, image_url, prompt')
    .eq('status', 'succeeded')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(from, to); // A mágica da paginação acontece aqui

  if (error) {
    console.error('Erro ao buscar gerações:', error);
    return []; // Retorna um array vazio em caso de erro
  }

  return data;
}
