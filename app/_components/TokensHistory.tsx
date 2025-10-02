'use client'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browserClient'

export default function TokensHistory() {
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokens = async () => {
      const { data: session } = await supabaseBrowser.auth.getSession()
      const uid = session?.session?.user?.id
      if (!uid) { setLoading(false); return }
      const { data, error } = await supabaseBrowser
        .from('tokens')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
      if (!error && data) setTokens(data)
      setLoading(false)
    }
    fetchTokens()
  }, [])

  return (
    <div className="space-y-2">
      <h2 className="font-semibold">Histórico de Tokens</h2>
      {loading ? <p>Carregando...</p> :
        tokens.length === 0 ? <p>Nenhum crédito encontrado.</p> : (
          <ul className="text-sm">
            {tokens.map(t => (
              <li key={t.id}>{t.amount} — {t.description}</li>
            ))}
          </ul>
        )
      }
    </div>
  )
}
