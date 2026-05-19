# Plataforma Bancaria - Teste Frontend

Aplicacao frontend que simula um banco digital com foco em clareza de codigo, validacoes de negocio e experiencia do usuario.

## Tecnologias
- React
- TypeScript
- Tailwind CSS
- Mock local (sem backend)

## Funcionalidades
- Dashboard com cliente, agencia/conta, saldo e fluxo de entradas/saidas.
- Extrato com busca por descricao, filtro por tipo, carregamento em esqueleto, estado de erro com nova tentativa e estado vazio.
- Transferencia com:
  - validacao de campos obrigatorios
  - bloqueio de valores negativos/zero
  - bloqueio por saldo insuficiente
  - feedback de sucesso/erro
  - mascara de valor em padrao BRL
  - simulacao de saldo apos a transferencia
- Responsividade para desktop e celular.
- Alternancia de tema claro/escuro com persistencia no navegador.

## Referencia visual
As telas e funções foram inspiradas em padroes visuais e de usabilidade de aplicativos bancarios como Itau e Inter.

## Decisoes tecnicas e compromissos
- `useBankData` centraliza carga de conta/transacoes e atualizacao de estado apos transferencia.
  Isso evita logica duplicada no `App` e deixa os componentes de tela mais simples.
- Mock local foi escolhido para acelerar o desenvolvimento e manter o teste 100% frontend.
- A arquitetura separa:
  - `data` (dados mockados)
  - `services` (simulacao de API e regras de transferencia)
  - `hooks` (orquestracao de estado)
  - `components` (camada visual)
-  Optei por React + TypeScript por ser a stack em que tenho mais dominio hoje, para garantir uma entrega completa, com qualidade e dentro do prazo.

## Como executar
1. Tenha Node.js 18+ instalado.
2. Instale dependencias:
   - `npm install`
3. Rode em desenvolvimento:
   - `npm run dev`
4. Build de producao:
   - `npm run build`

## Estrutura
- `src/components`: componentes de interface
- `src/data`: mocks locais
- `src/hooks`: hook customizado de dados bancarios
- `src/services`: simulacao de API/regras de negocio
- `src/types`: tipagens TypeScript
