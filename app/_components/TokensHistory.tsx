// Correção: exibir tokens iniciais sempre
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TokensHistory() {
  const supabase = createClient()
  const [tokens, setTokens] = useState<any[]>([])

  useEffect(() => {
    const fetchTokens = async () => {
      const { data } = await supabase.from('tokens').select('*').order('created_at', { ascending: false })
      if (data) setTokens(data)
    }
    fetchTokens()
  }, [])

  return (
    <div className="space-y-2">
      <h2 className="font-semibold">Histórico de Tokens</h2>
      {tokens.length === 0 && <p>Nenhum crédito encontrado.</p>}
      <ul className="text-sm">
        {tokens.map(t => (
          <li key={t.id}>{t.amount} — {t.description}</li>
        ))}
      </ul>
    </div>
  )
}