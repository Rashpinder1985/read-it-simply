# Business Details Form - User Flow Documentation

## 📍 Where is the Business Details Form?

### File Location
**Path:** `/src/pages/BusinessDetails.tsx`

**Route:** `/business-details`

Defined in: `/src/App.tsx` (line 24)

```typescript
<Route path="/business-details" element={<BusinessDetails />} />
```

---

## 🔄 User Flow

### 1. **Sign Up / Sign In**
**File:** `/src/pages/Auth.tsx`

**Sign Up Form:**
- User enters:
  - Full Name
  - Business Name (stored in auth metadata)
  - Email
  - Password

**On successful sign up/sign in:**
- Redirects to `/` (line 69 & 100 in Auth.tsx)
- The `/` route loads `Dashboard` component

### 2. **Landing on Dashboard**
**File:** `/src/pages/Dashboard.tsx`

**What user sees:**
- Main dashboard with management buttons in top right
- "Business Details" button (line 175-181)

```typescript
<Button 
  onClick={() => navigate("/business-details")}
  variant="outline"
>
  Business Details
</Button>
```

### 3. **Clicking "Business Details" Button**
**Navigates to:** `/business-details`

**Loads:** `BusinessDetails.tsx` component

---

## 📝 Business Details Form Fields

### Company Information
- **Company Name** (required)
- **Headquarters Address** (optional)

### Branches (Dynamic - can add multiple)
For each branch:
- **City** (required for MarketPulse)
- **State** (required for MarketPulse)
- **Address** (full address)

### Primary Segments (Dynamic - can add multiple)
For each segment:
- **Category** (e.g., "Jewellery")
- **Subcategories** (array, e.g., ["Gold", "Diamond"])

### Social Media Links (Optional)
- Facebook
- Instagram
- Twitter/X
- LinkedIn
- YouTube

### Business Media (Optional)
- Upload images/videos for content generation

---

## 💾 What Happens When User Saves?

**File:** `/src/pages/BusinessDetails.tsx` (lines 154-211)

### Two Tables Get Updated:

#### 1. `business_details` table
Stores the full form data:
```typescript
{
  user_id: user.id,
  company_name: companyName,
  hq_address: hqAddress,
  branches: [...],
  primary_segments: [...],
  social_media_links: {...}
}
```

#### 2. `businesses` table (for MarketPulse)
Stores simplified data for competitor matching:
```typescript
{
  user_id: user.id,
  business_name: companyName,
  hq_city: branches[0]?.city,      // From first branch
  hq_state: branches[0]?.state,    // From first branch
  primary_category: segments[0]?.category,
  target_segment: segments[0]?.subcategories?.join(", ")
}
```

**Key Logic (line 181-183):**
```typescript
const hqCity = branches[0]?.city || "";
const hqState = branches[0]?.state || "";
```

This extracts city/state from the **first branch** for MarketPulse to use.

---

## 🎯 How MarketPulse Uses This Data

### MarketPulse Components Query Business Data:

**Files:**
- `/src/components/MarketPulseModal.tsx`
- `/src/components/EnhancedMarketPulseModal.tsx`

**Query (line 24-28):**
```typescript
const { data: businessDetails } = useQuery({
  queryKey: ['business-details'],
  queryFn: async () => {
    const { data } = await supabase
      .from("business_details")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    return data;
  }
});
```

**Extract Location (line 40-41):**
```typescript
const userCity = (businessDetails?.branches as any[])?.[0]?.city;
const userState = (businessDetails?.branches as any[])?.[0]?.state;
```

**Then calls Edge Function:**
```typescript
competitorDataService.getCompetitorsByScope(
  selectedScope,
  userCity,    // "Mumbai"
  userState    // "Maharashtra"
);
```

---

## ⚠️ Current Flow Issue

### No Automatic Redirect for First-Time Users

**Current behavior:**
1. User signs up
2. Redirected to Dashboard
3. User must **manually** click "Business Details" button
4. No prompt or requirement to fill it out

### Recommendation: Add First-Time User Flow

**Option A: Auto-redirect on first login**
```typescript
// In Dashboard.tsx useEffect
useEffect(() => {
  const checkBusinessDetails = async () => {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (!data) {
      // First time user - redirect to business details
      navigate("/business-details");
    }
  };
  checkBusinessDetails();
}, [user]);
```

**Option B: Show modal/prompt**
Display a welcome modal asking user to complete their business profile.

**Option C: Show banner**
Display a persistent banner at top of dashboard until business details are filled.

---

## 🔑 Key Points for Testing

### For MarketPulse to Work:

1. ✅ User must be logged in
2. ✅ User must fill **Business Details** form
3. ✅ Must fill at least **Branch 1** with:
   - City: `Mumbai` (exact match)
   - State: `Maharashtra` (exact match)
4. ✅ Click "Save Business Details"

### Data Flow:
```
User fills form
  ↓
BusinessDetails.tsx saves to both tables
  ↓
MarketPulse queries business_details
  ↓
Extracts city/state from first branch
  ↓
Calls Edge Function with location
  ↓
Edge Function queries businesses table
  ↓
Matches competitors by city/state
  ↓
Returns competitor data to frontend
```

---

## 🐛 Troubleshooting

### MarketPulse shows "No competitors found"

**Check:**
1. Is user logged in? (check top right corner for email)
2. Did user save Business Details? (navigate to /business-details)
3. Is Branch 1 filled with City and State?
4. Are City/State exact matches? ("Mumbai", "Maharashtra")
5. Check console for: "Found business: {...}"

### Business Details not saving

**Check console for:**
- "Successfully saved to businesses table for MarketPulse" ✅
- "Business sync failed: ..." ❌

If sync failed, check:
1. User is authenticated
2. Database has UNIQUE constraint on businesses.user_id
3. RLS policies allow insert for authenticated users

---

## 📊 Summary

**Current Flow:**
```
Sign Up/In → Dashboard → Click "Business Details" → Fill Form → Save → MarketPulse Works
```

**Recommended Flow:**
```
Sign Up → Auto-redirect to Business Details → Fill Form → Save → Dashboard → MarketPulse Works
```

The form exists and works correctly. It just needs better discovery/prompting for first-time users.





