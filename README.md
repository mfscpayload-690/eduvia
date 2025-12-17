# Smart Campus Assistant

A modern, full-stack web application designed to help students and faculty access essential campus utilities in a clean, fast, mobile-first interface.

**Built with**: Next.js 14 • React • TypeScript • TailwindCSS • Supabase • NextAuth.js

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Development](#development)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Project Overview

This is an MVP (Minimum Viable Product) of the Smart Campus Assistant, built following strict architectural principles defined in [Master_Prompt.md](docs/Master_Prompt.md) and [AI Instructions](docs/copilot-instructions.md).

The app is NOT an academic assignment—it's a professional learning platform for the team to master:
- Modern full-stack web development
- Cloud deployment & serverless architecture
- Database design & authentication
- API development & integration
- Team collaboration & code quality

---

## Features

### MVP (Current Phase)

**Student Features:**
- ✅ Google OAuth authentication
- ✅ Dashboard with quick links
- ✅ Course timetable viewer
- ✅ Shared course notes browser & download
- ✅ Lost & Found portal
- ✅ Events calendar (placeholder)
- 🔜 AI chatbot for study help
- 🔜 Classroom finder

**Admin Features:**
- ✅ Admin-only routes with role-based access
- 🔜 Add/manage timetable entries
- 🔜 Register notes from Google Drive
- 🔜 Create/publish events
- 🔜 Manage lost & found items

### Future Phases
- PWA & offline support
- Push notifications
- Real-time collaboration (Supabase Realtime)
- Analytics dashboard
- Multi-campus support

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router) + React + TypeScript |
| **Styling** | TailwindCSS + ShadCN UI |
| **Backend** | Vercel Serverless Functions (Next.js API Routes) |
| **Database** | Supabase Postgres with Row Level Security |
| **Authentication** | NextAuth.js + Google OAuth |
| **File Storage** | Google Drive (PDF notes) |
| **AI/LLM** | OpenAI / Groq / Mistral |
| **Deployment** | Vercel |

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Google Cloud project with OAuth credentials
- LLM API key (OpenAI, Groq, or Mistral)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/smart-campus-assistant.git
   cd smart-campus-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Set up the database** (see Database Setup below)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## Environment Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from project settings
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   ```

### 2. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Authorized JavaScript origins: `http://localhost:3000` for dev)
5. Get Client ID and Client Secret
6. Add to `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_secret_here
   ```

### 3. NextAuth Secret

Generate a random 32+ character string:

```bash
openssl rand -base64 32
```

Add to `.env.local`:
```env
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. LLM Provider

Choose one: OpenAI, Groq, or Mistral

**OpenAI:**
```env
NEXT_PUBLIC_LLM_PROVIDER=openai
OPENAI_API_KEY=sk_your_key_here
```

**Groq (faster & free tier available):**
```env
NEXT_PUBLIC_LLM_PROVIDER=groq
GROQ_API_KEY=your_key_here
```

**Mistral:**
```env
NEXT_PUBLIC_LLM_PROVIDER=mistral
MISTRAL_API_KEY=your_key_here
```

---

## Database Setup

### Create Supabase Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  course TEXT NOT NULL,
  file_id TEXT NOT NULL,
  drive_url TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Timetable table
CREATE TABLE timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course TEXT NOT NULL,
  day TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT NOT NULL,
  faculty TEXT NOT NULL
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Lost & Found table
CREATE TABLE lostfound (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lost' CHECK (status IN ('lost', 'found', 'claimed')),
  contact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lostfound ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can read notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Users can read timetable" ON timetable FOR SELECT USING (true);
CREATE POLICY "Users can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can read lostfound" ON lostfound FOR SELECT USING (true);
```

---

## Development

### Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Code Style

This project uses:
- **TypeScript** strict mode (no `any` without explanation)
- **ESLint** for code quality
- **Prettier** for formatting (auto on save in VS Code)

All code must pass:
```bash
npm run type-check
npm run lint
```

### Development Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes (code will auto-format on save)
3. Test locally: `npm run dev`
4. Type check: `npm run type-check`
5. Commit with clear message: `git commit -m "feat: add new feature"`
6. Push and create Pull Request

---

## Project Structure

```
smart-campus-assistant/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Home (redirects to dashboard/signin)
│   ├── auth/signin/page.tsx    # Sign in page
│   ├── (dashboard)/
│   │   └── dashboard/page.tsx  # Main dashboard
│   ├── notes/                  # Notes pages
│   ├── timetable/page.tsx      # Timetable viewer
│   ├── events/page.tsx         # Events calendar
│   ├── lostfound/page.tsx      # Lost & Found portal
│   ├── classfinder/page.tsx    # Classroom finder
│   ├── admin/page.tsx          # Admin dashboard
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth routes
│       ├── notes/route.ts      # Notes API
│       ├── timetable/route.ts  # Timetable API
│       ├── events/route.ts     # Events API
│       ├── lostfound/route.ts  # Lost & Found API
│       └── chat/route.ts       # AI Chatbot API
│
├── components/
│   ├── ui/                     # ShadCN UI components
│   ├── navbar.tsx              # Top navigation
│   ├── sidebar.tsx             # Desktop sidebar
│   ├── chatbot.tsx             # Chat UI (placeholder)
│   └── pdf-viewer.tsx          # PDF preview (placeholder)
│
├── lib/
│   ├── types.ts                # Type definitions (single source of truth)
│   ├── supabase.ts             # Supabase client & queries
│   ├── auth.ts                 # Authentication helpers
│   ├── drive.ts                # Google Drive utilities
│   ├── openai.ts               # LLM API wrapper
│   └── utils.ts                # Utility functions
│
├── styles/
│   └── globals.css             # Global TailwindCSS styles
│
├── docs/
│   ├── Master_Prompt.md        # Technical specification
│   └── copilot-instructions.md # AI agent guidelines
│
├── .env.example                # Environment variables template
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

---

## API Documentation

### Authentication

All endpoints (except `/api/auth/*`) require a valid session.

### Endpoints

#### Notes
- `GET /api/notes` — List all notes
- `GET /api/notes/:id` — Get specific note
- `GET /api/notes/:id/download` — Download note PDF
- `POST /api/notes` — Create note (admin only)

#### Timetable
- `GET /api/timetable?course=CS101` — Get timetable, optionally filtered by course
- `POST /api/timetable` — Create entry (admin only)

#### Events
- `GET /api/events?filter=upcoming` — List events
- `POST /api/events` — Create event (admin only)

#### Lost & Found
- `GET /api/lostfound` — List items
- `POST /api/lostfound` — Report lost/found item

#### Chat
- `POST /api/chat` — Send message to AI assistant

---

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or deploy from CLI
vercel
```

### Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Database tables created & RLS enabled
- [ ] Google OAuth credentials updated with production URL
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXTAUTH_SECRET` is a strong random string
- [ ] SSL certificate enabled
- [ ] Database backups configured

---

## Contributing

This project follows [Master_Prompt.md](docs/Master_Prompt.md) and [AI Coding Instructions](docs/copilot-instructions.md) for consistency.

### Guidelines

- **No hardcoded secrets** — always use environment variables
- **TypeScript only** — no plain JavaScript
- **Types in `/lib/types.ts`** — single source of truth
- **Role-based access** — verify `session.user.role` in admin routes
- **Mobile-first design** — TailwindCSS responsive breakpoints
- **Clear PR descriptions** — what changed, why, which spec section

### Code Review Checklist

- [ ] TypeScript strict mode passes
- [ ] ESLint & Prettier pass
- [ ] No hardcoded secrets
- [ ] Tests/manual verification complete
- [ ] PR description references spec section

---

## Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [ShadCN UI](https://ui.shadcn.com)

---

## License

MIT

---

## Team

- **Project Lead**: You
- **UI/UX**: Devu Krishna
- **Backend/Database**: Aleena Mary Joseph
- **APIs/AI**: Sreeram S Nair

Built with ❤️ using modern web technologies.

---

**Last Updated**: December 17, 2025
