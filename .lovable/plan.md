Plano de implementação

1. Corrigir acesso ao dashboard do professor
- Substituir a lógica atual que cai automaticamente para `student` quando a consulta de perfil falha.
- Adotar resolução de role em camadas:
  1. perfil em `profiles.role` quando disponível;
  2. função RPC `get_user_role(user.id)` como fallback;
  3. metadata do usuário (`user_metadata.role`) como fallback imediato;
  4. `admin` tratado como acesso de professor;
  5. somente cair para `student` quando nenhuma fonte indicar professor/admin.
- Evitar que a tela renderize modo aluno enquanto a role ainda está indefinida: exibir carregamento curto/estado seguro até resolver role ou timeout.
- Ajustar `Index`, `Navigation` e `BottomNavigation` para considerar `teacher` e `admin` como painel do professor.
- Manter botão `Sair` visível para trocar conta.

2. Reparar criação/recuperação de perfil sem travar autenticação
- Criar/ajustar uma função segura no Supabase para garantir perfil do usuário logado quando ele não existir.
- Essa função deve usar `auth.uid()` e metadata do JWT, sem expor service role no frontend.
- O login demo professor deve garantir role `teacher`; login demo aluno deve garantir role `student`.
- Se o perfil estiver faltando ou a consulta direta em `profiles` falhar por schema cache, a aplicação ainda deve liberar professor quando a sessão/metadata indicar professor/admin.

3. Separar claramente as permissões de tela
- Painel do professor: todo o conjunto de análise/diagnóstico/avaliações já criado no app.
- Tela do aluno: somente avaliações recebidas, relatório, prescrições, evolução e check-in.
- Bloquear navegação de aluno para módulos de professor no menu e fallback de rota interna.
- Professor/admin sempre devem cair no `TeacherDashboard` após login.

4. Criar página “Settings / API FitPro” no painel do professor
- Adicionar um item no menu do professor: `API FitPro` ou `Configurações API`.
- A página deve conter:
  - status da integração;
  - documentação dos endpoints;
  - exemplos de payload/response;
  - instruções de autenticação;
  - exemplos de uso SDK JavaScript/TypeScript;
  - mapeamento: Postura Pro -> FitPro.

5. Criar infraestrutura de API para FitPro
- Adicionar tabela de chaves/tokens de integração para o professor, com RLS por professor.
- Criar Edge Function `fitpro-api` como gateway único da integração.
- Autenticação da API por token de integração, sem usar senha do usuário.
- Rotas planejadas:

```text
GET  /teacher/dashboard
GET  /teacher/students
GET  /teacher/assessments
GET  /student/dashboard?student_id=...
GET  /student/report?student_id=...
GET  /student/prescriptions?student_id=...
POST /analysis/photo
POST /analysis/video
POST /train/prescriptions/sync
```

6. Expor capacidades de análise para FitPro
- `POST /analysis/photo`:
  - recebe foto/postura/contexto;
  - usa o fluxo existente de análise postural;
  - retorna métricas, flags, diagnóstico, risco e recomendações.
- `POST /analysis/video`:
  - valida vídeo de até 5 segundos;
  - exige detalhes do exercício e objetivo da avaliação;
  - extrai/análise frames via pipeline existente de movimento;
  - retorna falhas de execução, ROM, padrão 9FIT e recomendação LOAD/SHIELD/MIXED.
- `POST /train/prescriptions/sync`:
  - entrega prescrições/protocolos do Postura Pro para o componente de treino do FitPro.

7. Documentação SDK dentro do próprio app
- Incluir seção com:
  - autenticação;
  - endpoints;
  - tipos TypeScript;
  - exemplo `PosturaProClient`;
  - exemplo de envio de foto;
  - exemplo de envio de vídeo até 5s;
  - exemplo de puxar relatório/aluno;
  - exemplo de sincronizar prescrições no Train/FitPro.

Detalhes técnicos

- Arquivos principais previstos:
  - `src/hooks/useAuth.tsx`
  - `src/pages/Index.tsx`
  - `src/components/Navigation.tsx`
  - `src/components/BottomNavigation.tsx`
  - nova página `src/components/pages/FitProApiSettings.tsx`
  - nova Edge Function `supabase/functions/fitpro-api/index.ts`
  - migração Supabase para tabela/funções de integração.

- Banco:
  - criar tabela pública com GRANT + RLS para tokens de integração;
  - criar função segura para garantir/ler perfil do usuário autenticado;
  - preservar isolamento professor/aluno.

Critério de aceite

- Login com professor demo abre painel do professor.
- Login com admin abre painel do professor.
- Login com aluno abre somente tela do aluno.
- Erro temporário em `profiles` não joga professor para modo aluno.
- Existe página de Settings/API com documentação FitPro completa.
- FitPro consegue consultar painel professor, dados do aluno, relatórios, prescrições e acionar análise por foto/vídeo via API autenticada.