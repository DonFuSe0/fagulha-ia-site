# Hotfix: Next.js "Server actions must be async functions"

Erro no build:
```
x Server actions must be async functions
app/lib/supabase/server.ts: export function getServerClient() { ... }
```
Motivo: o arquivo tinha `'use server'`, tornando a função um **Server Action** (que precisa ser `async`).  
Solução aplicada: **removemos** `'use server'` do arquivo — esse helper **não** precisa ser Server Action.

Como aplicar:
1. Substitua `app/lib/supabase/server.ts` pelo deste pacote.
2. Rode `npm run build` novamente.
