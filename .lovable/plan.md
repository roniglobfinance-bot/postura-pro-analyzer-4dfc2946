
## Problema

A tela fica presa em "Inicializando sistema..." / spinner do AuthGate. O `useAuth` aguarda (`await`) o fetch do profile do Supabase antes de marcar `initialized = true`. Se a query `.single()` em `profiles` demora, falha silenciosa ou é re-disparada pelo `onAuthStateChange`, o flag `initialized` nunca vira `true` e o app trava no `<Loader2 />` do `AuthGate`.

Sintomas confirmados:
- Console mostra `Inicializando sistema de autenticação...` e `SIGNED_IN ...` mas NUNCA mostra `Autenticação inicializada:` (o log que vem depois do `await updateUserState`).
- Logs aparecem 2x → indica duplo mount/strict mode amplificando o problema.

## Correção (somente `src/hooks/useAuth.tsx`)

1. **Desacoplar gate de auth do fetch de profile**: marcar `initialized = true` e `loading = false` IMEDIATAMENTE após obter a sessão, sem esperar pelo profile.
2. **Fetch de profile em background (fire-and-forget)**: `updateUserState` seta `user/session` sincronamente; o role é carregado depois, sem bloquear render.
3. **No callback `onAuthStateChange`**: NUNCA usar `await` dentro do callback (Supabase docs — causa deadlock). Disparar fetch de profile com `.then()` em vez de `await`.
4. **Timeout defensivo de 5s** no fetch de profile — se não retornar, assume role `'student'` por padrão e segue.
5. **Anti-duplicate guard**: usar `useRef` para garantir que `initializeAuth` só roda uma vez, mesmo sob StrictMode duplo-mount.

## Resultado esperado

- Tela de loading dura no máximo ~500ms (tempo de `getSession`).
- Usuário cai imediatamente no dashboard correto após login.
- Role carrega em background; UI que depende dele re-renderiza quando chegar.
- Sem mudanças de UI, sem migration, sem mudança em outros arquivos.

## Detalhes técnicos

Arquivo único alterado: `src/hooks/useAuth.tsx`
- Remover `await` antes de `fetchUserProfile` no `initializeAuth` e no listener.
- Mover `setLoading(false); setInitialized(true)` para logo após `setSession/setUser`.
- Envolver fetch de profile com `Promise.race([fetch, timeout(5000)])`.

Nenhum outro arquivo precisa mudar — `AuthGate`, `AuthPage` e dashboards já reagem corretamente a `isAuthenticated` e `userRole`.
