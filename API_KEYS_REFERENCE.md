# 🔑 API Keys & Environment Variables Quick Reference

## Quick Summary

| Variable | Location | Required | Where to Set |
|----------|----------|----------|--------------|
| `VITE_SUPABASE_PROJECT_ID` | Frontend | ✅ Yes | `.env.local` / Vercel Dashboard |
| `VITE_SUPABASE_URL` | Frontend | ✅ Yes | `.env.local` / Vercel Dashboard |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | ✅ Yes | `.env.local` / Vercel Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | ✅ Yes | Supabase Edge Functions Secrets |
| `LOVABLE_API_KEY` | Edge Functions | ✅ Yes (for AI features) | Supabase Edge Functions Secrets |
| `TAVILY_API_KEY` | Edge Functions | ⚠️ Optional | Supabase Edge Functions Secrets |
| `REACT_APP_GOLD_API_KEY` | Frontend | ⚠️ Optional | `.env.local` / Vercel Dashboard |

---

## 📍 Where Each API Key is Used

### Frontend (React/Vite)

#### `VITE_SUPABASE_*` Variables
**Files:**
- `src/integrations/supabase/client.ts` - Main Supabase client initialization
- `src/pages/RoleAssignment.tsx` - Admin user creation
- `src/pages/UserManagement.tsx` - User management
- `src/services/competitorDataService.ts` - Edge Function calls
- `src/pages/GoldRatesAdmin.tsx` - Gold rate updates

---

### Edge Functions (Deno/Supabase)

#### `SUPABASE_URL` & `SUPABASE_ANON_KEY`
**Used in:** Most Edge Functions for read-only operations
- `marketpulse-dashboard`
- `marketpulse-analytics`
- `marketpulse-sync`
- `marketpulse-trends`
- `marketpulse-national-intel`

#### `SUPABASE_SERVICE_ROLE_KEY`
**Used in:** Admin operations & write operations
- `admin-create-user` - Creating new users
- `admin-delete-user` - Deleting users
- `marketpulse-gold-rates` - Updating gold rates
- `generate-sample-data` - Generating sample data
- `reset-sample-data` - Resetting data

**⚠️ CRITICAL:** This key has FULL database access - NEVER use in frontend!

#### `LOVABLE_API_KEY`
**Used in:** AI-powered features
- `generate-content-text` - Text generation for social media posts
- `generate-content-image` - Image generation for posts
- `analyze-competitor` - Competitor analysis & insights
- `market-search` - Market research
- `market-pulse-social` - Social media analytics

#### `TAVILY_API_KEY`
**Used in:** Web scraping for competitor analysis
- `analyze-competitor` - Web search and competitor data scraping

---

## 🔒 Security Levels

### 🟢 Public/Frontend Safe
These keys can be exposed in frontend code:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key)
- `VITE_SUPABASE_PROJECT_ID`

**Protection:** Row Level Security (RLS) policies in Supabase

---

### 🔴 Private/Server-Side ONLY
These keys must NEVER be in frontend:
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **CRITICAL**

**Protection:** Only stored in Supabase Edge Functions secrets

---

### 🟡 External API Keys
Treat as private, use in Edge Functions only:
- `LOVABLE_API_KEY`
- `TAVILY_API_KEY`
- `REACT_APP_GOLD_API_KEY`

---

## 📦 Setup Checklist for New Developers

### 1. Get Supabase Credentials
```bash
Project Dashboard → Settings → API
✅ Copy Project URL
✅ Copy Project API keys → anon/public
✅ Copy Project API keys → service_role (DO NOT COMMIT!)

Project Dashboard → Settings → General
✅ Copy Reference ID
```

### 2. Get AI Service Keys
```bash
Lovable (https://lovable.dev)
✅ Sign up
✅ Settings → API Keys → Create new key

Tavily (https://tavily.com) - Optional
✅ Sign up
✅ Get API key from dashboard
```

### 3. Configure Frontend
```bash
# Create .env.local file in project root
cp .env.example .env.local

# Edit .env.local and add:
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### 4. Configure Edge Functions
```bash
# Go to Supabase Dashboard → Edge Functions → Settings
# Add these secrets:

SUPABASE_URL=https://your_project_id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LOVABLE_API_KEY=your_lovable_key
TAVILY_API_KEY=your_tavily_key
```

### 5. Deploy Edge Functions
```bash
supabase login
supabase link --project-ref your_project_id

# Deploy all functions
supabase functions deploy admin-create-user
supabase functions deploy marketpulse-gold-rates
# ... (see SETUP_GUIDE.md for complete list)
```

### 6. Configure Vercel (for production)
```bash
# Go to Vercel Dashboard → Project → Settings → Environment Variables
# Add all VITE_* variables for Production, Preview, and Development
```

---

## 🎯 Quick Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing VITE_SUPABASE_URL" | Missing frontend env var | Add to `.env.local` |
| "Business not found" | Wrong Supabase project | Check `VITE_SUPABASE_PROJECT_ID` |
| "LOVABLE_API_KEY is not configured" | Missing Edge Function secret | Add to Supabase secrets |
| "Invalid role" | Migration not run | Run `update_user_roles_constraint.sql` |
| 404 on Vercel | Env vars not set | Add in Vercel Dashboard |

---

## 📞 Support Resources

- **Complete Setup Guide:** See `SETUP_GUIDE.md`
- **Deployment Guide:** See `DEPLOYMENT_GUIDE.md`
- **Environment Variables:** See `ENV_VARIABLES.md`
- **Roles & Permissions:** See `docs/ROLES_AND_PERMISSIONS.md`

---

## 🚨 Emergency: Leaked API Key?

If any private key is accidentally committed or exposed:

1. **Immediately rotate the key:**
   - Supabase: Settings → API → Reset service_role key
   - Lovable: Settings → API Keys → Revoke → Create new
   - Tavily: Dashboard → Regenerate key

2. **Update all deployments:**
   - Update Edge Function secrets in Supabase
   - Redeploy all Edge Functions
   - Update `.env.local` locally
   - Update Vercel environment variables

3. **Review commit history:**
   ```bash
   # Remove sensitive data from Git history (use with caution!)
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch .env.local" \
   --prune-empty --tag-name-filter cat -- --all
   ```

---

**Last Updated:** November 2024

