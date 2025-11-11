# Environment Variables Configuration

## 🔑 Required Environment Variables

Add these to your deployment platform (Vercel, Netlify, etc.):

```env
VITE_SUPABASE_PROJECT_ID=chzpetqsqhunditgohzx

VITE_SUPABASE_URL=https://chzpetqsqhunditgohzx.supabase.co

VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoenBldHFzcWh1bmRpdGdvaHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzY3NTUsImV4cCI6MjA3ODI1Mjc1NX0.us0LR7XcWj2U9bSyPlb3Aeo2vyGuk-SDnSREBMXbFbg
```

## ⚠️ CRITICAL

**ALWAYS use `chzpetqsqhunditgohzx` (external project with all your data)**

**NEVER use `tonqbucmhlzqzznjipoy` (old Lovable project - empty)**

## 📊 What's in the Database

The external Supabase project (`chzpetqsqhunditgohzx`) contains:

- ✅ **595 competitors** - All competitor data
- ✅ **575 locations** - City/state data for dropdowns
- ✅ **523 metrics** - Ratings, reviews, market presence
- ✅ **8 personas** - AI-generated customer personas
- ✅ **5 content items** - Sample generated content
- ✅ **6 users** - With assigned roles (admin, marketing, content, assets)
- ✅ **8 Edge Functions** - All backend functions deployed

## 🎯 Users Created

| Email | Role | Password |
|-------|------|----------|
| rashpinder.kaur2025@gmail.com | Admin | (your password) |
| yogesh@digitaldogscorp.com | Admin | Welcome@123 |
| ambarish@digitaldogscorp.com | Admin | Welcome@123 |
| yogesh@digitaldogscorp.in | Marketing | Welcome@123 |
| ambarish@digitaldogscorp.in | Content | Welcome@123 |
| goldy13guri@gmail.com | Assets | Welcome@123 |

## 🔧 For Local Development

Create a `.env` file in the project root:

```bash
# Copy these exact values
VITE_SUPABASE_PROJECT_ID=chzpetqsqhunditgohzx
VITE_SUPABASE_URL=https://chzpetqsqhunditgohzx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoenBldHFzcWh1bmRpdGdvaHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzY3NTUsImV4cCI6MjA3ODI1Mjc1NX0.us0LR7XcWj2U9bSyPlb3Aeo2vyGuk-SDnSREBMXbFbg
```

Then run:
```bash
npm install
npm run dev
```

## ✅ Verification

After deployment, open browser console (F12) and run:

```javascript
console.log('Project:', import.meta.env.VITE_SUPABASE_PROJECT_ID);
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
```

Should output:
```
Project: chzpetqsqhunditgohzx
URL: https://chzpetqsqhunditgohzx.supabase.co
```

If you see `tonqbucmhlzqzznjipoy` - **STOP** and update your environment variables!

