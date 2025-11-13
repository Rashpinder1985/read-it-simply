# 🚀 MarketPulse Setup Guide

Complete guide for setting up the MarketPulse application from scratch after cloning the repository.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Required API Keys & Credentials](#required-api-keys--credentials)
3. [Frontend Setup](#frontend-setup)
4. [Supabase Backend Setup](#supabase-backend-setup)
5. [Environment Variables Configuration](#environment-variables-configuration)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Software
- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase CLI** (optional, for local development)

### Required Accounts
- **Supabase Account** (free tier available): https://supabase.com
- **Vercel Account** (for deployment, optional): https://vercel.com
- **Lovable API Key** (for AI features): https://lovable.dev
- **Tavily API Key** (for competitor analysis): https://tavily.com

---

## 2. Required API Keys & Credentials

### 🔑 Supabase Credentials

You'll need these from your Supabase project:

| Variable | Where to Find | Usage |
|----------|---------------|-------|
| `VITE_SUPABASE_PROJECT_ID` | Project Settings → General → Reference ID | Frontend client |
| `VITE_SUPABASE_URL` | Project Settings → API → Project URL | Frontend client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API → Project API keys → `anon` `public` | Frontend client (public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → Project API keys → `service_role` | Edge Functions only (private!) |

**⚠️ SECURITY WARNING:**
- **NEVER** commit `SUPABASE_SERVICE_ROLE_KEY` to Git
- **ONLY** use `service_role` key in Edge Functions
- **ALWAYS** use `anon/public` key in frontend code

---

### 🤖 AI Service API Keys

#### Lovable API Key
**Required for:**
- Content generation (`generate-content-text`, `generate-content-image`)
- Competitor analysis (`analyze-competitor`)
- Market search (`market-search`)
- Social media insights (`market-pulse-social`)

**How to get:**
1. Sign up at https://lovable.dev
2. Go to Settings → API Keys
3. Create a new API key
4. Copy the key

**Environment Variable:**
```bash
LOVABLE_API_KEY=your_lovable_api_key_here
```

**Used in Edge Functions:**
- `supabase/functions/generate-content-text/index.ts`
- `supabase/functions/generate-content-image/index.ts`
- `supabase/functions/analyze-competitor/index.ts`
- `supabase/functions/market-search/index.ts`
- `supabase/functions/market-pulse-social/index.ts`

---

#### Tavily API Key
**Required for:**
- Competitor analysis web scraping

**How to get:**
1. Sign up at https://tavily.com
2. Get API key from dashboard

**Environment Variable:**
```bash
TAVILY_API_KEY=your_tavily_api_key_here
```

**Used in Edge Functions:**
- `supabase/functions/analyze-competitor/index.ts`

---

### 💰 Gold Rate API (Optional)

**Note:** Currently uses IBJA (India Bullion and Jewellers Association) rates.

**If you need a paid API:**
```bash
REACT_APP_GOLD_API_KEY=your_gold_api_key_here
```

**Used in:**
- `src/services/realTimeDataService.ts` (currently commented out)

---

## 3. Frontend Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Rashpinder1985/read-it-simply.git
cd read-it-simply
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Create Environment File
Create a `.env.local` file in the root directory:

```bash
# Frontend Environment Variables
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key
```

**Example:**
```bash
VITE_SUPABASE_PROJECT_ID=chzpetqsqhunditgohzx
VITE_SUPABASE_URL=https://chzpetqsqhunditgohzx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoenBldHFzcWh1bmRpdGdvaHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzY3NTUsImV4cCI6MjA3ODI1Mjc1NX0.us0LR7XcWj2U9bSyPlb3Aeo2vyGuk-SDnSREBMXbFbg
```

### Step 4: Run Development Server
```bash
npm run dev
# or
yarn dev
```

Your app should now be running at `http://localhost:5173`

---

## 4. Supabase Backend Setup

### Step 1: Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details
4. Wait for project to be created (~2 minutes)

### Step 2: Run Database Migrations
All migration files are in `supabase/migrations/`

**Option A: Using Supabase Dashboard (Recommended for beginners)**
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste each migration file content
3. Run them in order (sorted by filename timestamp)

**Option B: Using Supabase CLI**
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your_project_id

# Run all migrations
supabase db push
```

### Step 3: Deploy Edge Functions

All Edge Functions need these environment variables set in Supabase:

1. Go to **Supabase Dashboard → Edge Functions → Settings**
2. Add the following secrets:

```bash
SUPABASE_URL=https://your_project_id.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LOVABLE_API_KEY=your_lovable_api_key
TAVILY_API_KEY=your_tavily_api_key
```

**Deploy each function:**

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your_project_id

# Deploy all functions
supabase functions deploy admin-create-user
supabase functions deploy admin-delete-user
supabase functions deploy analyze-competitor
supabase functions deploy generate-content-image
supabase functions deploy generate-content-text
supabase functions deploy generate-sample-data
supabase functions deploy market-pulse-social
supabase functions deploy market-search
supabase functions deploy marketpulse-analytics
supabase functions deploy marketpulse-dashboard
supabase functions deploy marketpulse-gold-rates
supabase functions deploy marketpulse-national-intel
supabase functions deploy marketpulse-personas
supabase functions deploy marketpulse-sync
supabase functions deploy marketpulse-trends
supabase functions deploy reset-sample-data
```

### Step 4: Configure Authentication

1. Go to **Authentication → URL Configuration**
2. Add these redirect URLs:

```
http://localhost:5173
http://localhost:5173/**
https://your-app.vercel.app
https://your-app.vercel.app/**
```

3. Set Site URL to: `https://your-app.vercel.app` (or your production URL)

---

## 5. Environment Variables Configuration

### Frontend Environment Variables

#### Development (`.env.local`)
```bash
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

#### Production (Vercel Dashboard)
1. Go to Vercel Project → Settings → Environment Variables
2. Add the same variables as above
3. Set them for **Production**, **Preview**, and **Development** environments

---

### Edge Functions Environment Variables

These are set in **Supabase Dashboard → Edge Functions → Settings**:

```bash
# Supabase Connection (Auto-injected by Supabase, but can be overridden)
SUPABASE_URL=https://your_project_id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
LOVABLE_API_KEY=your_lovable_api_key
TAVILY_API_KEY=your_tavily_api_key

# Optional
REACT_APP_GOLD_API_KEY=your_gold_api_key
```

---

## 6. Deployment

### Deploying Frontend to Vercel

#### Option 1: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variables (from Section 5)
6. Click "Deploy"

#### Option 2: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Deploying Edge Functions

Already covered in Section 4, Step 3.

---

## 7. Troubleshooting

### Common Issues

#### ❌ "Missing VITE_SUPABASE_URL environment variable"
**Solution:** Make sure `.env.local` file exists and contains all required variables.

#### ❌ "Business not found" or 404 errors
**Solution:** 
1. Check that frontend environment variables point to correct Supabase project
2. Verify Edge Functions are deployed and active
3. Check Supabase URL in browser console

#### ❌ "Invalid role" error when assigning roles
**Solution:** 
1. Run the migration: `20251108_update_user_roles_constraint.sql`
2. Redeploy `admin-create-user` Edge Function

#### ❌ Content generation fails with "LOVABLE_API_KEY is not configured"
**Solution:** Add `LOVABLE_API_KEY` to Supabase Edge Functions secrets.

#### ❌ 404 on deployed Vercel site
**Solution:** 
1. Ensure `vercel.json` exists in root directory
2. Verify it contains the SPA routing configuration
3. Redeploy

---

## 8. Files That Use API Keys/Environment Variables

### Frontend Files

| File | Variables Used |
|------|----------------|
| `src/integrations/supabase/client.ts` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `src/pages/RoleAssignment.tsx` | `VITE_SUPABASE_URL` |
| `src/pages/UserManagement.tsx` | `VITE_SUPABASE_URL` |
| `src/services/competitorDataService.ts` | `VITE_SUPABASE_URL` |
| `src/pages/GoldRatesAdmin.tsx` | Uses `supabase.supabaseUrl` |
| `src/services/realTimeDataService.ts` | `REACT_APP_GOLD_API_KEY` (optional) |

### Edge Functions

| Function | Variables Used |
|----------|----------------|
| `admin-create-user` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `admin-delete-user` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `analyze-competitor` | `TAVILY_API_KEY`, `LOVABLE_API_KEY` |
| `generate-content-image` | `LOVABLE_API_KEY` |
| `generate-content-text` | `LOVABLE_API_KEY` |
| `generate-sample-data` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `market-pulse-social` | `LOVABLE_API_KEY` |
| `market-search` | `LOVABLE_API_KEY` |
| `marketpulse-analytics` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `marketpulse-dashboard` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `marketpulse-gold-rates` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `marketpulse-national-intel` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `marketpulse-sync` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `marketpulse-trends` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `reset-sample-data` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |

---

## 9. Security Best Practices

### ✅ DO's
- ✅ Use `.env.local` for local development
- ✅ Add `.env.local` to `.gitignore` (already done)
- ✅ Use environment variables in hosting platforms (Vercel, Netlify)
- ✅ Use `SUPABASE_PUBLISHABLE_KEY` (anon key) in frontend
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` only in Edge Functions
- ✅ Rotate API keys periodically

### ❌ DON'Ts
- ❌ Never commit API keys to Git
- ❌ Never use `SERVICE_ROLE_KEY` in frontend
- ❌ Never hardcode credentials in source code
- ❌ Never share `.env.local` file publicly
- ❌ Never commit `.env` files to version control

---

## 10. Quick Start Checklist

- [ ] Clone repository
- [ ] Install Node.js and npm
- [ ] Run `npm install`
- [ ] Create Supabase project
- [ ] Get Supabase credentials (URL, Project ID, Anon Key, Service Role Key)
- [ ] Get Lovable API key
- [ ] Get Tavily API key (if using competitor analysis)
- [ ] Create `.env.local` file with frontend variables
- [ ] Run `npm run dev` to test locally
- [ ] Run all database migrations in Supabase
- [ ] Add Edge Function secrets in Supabase Dashboard
- [ ] Deploy all Edge Functions
- [ ] Configure authentication redirect URLs
- [ ] Deploy frontend to Vercel
- [ ] Add environment variables in Vercel Dashboard
- [ ] Test production deployment

---

## 11. Support

If you encounter issues:
1. Check Supabase Dashboard → Logs for Edge Function errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure all migrations have been run
5. Check that Edge Functions are deployed and active

---

## 📝 Notes

- The current production Supabase project ID is: `chzpetqsqhunditgohzx`
- Frontend is deployed on Vercel: https://read-it-simply-ec60b03f.vercel.app
- GitHub repository: https://github.com/Rashpinder1985/read-it-simply

---

**Last Updated:** November 2024
**Version:** 1.0.0

