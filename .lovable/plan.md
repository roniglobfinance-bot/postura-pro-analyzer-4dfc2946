## Problema

O botão "Sair" existe apenas dentro do `Navigation.tsx` (sidebar lateral), que está oculto em telas mobile (`hidden md:block` em `Index.tsx`). No mobile, o `BottomNavigation` não tem ação de logout. Resultado: usuário logado como aluno não consegue sair para fazer login com outra conta — fica preso no modo aluno.

## Solução

Adicionar um botão "Sair" no `Header.tsx`, visível em todas as resoluções, ao lado do ícone de notificação. O Header já é renderizado em desktop e mobile.

## Mudanças

**`src/components/Header.tsx`** (único arquivo alterado):
- Importar `useAuth` e ícone `LogOut` do lucide-react.
- Exibir o email do usuário (truncado, escondido em telas muito pequenas) ao lado do sino.
- Adicionar botão "Sair" (variant `ghost`, ícone `LogOut` + label "Sair") que chama `signOut()` do `useAuth`.
- Só renderiza o bloco de logout quando há `user` autenticado.

## Não muda

- `useAuth.tsx` (signOut já funciona corretamente).
- `Navigation.tsx` mantém seu botão Sair na sidebar desktop (redundância proposital).
- Nenhuma rota, migration ou lógica de negócio.

## Resultado esperado

Em qualquer dispositivo, o usuário vê "Sair" no canto superior direito, clica, é deslogado e volta para `/auth` para entrar com outra conta (professor, por exemplo).
