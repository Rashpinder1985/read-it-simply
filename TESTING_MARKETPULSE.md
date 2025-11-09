# Testing MarketPulse Integration

## Complete Workflow

### 1. Database Status ✅
- **15 competitors** created (10 national chains + 5 local Mumbai stores)
- **24 locations** across Mumbai, Pune, and Nagpur
- **15 metrics** entries with ratings, reviews, and market presence
- **3 gold rates** for the last 3 days

### 2. Fill Out Business Details Form

Go to: https://read-it-simply.lovable.app/business-details

Fill in the form with:

**Company Information:**
- Company Name: `Maharaja Jewellers` (or your choice)
- Headquarters Address: `Bandra West, Mumbai, Maharashtra`

**Branch 1:**
- City: `Mumbai`
- State: `Maharashtra`
- Address: `Shop 101, Bandra West, Mumbai`

**Primary Segments:**
- Category: `Jewellery`
- Subcategories: `Gold Jewellery`, `Diamond Jewellery`

**Social Media Links:** (optional)
- Instagram: `https://instagram.com/maharajajewellers`
- Facebook: `https://facebook.com/maharajajewellers`

Click **"Save Business Details"**

### 3. Access MarketPulse Dashboard

After saving, the system will:
1. Save your business details to `business_details` table
2. **Automatically sync** to `businesses` table for MarketPulse
3. Link your business to your user account

Then you can access MarketPulse features:
- Go to Dashboard and click "MarketPulse Agent"
- Or navigate directly to the MarketPulse modal

### 4. What MarketPulse Will Show

**Local Intelligence (Mumbai):**
- Tanishq (2 locations in Mumbai)
- Malabar Gold & Diamonds (2 locations)
- Kalyan Jewellers (2 locations)
- CaratLane (2 locations)
- Mumbai Gold Centre (local competitor)
- Rajesh Jewellers Mumbai (local competitor)
- And 9 more competitors...

**Regional Intelligence (Maharashtra):**
- Competitors in Pune, Nagpur
- State-wide market presence

**National Intelligence:**
- Market share analysis
- Expansion velocity
- Threat assessment
- Market gap analysis

**Current Trends:**
- Gold rates: ₹65,000/10g (24K)
- Market concentration
- Emerging players

### 5. If You Need More Competitors

You can use the **JustDial Sync** feature:
1. Open MarketPulse
2. Click "Sync Competitors"
3. It will scrape live data from JustDial for Mumbai jewellery stores
4. New competitors will be added to your database

### 6. Edge Functions Deployed

All MarketPulse Edge Functions are live:
- ✅ `marketpulse-dashboard` - Main dashboard data
- ✅ `marketpulse-analytics` - Detailed competitor analytics
- ✅ `marketpulse-national-intel` - National intelligence features
- ✅ `marketpulse-trends` - Emerging trends detection
- ✅ `marketpulse-sync` - JustDial scraping & sync

---

## Next Steps

1. **Fill out the Business Details form** as described above
2. **Save** the form (this will create your business entry)
3. **Open MarketPulse** from the dashboard
4. **View your competitive intelligence** based on Mumbai, Maharashtra

The system will automatically show you all competitors in your location with ratings, reviews, market presence, and strategic insights!

## Troubleshooting

**If MarketPulse shows "No competitors found":**
- Verify your business details were saved
- Check that City is exactly "Mumbai" and State is "Maharashtra"
- Check browser console for any errors

**If you want to add more data:**
- Use the CSV import to add more competitors
- Use the JustDial sync feature to scrape live data
- Manually add competitors via SQL

## Data Structure

Your business entry in `businesses` table will look like:
```
{
  business_name: "Maharaja Jewellers",
  hq_city: "Mumbai",
  hq_state: "Maharashtra",
  primary_category: "Jewellery",
  user_id: "<your-user-id>"
}
```

This is linked to 15 competitors in Mumbai/Maharashtra with full metrics!

