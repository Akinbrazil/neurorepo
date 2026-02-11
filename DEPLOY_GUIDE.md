# 🚀 NeuroScope VR - Guia de Deploy

## Opções de Deploy Online

### Opção 1: Vercel (Recomendada) ⭐
A mais rápida e integrada com GitHub.

#### Passo a passo:
1. **Cadastre-se** em [vercel.com](https://vercel.com) (use sua conta GitHub)
2. **Instale o CLI:**
   ```bash
   npm i -g vercel
   ```
3. **Faça login:**
   ```bash
   vercel login
   ```
4. **Deploy:**
   ```bash
   cd app
   vercel --prod
   ```

**URL gerada:** `https://neuroscopevr.vercel.app`

---

### Opção 2: Netlify (Muito Popular)
Excelente para SPAs estáticas.

#### Passo a passo:
1. **Cadastre-se** em [netlify.com](https://netlify.com)
2. **Arraste e solte** (Deploy Manual):
   - Faça build: `cd app && npm run build`
   - Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
   - Arraste a pasta `app/dist`

3. **Ou use o CLI:**
   ```bash
   npm i -g netlify-cli
   netlify login
   cd app
   netlify deploy --prod --dir=dist
   ```

**URL gerada:** `https://neuroscopevr.netlify.app`

---

### Opção 3: Surge.sh (Mais Simples)
Não requer cadastro prévio.

#### Passo a passo:
```bash
cd app/dist
npx surge --domain neuroscopevr.surge.sh
# Informe email e senha quando solicitado
```

**URL:** `https://neuroscopevr.surge.sh`

---

### Opção 4: GitHub Pages (Gratuito)
Integrado ao seu repositório GitHub.

#### Passo a passo:
1. **Commit e push** do código no GitHub
2. Acesse **Settings > Pages** no repositório
3. Selecione **GitHub Actions** como source
4. O workflow já está configurado em `.github/workflows/deploy-vercel.yml`

---

### Opção 5: Cloudflare Pages (Performance)
Excelente para performance global.

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
2. Vá em **Pages > Create a project**
3. Conecte seu repositório GitHub
4. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
   - Root directory: `app`

---

## ⚙️ Configuração de Variáveis de Ambiente

Para todas as plataformas, configure estas variáveis:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### No Vercel:
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### No Netlify:
Site settings > Build & deploy > Environment variables

---

## 🔄 Deploy Automático (CI/CD)

O projeto já inclui GitHub Actions para deploy automático.

### Configuração necessária no GitHub:
1. Acesse **Settings > Secrets and variables > Actions**
2. Adicione os secrets:
   - `VERCEL_TOKEN` (obtenha em [vercel.com/account/tokens](https://vercel.com/account/tokens))
   - `VERCEL_ORG_ID` (no arquivo `.vercel/project.json` após primeiro deploy)
   - `VERCEL_PROJECT_ID` (no arquivo `.vercel/project.json`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. A cada push na branch `main`, o deploy será automático!

---

## 📋 Checklist Pré-Deploy

- [ ] Build local funciona (`npm run build`)
- [ ] Não há erros no console
- [ ] Variáveis de ambiente configuradas
- [ ] Testado em modo produção
- [ ] PWA configurado (opcional)

---

## 🌐 URLs do Projeto

Após deploy, suas URLs estarão disponíveis:

| Página | URL |
|--------|-----|
| Landing | `https://seudominio.com/` |
| Dashboard | `https://seudominio.com/?view=dashboard` |
| VR Environment | `https://seudominio.com/?view=vr-environment` |
| Waiting Room | `https://seudominio.com/?view=waiting-room` |
| Session Cockpit | `https://seudominio.com/?view=session-cockpit` |

---

## 🆘 Suporte

Problemas comuns:

### "Build failed"
- Verifique se todas as dependências estão instaladas
- Rode `npm run build` localmente para ver erros

### "404 em rotas"
- Configure o redirect para `index.html` (SPA)
- No Vercel: `vercel.json` já configurado ✓
- No Netlify: `_redirects` file ou `netlify.toml` ✓

### "Variáveis de ambiente não funcionam"
- Prefixe com `VITE_` para Vite
- Reinicie o deploy após adicionar variáveis

---

## 🎉 Pronto!

Seu NeuroScope VR está online! 🚀
