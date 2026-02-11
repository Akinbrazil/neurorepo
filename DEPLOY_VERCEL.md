# 🚀 Deploy na Vercel - Passo a Passo

## Opção 1: Deploy Automático (Recomendado)

### 1. Login na Vercel
```bash
cd app
npx vercel login
```
- Abra o link no navegador
- Confirme a autenticação

### 2. Deploy
```bash
npm run build
npx vercel --prod
```

---

## Opção 2: Via GitHub (CI/CD)

1. **Push no GitHub:**
```bash
git add .
git commit -m "Ready for deploy"
git push origin main
```

2. **Conecte no painel Vercel:**
- Acesse [vercel.com/new](https://vercel.com/new)
- Importe seu repositório
- Configure:
  - **Framework Preset:** Vite
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
  - **Root Directory:** `app`

3. **Adicione Variáveis de Ambiente:**
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

4. **Deploy automático** a cada push!

---

## Opção 3: CLI Interativo

```bash
cd app

# Primeiro deploy (configura projeto)
npx vercel

# Deploys subsequentes
npx vercel --prod
```

---

## ✅ Configurações do Projeto

O `vercel.json` já está configurado:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 🔧 Build Local

Teste antes de deployar:

```bash
cd app
npm run build
npx vite preview
```

Acesse `http://localhost:4173` para verificar.

---

## 🌐 URL do Projeto

Após deploy, seu projeto estará em:
```
https://neuroscopevr.vercel.app
```

---

## ⚠️ Erros Comuns

### "Token is not valid"
```bash
npx vercel logout
npx vercel login
```

### "Build failed"
```bash
# Limpe cache
rm -rf node_modules dist
npm install
npm run build
```

### "404 em rotas"
O `vercel.json` já contém:
```json
{
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}
```

---

## 📋 Checklist

- [ ] `npm run build` funciona localmente
- [ ] Logado na Vercel (`npx vercel login`)
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido

**Pronto! 🎉**
