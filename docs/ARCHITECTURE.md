# Project Architecture & Structure

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js 14)                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Pages: Dashboard, Notes, Timetable, Events, Lost & Found, etc. │  │
│  │  Components: Navbar, Sidebar, Cards, Buttons (ShadCN UI)        │  │
│  │  Styling: TailwindCSS (mobile-first, dark mode)                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  BACKEND (Vercel Serverless Functions)                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  API Routes: /api/notes, /api/timetable, /api/events, etc.      │  │
│  │  Auth: NextAuth.js with Google OAuth + JWT sessions             │  │
│  │  Middleware: Role-based access control (student vs admin)       │  │
│  │  LLM Integration: OpenAI/Groq/Mistral via /api/chat             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                ▲                       ▲                    ▲
                │                       │                    │
         Queries & Auth         External Services      PDF Storage
                │                       │                    │
                ▼                       ▼                    ▼
        ┌──────────────┐        ┌───────────────┐   ┌──────────────┐
        │   Supabase   │        │  Google OAuth │   │ Google Drive │
        │   Postgres   │        │   LLM APIs    │   │   (PDFs)     │
        │      DB      │        │               │   │              │
        └──────────────┘        └───────────────┘   └──────────────┘
```

## Directory Tree (Full Structure)

```
smart-campus-assistant/
│
├── 📁 app/                                 Next.js App Router
│   ├── layout.tsx                         Root layout
│   ├── page.tsx                           Home (redirects)
│   │
│   ├── 📁 auth/
│   │   └── signin/page.tsx               Sign in page
│   │
│   ├── 📁 (dashboard)/                   Route group
│   │   └── dashboard/page.tsx            Main dashboard
│   │
│   ├── 📁 notes/
│   │   ├── page.tsx                      Notes list
│   │   └── [id]/page.tsx                 Note detail
│   │
│   ├── timetable/page.tsx                Timetable viewer
│   ├── events/page.tsx                   Events calendar
│   ├── lostfound/page.tsx                Lost & Found portal
│   ├── classfinder/page.tsx              Classroom finder
│   ├── admin/page.tsx                    Admin dashboard
│   │
│   └── 📁 api/                           Serverless API Routes
│       ├── 📁 auth/[...nextauth]/
│       │   └── route.ts                  NextAuth handler
│       ├── 📁 notes/
│       │   ├── route.ts                  GET/POST notes
│       │   └── [id]/
│       │       ├── route.ts              GET single note
│       │       └── download/route.ts     Download endpoint
│       ├── timetable/route.ts            GET/POST timetable
│       ├── events/route.ts               GET/POST events
│       ├── lostfound/route.ts            GET/POST lost & found
│       └── chat/route.ts                 POST chat messages
│
├── 📁 components/
│   ├── 📁 ui/                            ShadCN/Radix UI
│   │   ├── button.tsx                    Button component
│   │   ├── card.tsx                      Card component
│   │   └── ...
│   │
│   ├── navbar.tsx                        Top navigation
│   ├── sidebar.tsx                       Desktop sidebar
│   ├── chatbot.tsx                       Chat UI (TODO)
│   └── pdf-viewer.tsx                    PDF viewer (TODO)
│
├── 📁 lib/                               Utilities & Services
│   ├── types.ts                          TypeScript types (source of truth)
│   ├── supabase.ts                       Supabase client & queries
│   ├── auth.ts                           Auth helpers
│   ├── drive.ts                          Google Drive utilities
│   ├── openai.ts                         LLM API wrapper
│   └── utils.ts                          Helper functions
│
├── 📁 styles/
│   └── globals.css                       TailwindCSS styles
│
├── 📁 docs/
│   ├── Master_Prompt.md                  Technical spec (DO NOT EDIT)
│   ├── copilot-instructions.md           AI agent guidelines
│   └── schema.sql                        Database schema
│
├── 📁 public/                            Static assets (next iteration)
│
├── .env.example                          Environment variables template
├── .env.local                            Local env vars (NEVER commit)
├── .gitignore                            Git ignore rules
├── .eslintrc.json                        ESLint config
├── .prettierrc.json                      Prettier config
├── next.config.js                        Next.js config
├── tailwind.config.ts                    TailwindCSS config
├── tsconfig.json                         TypeScript config
├── package.json                          Dependencies
├── package-lock.json                     Lock file
│
├── README.md                             Main documentation
├── DEVELOPMENT.md                        Dev quick start
│
└── .github/
    └── copilot-instructions.md           AI coding guidelines (synced)
```

## Data Flow Diagram

### 1. User Authentication Flow
```
User
  │
  ├─→ Click "Sign in with Google"
  │
  ├─→ Google OAuth Challenge
  │   └─→ Verify credentials
  │
  ├─→ NextAuth callback
  │   ├─→ Check if user exists in Supabase
  │   ├─→ Create if new (role = 'student' by default)
  │   └─→ Generate JWT session
  │
  └─→ Redirected to /dashboard
     └─→ Session stored in cookie
```

### 2. Notes Fetching Flow
```
Browser
  │
  ├─→ GET /api/notes
  │   └─→ Backend verifies session
  │       ├─→ Not authenticated? → 403
  │       └─→ Query Supabase
  │           └─→ Fetch all notes
  │
  ├─→ Response: { notes: [...] }
  │
  └─→ Render notes list in UI
      └─→ User can preview or download
          └─→ Download → Google Drive direct URL
```

### 3. Admin Creates Note Flow
```
Admin
  │
  ├─→ Go to /admin/notes
  │
  ├─→ Upload note form
  │   ├─→ Title
  │   ├─→ Course
  │   └─→ Google Drive URL
  │
  ├─→ POST /api/notes (admin-only endpoint)
  │   ├─→ Verify session.user.role === 'admin'
  │   ├─→ Extract file_id from URL
  │   ├─→ Generate download_url
  │   └─→ Save to Supabase
  │
  └─→ Note appears in student's notes list
```

## Database Schema Overview

### Users Table
```typescript
{
  id: UUID (primary key),
  email: string (unique),
  name: string,
  role: 'student' | 'admin',
  created_at: timestamp
}
```

### Notes Table
```typescript
{
  id: UUID,
  title: string,
  course: string,
  file_id: string (Google Drive),
  drive_url: string (download URL),
  created_by: UUID (foreign key → users),
  created_at: timestamp
}
```

### Timetable Table
```typescript
{
  id: UUID,
  course: string,
  day: 'Monday' | 'Tuesday' | ... | 'Saturday',
  start_time: time,
  end_time: time,
  room: string,
  faculty: string
}
```

### Events Table
```typescript
{
  id: UUID,
  title: string,
  description: string,
  starts_at: timestamp,
  ends_at: timestamp,
  created_by: UUID (foreign key → users)
}
```

### Lost & Found Table
```typescript
{
  id: UUID,
  item_name: string,
  description: string,
  status: 'lost' | 'found' | 'claimed',
  contact: string (email/phone),
  created_at: timestamp
}
```

## API Endpoint Map

```
Authentication
  POST   /api/auth/signin          ← Google OAuth challenge
  POST   /api/auth/callback        ← OAuth callback
  GET    /api/auth/session         ← Get current session
  POST   /api/auth/signout         ← Sign out

Notes
  GET    /api/notes                → All notes
  POST   /api/notes                → Create (admin)
  GET    /api/notes/:id            → Single note
  GET    /api/notes/:id/download   → Download PDF

Timetable
  GET    /api/timetable            → All entries (or filtered by ?course=)
  POST   /api/timetable            → Create (admin)

Events
  GET    /api/events               → All events (or ?filter=upcoming)
  POST   /api/events               → Create (admin)

Lost & Found
  GET    /api/lostfound            → All items
  POST   /api/lostfound            → Report item (any user)

Chat
  POST   /api/chat                 → Send message to AI
```

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Serverless (Vercel)** | No server maintenance, auto-scaling, free tier |
| **Supabase** | Managed Postgres, built-in auth, RLS support |
| **NextAuth.js** | Industry standard, Google OAuth integration |
| **TailwindCSS** | Rapid UI development, responsive by default |
| **Google Drive** | No backend file storage needed, direct download links |
| **TypeScript** | Type safety, better IDE support, fewer bugs |
| **Mobile-first** | More users on mobile, better UX |

## Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    Public Resources                     │
│  ─ Sign in page (/auth/signin)                          │
│  ─ OAuth callback (/api/auth/callback)                  │
└─────────────────────────────────────────────────────────┘
                        ▼
            ┌───────────────────────┐
            │ Session Required      │
            │ (Any authenticated    │
            │ user can access)      │
            ├───────────────────────┤
            │ - Dashboard           │
            │ - Notes               │
            │ - Timetable           │
            │ - Events              │
            │ - Lost & Found        │
            └───────────────────────┘
                        ▼
         ┌──────────────────────────────┐
         │   Admin Role Required        │
         │  (role === 'admin')          │
         ├──────────────────────────────┤
         │ - /admin                     │
         │ - POST /api/notes            │
         │ - POST /api/timetable        │
         │ - POST /api/events           │
         │ - POST /api/lostfound (mgmt) │
         └──────────────────────────────┘
```

## Deployment Architecture

```
GitHub Repository
    ↓ (push)
Vercel (auto-deploy on push)
    ├─→ Build Next.js
    ├─→ Run tests/linting
    ├─→ Deploy to CDN
    └─→ Set environment variables
         ├─→ Supabase credentials
         ├─→ Google OAuth keys
         ├─→ LLM API keys
         └─→ NextAuth secret

Production URLs
    └─→ smart-campus-assistant.vercel.app (example)
```

---

For more details, see [Master_Prompt.md](Master_Prompt.md)
