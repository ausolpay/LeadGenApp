# Vercel Deployment Troubleshooting

## Common Deployment Failures & Solutions

### 1. Environment Variables Missing
**Error**: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solution**: Add environment variables in Vercel Dashboard

Required variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
GOOGLE_MAPS_API_KEY=your-api-key
NEXT_PUBLIC_SITE_URL=https://your-vercel-url.vercel.app
```

### 2. Stripe Configuration Issues
**Error**: "STRIPE_SECRET_KEY is not defined"
**Solution**: Add test Stripe keys for now

```
STRIPE_SECRET_KEY=sk_test_... (your test key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (your test key)
STRIPE_WEBHOOK_SECRET=whsec_... (optional for initial deploy)
STRIPE_PRICE_MONTHLY_AUD=price_test_... (optional for initial deploy)
```

### 3. Build Time Issues
**Error**: "Build exceeded maximum duration"
**Solution**: Optimize build settings

In `next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons']
  }
}

module.exports = nextConfig
```

### 4. Edge Runtime Issues
**Error**: "process is not defined" or Edge Runtime errors
**Solution**: Ensure API routes use Node.js runtime

Add to API route files:
```js
export const runtime = 'nodejs'
```

### 5. Import Path Issues
**Error**: "Module not found" or import errors
**Solution**: Check all import paths are correct

Common fixes:
- Use relative imports for local files
- Check case sensitivity in file names
- Verify all dependencies are in package.json

## Quick Deploy Test

### Minimal Environment Variables (for testing):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_MAPS_API_KEY=your-google-maps-key
NEXT_PUBLIC_SITE_URL=https://your-vercel-url.vercel.app
```

### Skip Stripe for Initial Test:
Comment out Stripe imports temporarily if needed:
```js
// Temporarily disable for testing
// import Stripe from 'stripe'
```

## Step-by-Step Debug Process:

1. **Check Vercel Logs** - copy full error message
2. **Add Basic Environment Variables** - start with Supabase + Google Maps
3. **Test Build Locally** - run `npm run build` locally
4. **Deploy with Minimal Config** - add features back gradually
5. **Check API Routes** - ensure they have proper runtime settings
