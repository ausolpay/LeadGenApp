# Installation Guide for Cairns Prospect Finder

## Prerequisites

You need to have Node.js and npm installed on your system.

### Install Node.js and npm

1. **Download Node.js** from https://nodejs.org/ (LTS version recommended)
2. **Install Node.js** - this will also install npm
3. **Verify installation** by opening a new terminal and running:
   ```bash
   node --version
   npm --version
   ```

## Installation Steps

### 1. Install Dependencies

Once Node.js and npm are installed, run this command in your project directory:

```bash
npm install
```

This will install all the required packages including:
- Supabase auth helpers
- Stripe SDK
- UI components
- And other dependencies

### 2. Environment Setup

1. **Copy the environment template:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Configure your environment variables** in `.env.local`:
   ```env
   # Required - Update these values
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
   STRIPE_PRICE_MONTHLY_AUD=price_your_monthly_price_id
   STRIPE_PRICE_YEARLY_AUD=price_your_yearly_price_id
   STRIPE_PRICE_LIFETIME_AUD=price_your_lifetime_price_id
   ```

### 3. Database Setup

1. **Create a Supabase project** at https://supabase.com
2. **Run the database schema** by copying the contents of `supabase-schema.sql` into your Supabase SQL editor
3. **Enable authentication providers** in Supabase dashboard:
   - Email/Password authentication
   - GitHub OAuth (optional)
   - Email confirmation

### 4. Stripe Setup

1. **Create Stripe products** in your Stripe dashboard:
   - Monthly plan: $12.99 AUD (with 14-day trial)
   - Yearly plan: $124.99 AUD  
   - Lifetime plan: $299.00 AUD (one-time payment)

2. **Set up webhook endpoint:**
   - URL: `http://localhost:3000/api/stripe/webhook` (development)
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

3. **Copy price IDs** to your `.env.local` file

### 5. Run the Application

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Troubleshooting

### "npm is not recognized" Error

If you get this error, Node.js and npm are not properly installed:

1. **Download and install Node.js** from https://nodejs.org/
2. **Restart your terminal/command prompt**
3. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

### Module Not Found Errors

If you get module not found errors:

1. **Delete node_modules and package-lock.json:**
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Reinstall dependencies:**
   ```bash
   npm install
   ```

### Supabase Connection Issues

- Verify your SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check that your Supabase project is active
- Ensure Row Level Security policies are properly configured

### Stripe Webhook Issues

- Use ngrok for local development: `ngrok http 3000`
- Update webhook URL in Stripe dashboard to your ngrok URL
- Verify webhook signing secret matches your environment variable

## Next Steps

After installation:

1. **Test authentication** - Sign up with a test account
2. **Test payments** - Use Stripe test cards
3. **Verify allowlist** - Test with one of the allowed email addresses
4. **Check middleware** - Ensure route protection works

For production deployment, see the deployment section in the main README.
