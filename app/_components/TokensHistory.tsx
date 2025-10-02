// Correção: usar supabaseBrowser no cliente
'use client'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browserClient'

export default function TokensHistory() {
  const supabase = supabaseBrowser
  const [tokens, setTokens] = useState<any[]>([])

  useEffect(() => {
    const fetchTokens = async () => {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) setTokens(data)
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
