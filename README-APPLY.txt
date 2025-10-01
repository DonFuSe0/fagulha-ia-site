# Bugfix: Missing modules for dashboard

This pack adds the missing files and ensures the `@/*` path alias resolves.

## Files to copy
- `lib/supabase/server.ts`
- `components/profile/ProfileCard.tsx`
- (optional) merge `tsconfig.patch.json` into your `tsconfig.json`

## tsconfig.json (merge this)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}

## After copying
- Run: `npx tsc -noEmit` (should pass these missing-module errors)
