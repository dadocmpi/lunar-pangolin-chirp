# Email de Confirmação - Guia de Configuração

## Problema Identificado
O email de confirmação do Supabase não estava funcionando porque:
1. Não havia uma página de callback para processar a confirmação
2. Não estava configurado o `emailRedirectTo` para direcionar para o seu site
3. O template de email padrão do Supabase não estava personalizado

## O que foi feito

### 1. Página de Callback (`/auth-callback`)
Criada a página `src/pages/AuthCallback.tsx` que:
- Processa o callback do Supabase após o clique no link de confirmação
- Confirma o email do usuário
- Redireciona para o dashboard após confirmação bem-sucedida

### 2. Email Redirect Configurado
Modificado `src/pages/Register.tsx` para usar `emailRedirectTo`:
```javascript
emailRedirectTo: `${siteUrl}/auth-callback`
```

### 3. Template de Email Customizado
Criada a função Edge `supabase/functions/confirm-signup/index.ts` que envia emails de confirmação com:
- Design profissional com branding Braxel Markets
- Botão "Confirm Your Email" clicável
- Link alternativo para copiar e colar
- Instruções de segurança

## Configurações Necessárias no Supabase Dashboard

### 1. Configurar Site URL
Acesse: **Authentication > URL Configuration**

```
Site URL: https://seu-dominio.com
```

### 2. Adicionar Redirect URL
Na mesma seção, adicione a URL de callback:

```
Redirect URLs:
- https://seu-dominio.com/auth-callback
- https://seu-dominio.com/*
```

### 3. Configurar Email (opcional)
Acesse: **Authentication > Email Templates**

Opcionalmente, você pode personalizar o template de confirmação do Supabase diretamente no dashboard. Use as variáveis:
- `{{ .ConfirmationURL }}` - URL de confirmação
- `{{ .Token }}` - Token de confirmação
- `{{ .User.email }}` - Email do usuário
- `{{ .User.full_name }}` - Nome do usuário

### 4. Configurar Resend API Key (para emails customizados)

No Supabase Dashboard, vá em **Edge Functions > Secrets** e adicione:

```
RESEND_API_KEY=sua_chave_resend_aqui
```

Você pode obter uma chave API em: https://resend.com/api-keys

## Testando

1. Faça deploy das Edge Functions:
```bash
supabase functions deploy confirm-signup
supabase functions deploy send-email
```

2. Crie uma nova conta no site

3. Verifique se o email de confirmação chega com:
   - Branding Braxel Markets
   - Botão clicável "Confirm Your Email"
   - Link alternativo

4. Clique no link e verifique se:
   - A página `/auth-callback` carrega
   - Após confirmação, redireciona para `/login`

## URLs dos Ambientes

- **Produção**: https://braxelmarkets.vercel.app
- **Work 1**: https://work-1-davivwbrvnwnuagg.prod-runtime.all-hands.dev
- **Work 2**: https://work-2-davivwbrvnwnuagg.prod-runtime.all-hands.dev

### Configuração no Supabase Dashboard

1. Vá em **Authentication > URL Configuration**

2. Configure:
   - **Site URL**: `https://braxelmarkets.vercel.app`
   
3. Em **Redirect URLs**, adicione:
   ```
   https://braxelmarkets.vercel.app/auth-callback
   ```

### Fluxo de Confirmação

1. Usuário se registra → recebe email
2. Clica no link de confirmação
3. `/auth-callback` confirma o email
4. Redireciona para `/login` (para fazer login)
