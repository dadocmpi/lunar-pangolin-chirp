# Configuração de Emails - Supabase

## Problema Atual
O formulário de contato mostra "Falha ao enviar mensagem" porque:
1. A **RESEND_API_KEY** pode não estar configurada corretamente
2. A função **send-email** pode não estar implantada (deployada)

## Passo a Passo Completo

### PASSO 1: Verificar/Configurar RESEND_API_KEY

Você já tem a API Key: `re_LBzpHHrB_K7JMyhguYdRhiU6Z2ZarUzmE`

**Agora configure no Supabase:**

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: **ymzdxifedtjwkxkzfwqu**
3. No menu lateral, vá em: **Edge Functions**
4. Clique em **Secrets** (ou "Add a new secret")
5. Verifique se existe um secret chamado `RESEND_API_KEY`
6. Se não existir, clique em **Add a new secret**:
   - **Name**: `RESEND_API_KEY`
   - **Secret value**: `re_LBzpHHrB_K7JMyhguYdRhiU6Z2ZarUzmE`
7. Clique em **Save**

### PASSO 2: Implantar (Deploy) a Função send-email

**Opção A: Via CLI do Supabase (Recomendado)**

1. Instale o Supabase CLI:
```bash
npm install -g supabase
```

2. Faça login:
```bash
supabase login
```

3. Link com o projeto:
```bash
supabase link --project-ref ymzdxifedtjwkxkzfwqu
```

4. Deploy da função:
```bash
supabase functions deploy send-email
```

**Opção B: Via Dashboard do Supabase**

1. Acesse: https://supabase.com/dashboard
2. Vá em: **Edge Functions**
3. Procure por **send-email** na lista
4. Se não existir, clique em **New Function** ou **Deploy**
5. Selecione o código da pasta `supabase/functions/send-email`

### PASSO 3: Verificar os Logs (Troubleshooting)

Se ainda não funcionar:

1. Vá em: **Edge Functions** > **Logs**
2. Procure pelos logs da função `send-email`
3. Veja se há erros

**Erros comuns:**
- `"RESEND_API_KEY" is not set` → A chave não está configurada
- Erro de CORS → Problema de configuração da função
- `Domain not verified` → Domínio não verificado no Resend

### PASSO 4: Configurar Domínio no Resend (Importante)

Para evitar que emails virem spam, configure um domínio:

1. Acesse: https://resend.com/domains
2. Clique em **Add Domain**
3. Adicione: `braxelmarkets.com` ou `ouvidor.net`
4. Configure os registros DNS (DKIM, SPF, DMARC)
5. Aguarde a verificação (pode levar até 24 horas)

### PASSO 5: Configurar URLs no Supabase Auth

1. Vá em **Authentication** > **URL Configuration**
2. Configure:
   - **Site URL**: `https://braxelmarkets.vercel.app`
   - **Redirect URLs**: 
     ```
     https://braxelmarkets.vercel.app/auth-callback
     https://braxelmarkets.vercel.app/*
     ```

## Checklist - Tudo que Você Precisa Fazer

- [ ] 1. Verificar se `RESEND_API_KEY` está em **Edge Functions > Secrets**
- [ ] 2. Deploy da função **send-email** (via CLI ou Dashboard)
- [ ] 3. (Opcional) Verificar domínio no Resend
- [ ] 4. Testar o formulário de contato

## Como Testar o Formulário

1. Acesse o site
2. Vá na página **Contact Us**
3. Preencha: Nome, Email, Assunto, Mensagem
4. Resolva o CAPTCHA (soma matemática)
5. Clique em **ENVIAR CONSULTA**
6. O email deve chegar em **marketsbraxel@ouvidor.net**

## Estrutura do Código

```
supabase/
└── functions/
    └── send-email/
        └── index.ts      ← Esta função envia os emails
```

## O que a Função send-email Faz

1. Recebe os dados do formulário (nome, email, assunto, mensagem)
2. Monta um email HTML bonito
3. Envia via API da Resend para `marketsbraxel@ouvidor.net`
4. Retorna sucesso ou erro

## Emails que Serão Enviados

1. **Formulário de Contato** → Vai para `marketsbraxel@ouvidor.net`
2. **Confirmação de Registro** → Vai para o email do usuário
3. **Notificações KYC** → Vai para `marketsbraxel@ouvidor.net`
4. **Pagamentos** → Notificações varias

## Troubleshooting Rápido

| Erro | Solução |
|------|---------|
| "Failed to send" | Verificar se RESEND_API_KEY está configurada |
| "Function not found" | Fazer deploy da função send-email |
| Email no spam | Verificar domínio no Resend |
| CORS error | Verificar configuração da função |

## Precisa de Help?

Se ainda não funcionar, me mande uma mensagem com:
1. Print do erro
2. Print dos Logs da Edge Function (se houver)

