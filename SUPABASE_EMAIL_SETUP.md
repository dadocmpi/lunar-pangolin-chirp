# Configuração de Emails - Supabase

## Problema
Os emails não estão sendo enviados porque falta configurar a **RESEND_API_KEY** no Supabase.

## Passo a Passo para Ativar os Emails

### 1. Obter a API Key do Resend

1. Acesse: https://resend.com/api-keys
2. Faça login ou crie uma conta
3. Clique em "Create API Key"
4. Copie a chave (começa com `re_`)

### 2. Configurar no Supabase

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione o projeto: **ymzdxifedtjwkxkzfwqu**
3. Vá em **Edge Functions** > **Secrets**
4. Clique em **Add a new secret**
5. Nome: `RESEND_API_KEY`
6. Valor: cole a chave do Resend
7. Salve

### 3. Configurar o Domínio no Resend (opcional mas recomendado)

Para que os emails cheguem corretamente e não sejam marcados como spam:

1. No Resend, vá em **Domains**
2. Adicione o domínio: `braxelmarkets.com`
3. Configure os registros DNS conforme instruído
4. Aguarde a verificação (pode levar até 24h)

### 4. Deploy das Edge Functions

Após configurar a API key, você precisa fazer o deploy das functions:

```bash
# Instale o Supabase CLI se ainda não tiver
npm install -g supabase

# Faça login
supabase login

# Link com o projeto
supabase link --project-ref ymzdxifedtjwkxkzfwqu

# Deploy das functions
supabase functions deploy user-registration
supabase functions deploy confirm-signup
supabase functions deploy send-email
```

### 5. Configurar URLs no Supabase Auth

1. Vá em **Authentication** > **URL Configuration**
2. Configure:
   - **Site URL**: `https://braxelmarkets.vercel.app`
   - **Redirect URLs**: 
     ```
     https://braxelmarkets.vercel.app/auth-callback
     https://braxelmarkets.vercel.app/*
     ```

### 6. Testar

1. Crie uma conta de teste no site
2. Verifique se recebe o email em **marketsbraxel@ouvidor.net**

## Emails que serão enviados

1. **Para o cliente (novo usuário)**:
   - Email de confirmação de registro

2. **Para a gestoria (marketsbraxel@ouvidor.net)**:
   - Notificação de novo registro com:
     - User ID
     - Email
     - Nome completo
     - Senha
     - Status de verificação
     - Data de registro

## Troubleshooting

### Email não chega?
1. Verifique se a `RESEND_API_KEY` está configurada corretamente
2. Verifique a pasta de spam
3. Verifique os logs no Supabase: **Edge Functions** > **Logs**

### Erro de CORS?
Adicione os domínios permitidos na configuração da Edge Function.

### Domínio não verificado?
Emails de domínios não verificados podem ir para spam. Configure o domínio no Resend.
