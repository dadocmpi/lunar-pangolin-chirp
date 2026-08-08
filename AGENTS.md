# Braxel Markets — Contexto do Projeto

## Stack
- Frontend: React + TypeScript + Vite (deploy em Vercel)
- Backend: Supabase (Auth, DB, Edge Functions em Deno)
- Emails: Resend (via `RESEND_API_KEY` nas Edge Functions)
- i18n: react-i18next (`src/i18n.ts`)

## Fluxo de Pagamentos (estado atual)
Existem 2 rotas de pagamento, ambas com confirmação **manual**:

### Wise (transferência bancária internacional)
- Edge Function: `supabase/functions/wise-checkout/index.ts`
- Fluxo: cliente vê dados bancários no Checkout → faz transferência → clica "Confirmar" → cria registo `pending_payments` (status `pending`) → envia emails (user "pending" + empresa "ACTION REQUIRED: verificação manual").
- **PROBLEMA**: os dados bancários Wise exibidos no frontend (`wiseAccount` em `src/pages/Checkout.tsx`) são PLACEHOLDERS (`holderName: "YOUR_NAME_HERE"`, `iban: "XXXX..."`, etc.). Sem dados reais, o dinheiro não chega a lado nenhum.
- **Sem integração Wise API** (não há quotes/payouts automatizados). Verificação 100% manual por humano.

### Cripto (BTC, ETH, BNB, POLYGON, SOL, TRC20/USDT)
- Edge Functions: `crypto-checkout` (cria pending + emails), `crypto-auto-confirm` (tenta verificar on-chain via explorers: Blockstream p/ BTC, Tronscan p/ TRC20; restante = manual), `crypto-confirmation` (admin confirma manualmente).
- **Endereços de carteira destino JÁ são reais** e estão hardcoded em 2 sítios que têm de estar sincronizados:
  - `src/pages/Checkout.tsx` → `cryptoNetworks`
  - `supabase/functions/crypto-auto-confirm/index.ts` → `WALLET_ADDRESSES`
  - ETH/BNB/POLYGON partilham o mesmo endereço `0x46252C57F22A5e3f2d5638bD21C892c9876D6e68`.
- "MetaMask" ainda NÃO está integrado como conector de carteira (WalletConnect/MetaMask SDK). Fluxo atual: mostrar endereço → cliente envia da própria carteira → clica "Confirmar" → auto-verificação on-chain (limitada) ou manual.

## Segurança — pontos de atenção
- `crypto-confirmation` usa `ADMIN_SECRET` com fallback hardcoded `braxel-admin-2026` (fraco).
- Endereços de carteira e dados duplicados entre frontend e edge functions.
- `corsHeaders` com `Access-Control-Allow-Origin: '*'` nas edge functions de pagamento.

## Convenções
- Commits em inglês, mensagens ao utilizador em PT-PT.
- Não fazer push direto para `main`; criar branch + PR via `create_pr`.

## Estado do build (importante)
- `npm install --legacy-peer-deps` é necessário (conflito de peer deps com next-themes).
- `npm run build` (Vite 6 / esbuild) era **partido no main** por dois motivos, agora corrigidos:
  1. Chaves duplicadas em `src/i18n.ts` (blocos inteiros repetidos em auth/dashboard/etc.). O esbuild v6 trata duplicate keys como erro. Limpo mantendo a última ocorrência (semântica JS).
  2. `<div className="space-y-2">` não fechado na secção cripto do `Checkout.tsx` (desbalanceamento JSX que o tsc tolera mas o esbuild rejeita).
- `npx tsc --noEmit` passa. Lint tem ~42 erros `no-explicit-any` / `no-require-imports` **pré-existentes** (não bloquear por estes).
