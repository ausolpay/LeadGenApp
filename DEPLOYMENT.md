# LumaLead.io Deployment Guide

## 1. Stripe Configuration for Production

### Required Stripe Products/Prices
Create these in your Stripe Dashboard:

```bash
# Monthly Plans (with 14-day trial)
Monthly AUD: price_xxxxx (AU$12.99/month)
Monthly USD: price_xxxxx (US$8.99/month)

# Yearly Plans  
Yearly AUD: price_xxxxx (AU$124.99/year)
Yearly USD: price_xxxxx (US$89.99/year)

# Lifetime Plans
Lifetime AUD: price_xxxxx (AU$299 one-time)
Lifetime USD: price_xxxxx (US$199 one-time)
```

### Important Stripe Settings:
1. **Monthly/Yearly products**: Must be **recurring** with trial support
2. **Lifetime products**: Must be **one-time payment**
3. **Trial Period**: Set directly in code (already done ✅)

## 2. Environment Variables for Vercel

### Required Environment Variables:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_... (LIVE key for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (LIVE key for production)
STRIPE_WEBHOOK_SECRET=whsec_... (Production webhook secret)

# Stripe Price IDs (Production)
STRIPE_PRICE_MONTHLY_AUD=price_xxxxx
STRIPE_PRICE_MONTHLY_USD=price_xxxxx  
STRIPE_PRICE_YEARLY_AUD=price_xxxxx
STRIPE_PRICE_YEARLY_USD=price_xxxxx
STRIPE_PRICE_LIFETIME_AUD=price_xxxxx
STRIPE_PRICE_LIFETIME_USD=price_xxxxx

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# App Settings
NEXT_PUBLIC_SITE_URL=https://lumalead.io
```

## 3. Production Stripe Webhook

### Webhook Endpoint:
```
https://lumalead.io/api/stripe/webhook
```

### Required Events:
- `customer.subscription.created`
- `customer.subscription.updated` 
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `checkout.session.completed`

## 4. GitHub Repository Setup

### .gitignore additions:
```
# Local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

### Package.json scripts (verify these exist):
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev",
    "lint": "next lint"
  }
}
```

## 5. Vercel Deployment Steps

1. **Connect GitHub repository** to Vercel
2. **Set Environment Variables** in Vercel dashboard
3. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Custom Domain Setup**:
   - Add `lumalead.io` domain in Vercel
   - Configure DNS records
   - Enable SSL (automatic)

## 6. Domain DNS Configuration

### Required DNS Records:
```
Type: A
Name: @
Value: 76.76.19.61 (Vercel IP)

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## 7. Post-Deployment Checklist

### Test These Features:
- [ ] Landing page loads correctly
- [ ] Authentication flow works
- [ ] Google Maps integration
- [ ] Business search functionality
- [ ] 14-day trial signup (Monthly)
- [ ] Yearly plan purchase
- [ ] Lifetime plan purchase
- [ ] Stripe webhook receives events
- [ ] Contact management
- [ ] Export functionality
- [ ] Mobile responsiveness

### Security Verification:
- [ ] Environment variables secured
- [ ] Google Maps API key restricted
- [ ] Stripe webhook signed verification
- [ ] Supabase RLS policies active
- [ ] HTTPS enforced

## 8. Monitoring Setup

### Essential Monitoring:
- **Vercel Analytics**: Automatic
- **Stripe Dashboard**: Monitor payments/trials
- **Supabase Dashboard**: Database usage
- **Google Cloud Console**: Maps API usage

## 9. Backup Strategy

### Database Backups:
- Supabase automatic backups (7 days retention)
- Weekly manual exports for critical data

### Code Backups:
- GitHub repository (primary)
- Local development backups

## 10. Troubleshooting Common Issues

### Build Failures:
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Ensure TypeScript errors resolved

### Stripe Webhook Issues:
- Verify webhook URL is accessible
- Check webhook secret matches
- Confirm event types are selected

### Authentication Issues:
- Verify Supabase URL/keys
- Check redirect URLs configured
- Confirm RLS policies

## Ready for Launch! 🚀

Your LumaLead.io platform has:
✅ **Complete trial system**
✅ **Professional landing page** 
✅ **Stripe integration**
✅ **Google Maps integration**
✅ **Contact management**
✅ **Export functionality**
✅ **Mobile responsive design**
✅ **Modern UI/UX**

Deploy with confidence! 🌟
