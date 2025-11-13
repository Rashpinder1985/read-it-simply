# MarketPulse Deployment Guide

This guide will help you deploy MarketPulse to various platforms (Vercel, Netlify, Railway, etc.)

## 📋 Prerequisites

1. ✅ GitHub repository with your code
2. ✅ External Supabase project (`chzpetqsqhunditgohzx`)
3. ✅ Node.js 18+ installed locally (for testing)

---

## 🚀 Quick Deploy

### Option 1: Vercel (Recommended - Fastest)

#### **Via GitHub:**
1. Go to [vercel.com](https://vercel.com)
2. Click **"Import Project"**
3. Select your GitHub repository: `Rashpinder1985/read-it-simply`
4. **Framework Preset**: Vite
5. **Root Directory**: `./` (default)
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`

#### **Environment Variables (Required):**
Add these in Vercel → Project Settings → Environment Variables:

```env
VITE_SUPABASE_PROJECT_ID=chzpetqsqhunditgohzx
VITE_SUPABASE_URL=https://chzpetqsqhunditgohzx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoenBldHFzcWh1bmRpdGdvaHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzY3NTUsImV4cCI6MjA3ODI1Mjc1NX0.us0LR7XcWj2U9bSyPlb3Aeo2vyGuk-SDnSREBMXbFbg
```

8. Click **"Deploy"**
9. Wait 2-3 minutes ☕
10. Done! 🎉

---

### Option 2: Netlify

#### **Via GitHub:**
1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub
4. Select repository: `Rashpinder1985/read-it-simply`
5. **Build Command**: `npm run build`
6. **Publish Directory**: `dist`

#### **Environment Variables:**
Go to Site Settings → Environment Variables → Add:

```env
VITE_SUPABASE_PROJECT_ID=chzpetqsqhunditgohzx
VITE_SUPABASE_URL=https://chzpetqsqhunditgohzx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoenBldHFzcWh1bmRpdGdvaHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzY3NTUsImV4cCI6MjA3ODI1Mjc1NX0.us0LR7XcWj2U9bSyPlb3Aeo2vyGuk-SDnSREBMXbFbg
```

7. Click **"Deploy"**
8. Done! 🎉

---

### Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `Rashpinder1985/read-it-simply`
4. Railway will auto-detect Vite
5. Add environment variables in **Variables** tab
6. Deploy!

---

### Option 4: Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click **"Create a project"** → **"Connect to Git"**
3. Select your repository
4. **Build command**: `npm run build`
5. **Build output directory**: `dist`
6. Add environment variables
7. Deploy!

---

## 🔧 Local Development

### 1. Clone Repository
```bash
cd /Users/rashpinderkaur/Desktop
git clone https://github.com/Rashpinder1985/read-it-simply.git marketpulse-production
cd marketpulse-production
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env
```

The `.env` file already has the correct values for the external Supabase project.

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:8080

### 5. Build for Production
```bash
npm run build
```

This creates optimized files in the `dist/` folder.

### 6. Preview Production Build
```bash
npm run preview
```

---

## ✅ Verify Deployment

After deploying, verify everything works:

### 1. Check Environment Variables
Open browser console (F12) and run:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
// Should output: https://chzpetqsqhunditgohzx.supabase.co
```

### 2. Test Features
- ✅ Login with: `rashpinder.kaur2025@gmail.com`
- ✅ Dashboard loads with data
- ✅ View 595 competitors
- ✅ See 8 personas
- ✅ Content approval works
- ✅ Role assignment accessible (admin only)

### 3. Check Network Requests
- Open DevTools → Network tab
- Look for API calls
- All should go to `chzpetqsqhunditgohzx.supabase.co` ✅
- None should go to `tonqbucmhlzqzznjipoy.supabase.co` ❌

---

## 📦 What's Included

### Frontend (React + Vite)
- ✅ Modern React 18 with TypeScript
- ✅ Vite for fast builds
- ✅ Tailwind CSS + shadcn/ui components
- ✅ React Router for navigation
- ✅ TanStack Query for data fetching
- ✅ Supabase client integration

### Features
- ✅ Dashboard with market intelligence
- ✅ Competitor tracking (595 competitors)
- ✅ AI-powered persona system (8 personas)
- ✅ Content generation & approval
- ✅ Role-based access control (RBAC)
- ✅ Gold rates tracking (IBJA integration)
- ✅ Analytics & insights

### Backend (Supabase)
- ✅ PostgreSQL database
- ✅ 8 Edge Functions deployed
- ✅ Row Level Security (RLS)
- ✅ Authentication
- ✅ Real-time subscriptions
- ✅ Storage for media

---

## 🔑 Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_PROJECT_ID` | `chzpetqsqhunditgohzx` | External Supabase project ID |
| `VITE_SUPABASE_URL` | `https://chzpetqsqhunditgohzx.supabase.co` | Supabase API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJI...` | Public/anon key for client-side access |

**⚠️ CRITICAL:** Always use `chzpetqsqhunditgohzx` (external project with all data), NOT `tonqbucmhlzqzznjipoy` (empty Lovable project).

---

## 🗄️ Database Status

Your external Supabase project (`chzpetqsqhunditgohzx`) contains:

| Resource | Count | Status |
|----------|-------|--------|
| Competitors | 595 | ✅ |
| Locations | 575 | ✅ |
| Metrics | 523 | ✅ |
| Personas | 8 | ✅ |
| Content Items | 5 | ✅ |
| Users with Roles | 6 | ✅ |
| Edge Functions | 8 | ✅ Deployed |

---

## 🛠️ Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Rebuild after changing environment variables
- Clear browser cache (Ctrl+Shift+R)

### "Business not found" Error
- Check that `VITE_SUPABASE_URL` points to `chzpetqsqhunditgohzx`
- Verify in Network tab that API calls go to correct project
- Clear localStorage and re-login

### 404 Errors on Routes
- Ensure rewrites are configured (see `vercel.json` or `netlify.toml`)
- All routes should redirect to `/index.html` for SPA

---

## 📞 Support

- **Documentation**: `/docs/ROLES_AND_PERMISSIONS.md`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/chzpetqsqhunditgohzx
- **GitHub Repo**: https://github.com/Rashpinder1985/read-it-simply

---

## 🎯 Next Steps After Deployment

1. ✅ Verify deployment works
2. ✅ Login as admin
3. ✅ Create users via User Management (`/role-assignment`)
4. ✅ Test all features
5. ✅ Share with team members
6. ✅ Monitor in Supabase dashboard

---

## 🚀 Recommended: Vercel Deployment

**Why Vercel:**
- ✅ Fastest deployment (2-3 minutes)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments for PRs
- ✅ Easy environment variable management
- ✅ Excellent performance
- ✅ Free tier available

**Deploy Now:**
1. Push code to GitHub (already done ✅)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import `Rashpinder1985/read-it-simply`
4. Add 3 environment variables
5. Click Deploy
6. Done in 2 minutes! 🎉

---

## 📋 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Platform account created (Vercel/Netlify/etc.)
- [ ] Repository imported
- [ ] 3 environment variables added
- [ ] Build command set: `npm run build`
- [ ] Output directory set: `dist`
- [ ] Deployment triggered
- [ ] Site loads successfully
- [ ] Environment variables verified in console
- [ ] Login works
- [ ] Dashboard shows data (595 competitors, 8 personas)
- [ ] Custom domain configured (optional)
- [ ] Team members can access

---

**🎊 Your app is ready to deploy! Choose a platform and follow the steps above.**



