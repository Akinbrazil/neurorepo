# 🧠 NeuroScope VR Platform

Plataforma de terapia imersiva em Realidade Virtual (VR) que conecta psicoterapeutas e pacientes através de ambientes virtuais controlados.

![NeuroScope VR](https://img.shields.io/badge/NeuroScope-VR-blueviolet)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E)

---

## ✨ Funcionalidades

### 🎮 Para Terapeutas
- **Dashboard Clínico** - Gestão completa de pacientes e sessões
- **Avaliação DASS-21** - Questionário científico integrado
- **Controle de Sessão em Tempo Real** - Ajuste de intensidade e monitoramento
- **Telemetria de Conforto** - Visualização em tempo real do estado do paciente
- **Session Cockpit** - Interface profissional de supervisão com transcrição

### 🥽 Para Pacientes
- **Ambientes VR Terapêuticos** - Floresta, Praia, Sala de Aula
- **Sensor Guard** - Permissão de sensores para imersão completa
- **Verificação de Conforto** - Gaze tracking para confirmação de bem-estar
- **Waiting Room** - Portal de entrada profissional e seguro

### 🏥 SaaS Multi-tenant
- **Suporte a Clínicas** - Gestão de múltiplas clínicas
- **CID-10** - Categorização por patologia
- **Relatórios** - Analytics e produtividade
- **Segregação de Dados** - Segurança e privacidade

---

## 🚀 Deploy Online

### Opção Rápida - Surge.sh (30 segundos)
```bash
cd app/dist
npx surge --domain neuroscopevr.surge.sh
```

### Opção Recomendada - Vercel
```bash
npm i -g vercel
vercel login
cd app
vercel --prod
```

### Mais Opções
Veja o [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) para todas as opções de deploy.

---

## 🛠️ Desenvolvimento Local

```bash
# Clone o repositório
git clone <repo-url>
cd plataformneuroscopevr

# Instale dependências
cd app
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Supabase

# Rode em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

---

## 📁 Estrutura do Projeto

```
plataformneuroscopevr/
├── app/                          # Aplicação React + Vite
│   ├── src/
│   │   ├── components/ui/       # 50+ componentes shadcn/ui
│   │   ├── sections/            # Páginas principais
│   │   │   ├── Dashboard.tsx         # Dashboard do terapeuta
│   │   │   ├── VREnvironment.tsx     # Ambiente VR
│   │   │   ├── WaitingRoom.tsx       # Sala de espera
│   │   │   ├── SessionCockpit.tsx    # Cockpit de supervisão
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── supabase.ts      # Cliente Supabase
│   │   │   └── db-simulation.ts # Business Engine
│   │   └── types/               # Tipos TypeScript
│   └── dist/                    # Build de produção
├── supabase_schema.sql          # Schema principal
├── supabase_schema_extensions.sql # Schema SaaS
└── .github/workflows/           # CI/CD
```

---

## 🗄️ Database Schema

### Tabelas Principais
- `profiles` - Terapeutas
- `patients` - Pacientes (com CID-10)
- `dass21_scores` - Escores DASS-21
- `sessions` - Sessões terapêuticas
- `session_realtime` - Sincronização em tempo real
- `clinics` - Clínicas (multi-tenant)
- `managers` - Gestores

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na pasta `app/`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

---

## 📊 Funcionalidades Implementadas

### Vision A - Comfort Telemetry ✅
- Telemetria de conforto em tempo real
- Session Cockpit com controles de áudio
- Transcrição automática via Web Speech API
- Controle remoto de intensidade

### Vision B - Multi-tenant SaaS ✅
- Suporte a múltiplas clínicas
- Códigos CID-10
- Dashboard de gestor
- Filtros por patologia e status

### Vision C - Safe Client Experience ✅
- Waiting Room isolada
- White-label branding
- Pre-loading de assets
- Token-based access

---

## 🌐 Acessos Diretos

Após deploy, acesse:

| View | Parâmetro URL |
|------|--------------|
| Landing | `/?view=landing` |
| Dashboard | `/?view=dashboard` |
| VR Environment | `/?view=vr-environment&env=floresta` |
| Waiting Room | `/?view=waiting-room` |
| Session Cockpit | `/?view=session-cockpit` |
| Patient Demo | `/?view=patient-demo` |
| Therapist Demo | `/?view=therapist-demo` |

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos canais oficiais.

---

**🚀 Deploy rápido:**
```bash
# Windows
.\deploy.ps1

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```
