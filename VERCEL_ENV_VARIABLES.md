# Vercel Environment Variables Setup

## Copy these from your .env.local file to Vercel Dashboard

### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Google Maps (Required)
```
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_DEFAULT_REGION=Cairns, QLD
```

### Stripe (Switch to LIVE keys for production)
```
# Use LIVE keys (sk_live_... and pk_live_...) for production
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (create production webhook first)

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRICE_MONTHLY_AUD=price_...
STRIPE_PRICE_MONTHLY_USD=price_...
STRIPE_PRICE_YEARLY_AUD=price_...
STRIPE_PRICE_YEARLY_USD=price_...
STRIPE_PRICE_LIFETIME_AUD=price_...
STRIPE_PRICE_LIFETIME_USD=price_...

# Client-side pricing (required for pricing page)
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_AUD=price_...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_USD=price_...
NEXT_PUBLIC_STRIPE_PRICE_YEARLY_AUD=price_...
NEXT_PUBLIC_STRIPE_PRICE_YEARLY_USD=price_...
NEXT_PUBLIC_STRIPE_PRICE_LIFETIME_AUD=price_...
NEXT_PUBLIC_STRIPE_PRICE_LIFETIME_USD=price_...
```

### App Configuration
```
NEXT_PUBLIC_SITE_URL=https://lumalead.io
```

## Important Notes:

### 🔒 Security Best Practices:
1. **Never commit .env.local** to Git (already protected by .gitignore)
2. **Use LIVE Stripe keys** for production (not test keys)
3. **Create production webhook** in Stripe for live environment
4. **Restrict Google Maps API key** to your domain

### 🚀 Deployment Process:
1. **Development**: Uses .env.local (stays on your machine)
2. **Production**: Uses Vercel environment variables (secure)
3. **No secrets in code** - all sensitive data in environment variables

### 📝 Steps to Add in Vercel:
1. Go to Project Settings → Environment Variables
2. Add each variable one by one
3. Set Environment: Production, Preview, Development (all)
4. Click "Save"

### ⚠️ Important for Production:
- Switch from Stripe TEST keys to LIVE keys
- Create production webhook in Stripe Dashboard
- Update webhook URL to: https://lumalead.io/api/stripe/webhook
- Restrict Google Maps API key to your domain
