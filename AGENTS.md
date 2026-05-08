<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🏗️ BioAthlete — AI Developer Guide

> Ce fichier est le guide de référence pour tout développeur IA (Claude, GPT, Gemini, Copilot, etc.)
> travaillant sur BioAthlete. Lis-le **intégralement** avant d'écrire une seule ligne de code.

---

## 📌 Projet en un coup d'œil

**BioAthlete** est une plateforme SaaS de vitrine professionnelle pour athlètes d'athlétisme.
Un athlète crée son profil, saisit ses chronos, ajoute ses sponsors, et obtient une page publique
cinématique partageable (`/u/username`).

| Aspect | Détail |
|--------|--------|
| **Framework** | Next.js 16.2.4 (App Router, Turbopack) |
| **React** | 19.2.4 |
| **Styling** | TailwindCSS 3.4 + CSS Variables (dual theme) |
| **Animations** | Framer Motion 12.38+ |
| **Backend** | Supabase (Auth, Database, Storage) |
| **Paiements** | Stripe |
| **Déploiement** | Vercel |
| **Charts** | Recharts 3.8 |
| **PDF** | jsPDF |
| **Icons** | Lucide React |

---

## 📁 Architecture des fichiers

```
bioathlete/
├── src/
│   ├── app/
│   │   ├── ThemeProvider.tsx      # 🎨 Context thème clair/sombre + toggle
│   │   ├── globals.css            # 🎨 Design System (CSS vars + Tailwind overrides)
│   │   ├── layout.tsx             # 📐 Layout racine (fonts, footer, ThemeProvider)
│   │   ├── page.tsx               # 🏠 Landing page publique
│   │   ├── login/page.tsx         # 🔐 Page de connexion
│   │   ├── register/page.tsx      # 📝 Onboarding multi-étapes
│   │   ├── pro/page.tsx           # 💎 Page offre premium
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # 📊 Dashboard principal (~2500 lignes)
│   │   │   └── LivePreviewModal.tsx # 🎬 Modal aperçu cinématique
│   │   ├── u/[username]/
│   │   │   ├── layout.tsx         # 📐 Layout visiteur (isolé du dashboard)
│   │   │   ├── page.tsx           # 🌐 Page publique athlète
│   │   │   ├── ParallaxComponents.tsx # 🎭 Composants parallax réutilisables
│   │   │   └── CustomChart.tsx    # 📈 Chart 3D custom pour performances
│   │   ├── api/                   # 🔌 Routes API (Stripe webhooks, etc.)
│   │   ├── cgu/                   # 📄 CGU
│   │   ├── confidentialite/       # 📄 Politique de confidentialité
│   │   └── mentions-legales/      # 📄 Mentions légales
│   └── lib/
│       └── supabase.ts            # 🔧 Client Supabase singleton
├── public/                        # 📂 Assets statiques (manifest, sw.js, etc.)
├── supabase_setup.sql             # 🗃️ Schéma SQL de la base de données
├── .env.local                     # 🔑 Variables d'environnement (NON committé)
├── .env.example                   # 🔑 Template des variables requises
└── AGENTS.md                      # 📖 CE FICHIER — Guide développeur IA
```

### 🚨 Fichiers critiques à ne PAS casser

| Fichier | Pourquoi |
|---------|----------|
| `dashboard/page.tsx` | Cœur de l'app (~2500 lignes), toute la logique CRUD |
| `globals.css` | Design system dual-thème, casse le style si mal modifié |
| `ThemeProvider.tsx` | Gère le switch clair/sombre pour toute l'app |
| `u/[username]/page.tsx` | Page publique visiteur avec parallax |
| `LivePreviewModal.tsx` | Aperçu cinématique dans le dashboard |
| `lib/supabase.ts` | Client Supabase unique — ne jamais dupliquer |

---

## 🎨 Système de Design — Double Thème

### Architecture CSS Variables

Le système repose sur des **CSS custom properties** déclarées dans `globals.css` :

- `:root { ... }` → **Thème clair** (fond blanc, texte sombre, cartes blanches)
- `[data-theme="dark"] { ... }` → **Thème sombre** (cinema parallax, glassmorphism)

### Variables principales à utiliser

```css
/* Fond */
var(--bg-base)         /* Fond principal */
var(--bg-elevated)     /* Fond élevé (cartes) */
var(--bg-sunken)       /* Fond enfoncé (inputs) */

/* Texte */
var(--text-primary)    /* Texte principal */
var(--text-secondary)  /* Texte secondaire */
var(--text-muted)      /* Texte discret */

/* Accent */
var(--accent)          /* Couleur d'accent (émeraude) */
var(--accent-soft)     /* Accent avec opacité */

/* Composants */
var(--card-bg)         /* Fond des cartes */
var(--border)          /* Bordures */
var(--card-shadow)     /* Ombres des cartes */

/* Glass */
var(--glass-bg)        /* Fond glassmorphism */
var(--glass-border)    /* Bordure glass */
var(--glass-blur)      /* Valeur de blur (20px light, 40px dark) */
```

### Stratégie de thématisation

Le dashboard utilise des **classes Tailwind hardcodées** (`bg-white`, `text-slate-900`, etc.).
Plutôt que de les modifier une par une, on utilise des **CSS overrides** dans `globals.css` :

```css
[data-theme="dark"] .bg-white { background-color: rgba(255,255,255,0.03) !important; }
[data-theme="dark"] .text-slate-900 { color: #EDEDEF !important; }
[data-theme="dark"] .border-slate-300 { border-color: rgba(255,255,255,0.06) !important; }
```

**Règle** : Pour les nouveaux composants, utilise `style={{ color: 'var(--text-primary)' }}`
ou les classes `.themed-card`, `.themed-input`, `.themed-btn-primary` définies dans `globals.css`.
Ne rajoute PAS de nouvelles classes Tailwind hardcodées en `bg-white` ou `bg-slate-*`.

### Classes utilitaires thématisées

```css
.themed-card      /* Carte adaptative avec shadow et border */
.themed-input     /* Input stylisé avec focus accent */
.themed-btn-primary /* Bouton principal émeraude */
.themed-glass     /* Composant glassmorphism */
.themed-modal-bg  /* Fond de modale */
.text-gradient-neon /* Gradient texte émeraude → cyan */
```

---

## 🎬 Design Cinématique — Références UX/UI

### Dépôts de référence obligatoires

Avant toute modification visuelle, consulte ces deux ressources pour comprendre
les principes de design utilisés dans le projet :

1. **UI/UX Pro Max Skill** (bibliothèque de styles)
   - Repository : `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`
   - Cloner : `git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git`
   - Contenu : 72+ styles de design, guidelines de motion, typographie, animations
   
2. **Styles prioritaires à utiliser dans BioAthlete** :
   | # | Style | Usage |
   |---|-------|-------|
   | **#71** | Modern Dark (Cinema Mobile) | Base du thème sombre |
   | **#49** | Parallax Storytelling | Page visiteur `/u/[username]` |
   | **#14** | Liquid Glass | Glassmorphism des cartes |
   | **#15** | Motion-Driven | Toutes les animations |
   | **#27** | Bento Grid | Layout des sections sponsors |

### Valeurs d'animation à respecter

```typescript
// Easing cinématique (NE PAS changer)
const CINEMA_EASE = [0.16, 1, 0.3, 1];

// Spring physics pour les cartes
const SPRING_CONFIG = { damping: 20, stiffness: 90 };

// Stagger reveal (sections qui apparaissent au scroll)
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
};

// Item reveal avec blur-to-sharp
const item = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", damping: 20, stiffness: 90 } }
};
```

### Palette de couleurs (mode sombre)

```
Fond :        #0a0a0f → #020203 (gradient vertical)
Accent :      #10B981 (émeraude)
Accent alt :  #00D4FF (cyan)
Texte :       #EDEDEF (primaire), rgba(255,255,255,0.25) (muted)
Glass :       rgba(255,255,255,0.03) bg + blur(40px) saturate(180%)
Bordures :    rgba(255,255,255,0.06)
Shine edge :  linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)
```

### Palette de couleurs (mode clair)

```
Fond :        #F8FAFC
Cards :       #FFFFFF avec shadow subtile
Accent :      #10B981 (même émeraude)
Texte :       #0F172A (primaire), #94A3B8 (muted)
Bordures :    #E2E8F0
```

---

## ⚠️ Pièges et erreurs connues

### 1. Hydration Framer Motion + useScroll

```
❌ ERREUR : "Target ref is defined but not hydrated"
```

**Cause** : `useScroll({ container: someRef })` avant que le ref ne soit monté.

**Solution** : Utiliser `useScroll()` SANS `target` pour écouter le scroll global,
ou wrapper avec un `useState(false)` + `useEffect(() => setMounted(true), [])`.

### 2. Dashboard — taille du fichier

Le `dashboard/page.tsx` fait ~2500 lignes. Si tu dois le modifier :
- Identifie la section exacte avec `grep` ou `view_file` par plages
- Ne réécris PAS le fichier entier — utilise des edits ciblés
- Extrais les nouveaux composants dans des fichiers séparés (comme `LivePreviewModal.tsx`)

### 3. CSS import conflicts

Ne jamais utiliser `@import url()` dans `globals.css` avec PostCSS.
Les Google Fonts sont injectées directement dans `layout.tsx` via `<link>`.

### 4. Tailwind classes vs CSS variables

- **Code existant** : Utilise les classes Tailwind `bg-white`, `text-slate-*`
- **Nouveau code** : Utilise les CSS variables `var(--text-primary)`, `var(--card-bg)`
- Les classes existantes sont automatiquement remappées en mode sombre via les overrides CSS

### 5. Supabase tables

```sql
-- Tables principales (voir supabase_setup.sql pour le schéma complet)
profiles      -- user_id, username, full_name, bio, avatar_url, is_premium
performances  -- user_id, date, distance (discipline), temps, competition
sponsors      -- user_id, name, logo, category, url
links         -- user_id, title, url, icon
videos        -- user_id, url, title
photo_gallery -- user_id, url, title, date
page_views    -- profile_id, viewer_ip, viewed_at
```

---

## 🔧 Conventions de code

### Composants

1. **`"use client"`** en haut de chaque composant interactif
2. Nommer les composants en **PascalCase** (`LivePreviewModal`, `ThemeToggle`)
3. Un composant par fichier quand il dépasse ~200 lignes
4. Typer les props avec TypeScript (ou `any` si urgence, mais signaler en commentaire)

### Styles

1. Préférer `style={{ color: 'var(--text-primary)' }}` pour les nouveaux éléments
2. Les classes utilitaires Tailwind restent valides pour le layout (`flex`, `gap-4`, `p-6`)
3. Les couleurs doivent passer par les CSS variables ou les classes Tailwind couvertes par les overrides

### Animations

1. Toujours utiliser `framer-motion` — pas de CSS animations sauf `@keyframes` existants
2. `whileInView` avec `viewport={{ once: true }}` pour les reveals
3. `AnimatePresence mode="wait"` pour les transitions entre onglets/modals
4. Ne jamais mettre `useRef` + `useScroll({ target })` dans un composant SSR

### Git

1. Messages en français, format : `type: description courte`
   - `feat:` nouvelle fonctionnalité
   - `fix:` correction de bug
   - `style:` changement visuel
   - `refactor:` refactorisation sans changement fonctionnel
2. Ne jamais committer `.env.local` ou `node_modules`

---

## 🚀 Commandes de développement

```bash
npm run dev      # Lancer le serveur de développement (Turbopack)
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linter ESLint
```

---

## 📋 Checklist avant chaque modification

- [ ] J'ai lu ce fichier AGENTS.md en entier
- [ ] J'ai vérifié le thème clair ET sombre après mes changements
- [ ] Mes nouvelles couleurs utilisent des CSS variables, pas de hardcoded
- [ ] Mes animations utilisent les valeurs `CINEMA_EASE` et `SPRING_CONFIG`
- [ ] J'ai testé que le build ne casse pas (`npm run build`)
- [ ] Je n'ai pas dupliqué le client Supabase
- [ ] J'ai consulté les styles #71, #14, #15, #49 du repo ui-ux-pro-max-skill si pertinent
- [ ] Le dashboard fonctionne toujours après mes modifications
