import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceRoleClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = createServiceRoleClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        await handleCheckoutCompleted(session, supabase)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        await handleSubscriptionChanged(subscription, supabase)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        await handleSubscriptionDeleted(subscription, supabase)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          // Fetch the subscription to get updated details
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          await handleSubscriptionChanged(subscription, supabase)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          await handleSubscriptionChanged(subscription, supabase)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  const customerId = session.customer as string
  const userId = session.metadata?.user_id
  const userEmail = session.metadata?.user_email

  if (!userId || !userEmail) {
    console.error('Missing user metadata in checkout session')
    return
  }

  // Update profile with Stripe customer ID
  await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  // Handle different checkout modes
  if (session.mode === 'payment') {
    // One-time payment (lifetime)
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
    const priceId = lineItems.data[0]?.price?.id
    
    // Check if this is a lifetime purchase
    if (priceId === process.env.STRIPE_PRICE_LIFETIME_AUD || 
        priceId === process.env.STRIPE_PRICE_LIFETIME_USD) {
      
      await supabase
        .from('profiles')
        .update({
          plan: 'lifetime',
          subscription_status: 'active',
          current_period_end: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
    }
  } else if (session.mode === 'subscription' && session.subscription) {
    // Subscription created - will be handled by subscription.created event
    console.log('Subscription checkout completed, waiting for subscription.created event')
  }
}

async function handleSubscriptionChanged(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string
  
  // Find user by Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('Profile not found for customer:', customerId)
    return
  }

  // Don't overwrite lifetime users
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', profile.id)
    .single()

  if (currentProfile?.plan === 'lifetime') {
    console.log('Skipping subscription update for lifetime user')
    return
  }

  // Determine plan from price ID
  const priceId = subscription.items.data[0]?.price?.id
  let plan: string | null = null

  if (priceId === process.env.STRIPE_PRICE_MONTHLY_AUD || 
      priceId === process.env.STRIPE_PRICE_MONTHLY_USD) {
    plan = 'monthly'
  } else if (priceId === process.env.STRIPE_PRICE_YEARLY_AUD || 
             priceId === process.env.STRIPE_PRICE_YEARLY_USD) {
    plan = 'yearly'
  }

  // Update profile
  await supabase
    .from('profiles')
    .update({
      plan,
      subscription_status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  // Upsert subscription record
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: profile.id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string
  
  // Find user by Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, plan')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('Profile not found for customer:', customerId)
    return
  }

  // Don't modify lifetime users
  if (profile.plan === 'lifetime') {
    console.log('Skipping subscription deletion for lifetime user')
    return
  }

  // Update profile to reflect canceled subscription
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}
