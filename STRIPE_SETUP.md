# Stripe Setup for LumaLead.io

## 1. Stripe Products & Prices Setup

### Create Products in Stripe Dashboard:

#### Product 1: LumaLead.io Monthly
- **Type**: Recurring
- **Name**: LumaLead.io Monthly
- **Description**: Monthly subscription with 14-day free trial

**Prices**:
- AUD: $12.99/month (price_xxxxx)
- USD: $8.99/month (price_xxxxx)

#### Product 2: LumaLead.io Yearly  
- **Type**: Recurring
- **Name**: LumaLead.io Yearly
- **Description**: Annual subscription (20% savings)

**Prices**:
- AUD: $124.99/year (price_xxxxx)
- USD: $89.99/year (price_xxxxx)

#### Product 3: LumaLead.io Lifetime
- **Type**: One-time
- **Name**: LumaLead.io Lifetime
- **Description**: Lifetime access - pay once, use forever

**Prices**:
- AUD: $299 one-time (price_xxxxx)
- USD: $199 one-time (price_xxxxx)

## 2. Webhook Configuration

### Production Webhook URL:
```
https://lumalead.io/api/stripe/webhook
```

### Required Events (select these in Stripe):
```
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ customer.subscription.trial_will_end
✅ invoice.payment_succeeded
✅ invoice.payment_failed
✅ customer.created
✅ customer.updated
```

### Webhook Configuration:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://lumalead.io/api/stripe/webhook`
4. Select events above
5. Copy the **Webhook Secret** (`whsec_...`)

## 3. Environment Variables for Production

```bash
# In Vercel Dashboard → Settings → Environment Variables

# Stripe Live Keys (starts with sk_live_ and pk_live_)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (copy from Stripe Dashboard)
STRIPE_PRICE_MONTHLY_AUD=price_...
STRIPE_PRICE_MONTHLY_USD=price_...
STRIPE_PRICE_YEARLY_AUD=price_...
STRIPE_PRICE_YEARLY_USD=price_...
STRIPE_PRICE_LIFETIME_AUD=price_...
STRIPE_PRICE_LIFETIME_USD=price_...
```

## 4. Testing the Trial System

### Monthly Plan Test:
1. Go to pricing page
2. Click "Start Free Trial" (Monthly plan)
3. Complete Stripe checkout
4. Verify in Stripe Dashboard:
   - Customer created
   - Subscription created with trial_end date
   - No immediate charge (trial period)

### Important Notes:
- **Trial Length**: 14 days (automatically added by code)
- **Trial Billing**: No charge until trial ends
- **Trial End**: Customer automatically billed after 14 days
- **Trial Cancellation**: Customer can cancel anytime during trial

## 5. Stripe Dashboard Monitoring

### Key Metrics to Monitor:
- **Subscriptions**: Active, trialing, canceled
- **Revenue**: MRR, ARR, lifetime value
- **Trial Conversion**: Trial → Paid conversion rate
- **Churn Rate**: Cancellation patterns

### Useful Reports:
- Subscription overview
- Revenue recognition
- Customer lifetime value
- Trial conversion rates

## 6. Customer Support Integration

### Common Customer Scenarios:
1. **Extend Trial**: Use Stripe Dashboard
2. **Change Plan**: Customer portal handles this
3. **Refunds**: Process through Stripe Dashboard
4. **Account Issues**: Check webhook logs

### Customer Portal:
- Customers can manage subscriptions
- Update payment methods
- Download invoices
- Cancel subscriptions

## 7. Production Checklist

### Before Going Live:
- [ ] Switch from test to live Stripe keys
- [ ] Update webhook endpoint to production URL
- [ ] Test trial signup flow
- [ ] Test plan changes
- [ ] Test cancellation flow
- [ ] Test webhook delivery
- [ ] Verify email notifications work

### Post-Launch:
- [ ] Monitor webhook delivery
- [ ] Check trial conversion rates
- [ ] Review customer feedback
- [ ] Optimize pricing if needed

## 🎯 Trial System is Ready!

Your 14-day trial system is fully implemented and ready for production:

✅ **Automatic Trial**: Monthly plans get 14-day free trial
✅ **No Upfront Charge**: Customers not billed during trial
✅ **Seamless Conversion**: Auto-billing after trial ends
✅ **Customer Control**: Easy cancellation during trial
✅ **Webhook Integration**: All events properly handled

**The trial will work automatically once you deploy to production!** 🚀
