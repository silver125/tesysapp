# Segmentação médica e localização

Cada empresa define um segmento médico principal em Cadastro / Editar perfil (`profiles.specialty`). Novos representantes, eventos, produtos, parcerias e workshops herdam esse segmento na coluna `segment`. O formato de evento continua em `category`; produtos e cursos usam a categoria do segmento da empresa.

O catálogo médico aplica segmento, macrorregião e UF conjuntamente em todas as abas. Conteúdos sem classificação reconhecida não aparecem em um segmento. Atendimentos nacionais e atividades online correspondem a qualquer localização válida. Produtos usam as unidades cadastradas da empresa para localização; representantes usam apenas sua própria área de atendimento. Alterar a região limpa uma UF incompatível.

## Implantação

1. Aplicar `supabase/migrations/20260928133531_medical_segments.sql` antes do frontend. A migração adiciona colunas e validações, sem excluir registros. Os RPCs de publicação existentes continuam compatíveis: o trigger herda o segmento da empresa quando o INSERT não o informa.
2. Orientar empresas existentes a escolher seu segmento em Editar perfil antes de publicar. Após a migração, publicações sem segmento válido da empresa são recusadas inclusive em clientes antigos.
3. Revisar dados antigos: apenas categorias/especialidades exatamente reconhecidas recebem classificação automática. Eventos podem ser classificados em Editar evento e representantes em Gerenciar → Classificar em [segmento]. Produtos/cursos antigos com categoria genérica precisam de revisão administrativa para atribuir categoria e segmento, ou de uma nova publicação pelo proprietário. Não inferir a área médica de termos comerciais como “Estética” ou “Tecnologias”.
4. Publicar o frontend e confirmar, com contas de teste, que Pediatria/PR não mostra Dermatologia/SP e que a empresa só publica no segmento do perfil.

Alterar o segmento do perfil não muda anúncios anteriores. A reclassificação é explícita; edições comuns de anúncios e contadores preservam a classificação existente. Reverter apenas o frontend mantém a validação do banco ativa; não remover as colunas para fazer rollback.

## Verificação local

`npm run build`, `npm run lint`, `node --test tests/*.test.mjs`.

Os testes de segmentação incluem PostgreSQL embarcado (PGlite), herança nos INSERTs legados, rejeição de segmentos/categorias divergentes e separação de representantes da mesma empresa. Eles não substituem um smoke test com autenticação e RLS no ambiente de implantação.
