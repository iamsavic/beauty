import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

export async function createCheckoutSession({
  appointmentId,
  organizationSlug,
  amount,
  mode,
  clientEmail,
  serviceName,
}: {
  appointmentId: string
  organizationSlug: string
  amount: number
  mode: 'deposit' | 'full'
  clientEmail: string
  serviceName: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: clientEmail,
    line_items: [
      {
        price_data: {
          currency: 'bam',
          product_data: {
            name: serviceName,
            description: mode === 'deposit' ? 'Avans za rezervaciju' : 'Puna uplata',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      appointmentId,
      organizationSlug,
      paymentMode: mode,
    },
    success_url: `${appUrl}/${organizationSlug}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${organizationSlug}/book/cancel`,
  })

  return session
}

export function constructWebhookEvent(payload: string, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
