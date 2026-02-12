# NeuroScope VR - AGENTS.md

> This file contains essential information for AI coding agents working on the NeuroScope VR project.
> Read this first before making any changes.

---

## Project Overview

**NeuroScope VR** is a Virtual Reality (VR) therapy platform that connects psychotherapists and patients through immersive virtual environments. The platform enables real-time therapist-patient interaction with comfort telemetry, session control, and WebRTC voice communication.

### Key Features
- **Therapist Dashboard** - Patient management, DASS-21 assessments, session control
- **VR Environments** - Forest, Beach, Classroom, Breathing Temple, Sunrise Meadow, Sensory Void (powered by A-Frame)
- **Real-time Sync** - Supabase Realtime for session state synchronization
- **Comfort Telemetry** - Gaze tracking and comfort level monitoring
- **Multi-tenant SaaS** - Clinic management with CID-10 pathology support

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React | 19.2.0 |
| **Language** | TypeScript | 5.9.3 |
| **Build Tool** | Vite | 7.2.4 |
| **Styling** | Tailwind CSS | 3.4.19 |
| **UI Components** | shadcn/ui | new-york style |
| **VR/3D** | A-Frame | 1.7.1 (loaded from CDN) |
| **Backend** | Supabase | supabase-js 2.95.3 |
| **Charts** | Recharts | 2.15.4 |
| **Icons** | Lucide React | 0.562.0 |
| **Forms** | React Hook Form | 7.70.0 + Zod 4.3.5 |

---

## Project Structure

```
plataformneuroscopevr/
├── app/                          # Main React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # 50+ shadcn/ui components (button.tsx, card.tsx, dialog.tsx, etc.)
│   │   │   └── Navbar.tsx       # Main navigation component
│   │   ├── sections/            # Page-level view components
│   │   │   ├── LandingPage.tsx       # Public landing page
│   │   │   ├── LoginPage.tsx         # Authentication
│   │   │   ├── Dashboard.tsx         # Therapist dashboard
│   │   │   ├── SessionControl.tsx    # Session management
│   │   │   ├── SessionCockpit.tsx    # Real-time control panel (full screen)
│   │   │   ├── VREnvironment.tsx     # VR scene viewer
│   │   │   ├── VREnvironments.tsx    # Environment selector
│   │   │   ├── WaitingRoom.tsx       # Patient entry portal
│   │   │   ├── PatientRegister.tsx   # Patient onboarding
│   │   │   ├── DASS21Form.tsx        # Assessment form
│   │   │   ├── TherapistDemo.tsx     # Demo mode (therapist)
│   │   │   ├── PatientDemo.tsx       # Demo mode (patient)
│   │   │   └── AdminCRM.tsx          # Clinic management
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # Authentication state & routing
│   │   ├── hooks/
│   │   │   └── use-mobile.ts         # Responsive detection hook
│   │   ├── lib/
│   │   │   ├── supabase.ts           # Supabase client & API functions
│   │   │   ├── db-simulation.ts      # Business engine / mock data
│   │   │   └── utils.ts              # cn() utility for class merging
│   │   ├── types/
│   │   │   ├── index.ts              # Main TypeScript definitions
│   │   │   └── database.ts           # Database types
│   │   ├── App.tsx                   # Main app with view routing
│   │   ├── main.tsx                  # Entry point
│   │   └── index.css                 # Global styles + CSS variables
│   ├── public/                   # Static assets
│   ├── dist/                     # Production build output
│   ├── .env                      # Environment variables (not in git)
│   ├── .env.example              # Environment template
│   ├── vite.config.ts            # Vite configuration (base: './', @/ alias)
│   ├── tsconfig.json             # Root TypeScript config (project refs)
│   ├── tsconfig.app.json         # App TypeScript settings (strict mode)
│   ├── tsconfig.node.json        # Node/Vite TypeScript settings
│   ├── tailwind.config.js        # Tailwind with CSS variables theme
│   ├── postcss.config.js         # PostCSS with tailwindcss + autoprefixer
│   ├── eslint.config.js          # ESLint with typescript-eslint
│   ├── components.json           # shadcn/ui configuration
│   └── package.json              # Dependencies
│
├── supabase_schema.sql           # Main database schema
├── supabase_schema_extensions.sql # SaaS extensions (multi-tenant)
├── DEPLOY_GUIDE.md               # Deployment instructions
├── DEPLOY_ATUALIZADO.md          # Updated deployment guide
├── DEPLOY_VERCEL.md              # Vercel-specific deploy guide
├── deploy.ps1 / deploy.sh        # Deploy scripts
└── README.md                     # Human documentation
```

---

## Build and Development Commands

All commands run from the `app/` directory:

```bash
cd app

# Install dependencies
npm install

# Development server (Vite dev server on http://localhost:5173)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Lint code with ESLint
npm run lint
```

### TypeScript Configuration
- `tsconfig.json` - Root config with project references
- `tsconfig.app.json` - Application settings: ES2022, strict mode, bundler moduleResolution
- `tsconfig.node.json` - Node/Vite settings
- Path alias: `@/*` maps to `./src/*`

---

## Environment Variables

Create `app/.env` file (copy from `.env.example`):

```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional
VITE_ANALYTICS_ID=          # Analytics tracking ID
```

**Important:** Variables must be prefixed with `VITE_` to be exposed to the client.

---

## Database Schema (Supabase)

### Main Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Therapist/user profiles (extends auth.users) |
| `patients` | Patient records with CID-10 codes |
| `dass21_scores` | DASS-21 assessment scores |
| `sessions` | Therapy session records |
| `session_realtime` | Real-time session state sync |
| `comfort_check_events` | Patient comfort audit log |
| `voice_channels` | WebRTC signaling data |
| `clinics` | Multi-tenant clinic data |
| `managers` | Clinic administrators |
| `session_logs` | Business intelligence events |

### Key Features
- **RLS Enabled** - All tables have Row Level Security policies
- **Realtime** - `session_realtime` and `voice_channels` publish changes
- **Views** - `patient_with_dass21`, `session_with_patient`, `clinic_productivity`
- **Functions** - `start_session()`, `end_session()`, `record_comfort_check()`

### Schema Files
- `supabase_schema.sql` - Core schema (profiles, patients, sessions)
- `supabase_schema_extensions.sql` - SaaS features (clinics, managers, CID-10)

---

## Code Style Guidelines

### TypeScript
- Strict mode enabled (`strict: true`)
- Explicit return types on exported functions
- Interface naming: `PascalCase`
- Type naming: `PascalCase`
- Unused locals and parameters are errors (`noUnusedLocals: true`)

### Components
- Functional components with explicit React.FC type
- Props interface named `{ComponentName}Props`
- Use shadcn/ui components when available
- Custom components in `src/components/`

### Imports (Priority Order)
1. React imports
2. Third-party libraries
3. Absolute imports (`@/components`, `@/lib`, `@/types`)
4. Relative imports (sibling files)

Example:
```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import type { Patient } from '@/types';
import { LocalComponent } from './LocalComponent';
```

### Tailwind/Styling
- Use Tailwind utility classes exclusively
- Color scheme uses CSS variables (--primary, --background, etc.)
- Theme colors: slate (neutral), teal accent in UI
- Dark mode support via `dark:` prefix
- Custom radius: `var(--radius)` = 0.625rem

### Utility Function
Use the `cn()` helper for conditional class merging:
```typescript
import { cn } from '@/lib/utils';

className={cn("base-classes", condition && "conditional-class")}
```

---

## Key Libraries Usage

### shadcn/ui Components
Components are in `src/components/ui/`. Import pattern:
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
```

Add new components:
```bash
npx shadcn@latest add component-name
```

Configuration in `components.json`:
- Style: `new-york`
- RSC: `false`
- Base color: `slate`
- CSS variables: `true`
- Icon library: `lucide`

### Supabase
All database operations go through `src/lib/supabase.ts`:
```typescript
import { supabase, getPatients, signIn } from '@/lib/supabase';
```

### A-Frame (VR)
Loaded dynamically when VR views are accessed (from CDN):
```typescript
// In App.tsx, loaded from: https://aframe.io/releases/1.4.2/aframe.min.js
// Types: @types/aframe
```

### Icons (Lucide)
```typescript
import { User, Settings, LogOut } from 'lucide-react';
```

---

## Authentication Flow

1. User signs in via `login()` in AuthContext
2. Supabase Auth returns JWT session
3. Profile loaded from `profiles` table
4. Auth state persisted by Supabase
5. Realtime subscriptions authenticated automatically

### Roles
- `guest` - Unauthenticated
- `therapist` - Standard user
- `admin` - System administrator
- `company` - Clinic manager

### Route Handling
Views are controlled via URL query parameters, not React Router:
- `?view=dashboard` - Dashboard
- `?view=patient-demo` - Patient demo mode
- `?view=therapist-demo` - Therapist demo mode
- `?view=vr-environment` - VR environment
- `?view=waiting-room` - Patient waiting room

---

## State Management

- **No Redux** - State managed via React Context
- **AuthContext** - User auth, current view, role
- **Supabase Realtime** - Session sync and voice channels
- **Local state** - Component-level state with useState

---

## Testing Strategy

Currently the project uses:
- **ESLint** for code quality (`npm run lint`)
- **TypeScript** for type checking
- **Demo modes** for manual testing:
  - `?view=therapist-demo` - Therapist demo
  - `?view=patient-demo` - Patient demo

No automated unit/integration tests are configured yet.

---

## Deployment

### Supported Platforms
- **Vercel** (recommended) - See `DEPLOY_VERCEL.md`
- **Netlify** - Configured with `netlify.toml` and `_redirects`
- **Cloudflare Pages**
- **Surge.sh** - Quick deploy: `npx surge --domain neuroscopevr.surge.sh`

### Build Output
- Directory: `app/dist/`
- SPA routing: All routes redirect to `index.html`
- Base path: `./` (relative)

### Environment Setup
Required environment variables in hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Deploy Scripts
```bash
# Windows
.\deploy.ps1

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

---

## Security Considerations

1. **RLS Policies** - All database tables have Row Level Security
2. **Environment Variables** - Secrets never committed to git
3. **Input Validation** - Zod schemas for form validation
4. **Auth Guards** - Protected views check authentication state

---

## Language

The project uses **Portuguese (Brazil)** for:
- User interface text
- Comments in business logic
- Database content (severity levels: Normal, Leve, Moderado, Grave, Extremamente Grave)

Use Portuguese for any new user-facing text or Portuguese-language comments.

---

## Common Tasks

### Adding a New Section/Page
1. Create component in `src/sections/NewSection.tsx`
2. Add `AppView` type in `src/types/index.ts` if needed
3. Add route case in `src/App.tsx` switch statement
4. Add navigation link in `Navbar.tsx` if appropriate

### Adding a Database Table
1. Add CREATE TABLE to `supabase_schema.sql` or extensions file
2. Enable RLS with policies
3. Add TypeScript interface to `src/types/index.ts`
4. Add API functions to `src/lib/supabase.ts`

### Using a New shadcn/ui Component
```bash
# From app/ directory
npx shadcn@latest add component-name
```

---

## Important Notes

- **A-Frame is loaded from CDN** - Not bundled, loaded dynamically in VR views
- **No React Router** - Uses query params (`?view=xxx`) for routing
- **Supabase Realtime** - Used for session sync, requires proper channel subscriptions
- **SPA Routing** - Configure host to serve `index.html` for all routes
- **VR Support** - Requires WebGL and works best in VR-capable browsers

---

*Last updated: 2026-02-12 - Based on actual project structure analysis*
