# Development Quick Start

Follow these steps to get the project running locally.

## 1. Prerequisites

- Node.js 18+ (`node --version`)
- npm or yarn
- A terminal/command line

## 2. Initial Setup

```bash
# 1. Navigate to project
cd /home/mfscpayload-690/Desktop/Project

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local
```

## 3. Configure Environment Variables

Edit `.env.local` with your credentials:

```bash
# Using VS Code or your editor
code .env.local
```

### Required Values

**Supabase** (from Supabase Dashboard):
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Google OAuth** (from Google Cloud Console):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**NextAuth** (generate your own):
```bash
openssl rand -base64 32  # Copy output to NEXTAUTH_SECRET
```

**LLM Provider** (choose one):
- OpenAI: `OPENAI_API_KEY`
- Groq: `GROQ_API_KEY` (free tier available)
- Mistral: `MISTRAL_API_KEY`

## 4. Database Setup

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Open your project
3. Go to SQL Editor
4. Create new query
5. Copy & paste contents of `docs/schema.sql`
6. Click Run

## 5. Run Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

## 6. First Time User Flow

1. Click "Sign in with Google"
2. You'll be added as a **student** by default
3. To become **admin**:
   - Go to Supabase Dashboard
   - Navigate to `tables > users`
   - Find your email
   - Change `role` from `student` to `admin`
   - Save

## Common Commands

```bash
# Check for TypeScript errors
npm run type-check

# Run ESLint
npm run lint

# Format code with Prettier
# (auto on save if VS Code extension installed)

# Build for production
npm run build

# Start production build locally
npm run start
```

## Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001  # Use port 3001 instead
```

### TypeScript errors
```bash
npm run type-check  # See detailed errors
```

### Need to reset local data
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Google OAuth not working
- Ensure `NEXTAUTH_URL=http://localhost:3000`
- Check Google Cloud Console has `localhost:3000` in Authorized JavaScript origins
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

### Database connection failing
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check Supabase project is active
- Ensure tables exist (run `docs/schema.sql`)

## VS Code Recommended Extensions

```
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- GitLens
- Thunder Client (or Postman for API testing)
```

## Testing the API

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Create new request:
   - Method: `GET`
   - URL: `http://localhost:3000/api/notes`
   - Should return: `{ "success": true, "notes": [] }`

### Using curl
```bash
curl http://localhost:3000/api/notes
# Should fail with 401 because you're not authenticated in the API
# Use the web UI to test instead
```

## Next Steps

1. ✅ Project running locally
2. 📝 Add sample notes via admin panel
3. 📅 Add timetable entries
4. 🎯 Create events
5. 💬 Test chatbot

See [README.md](../README.md) for full documentation.

---

**Stuck?** Check `docs/Master_Prompt.md` for architecture details or ask in project chat.
