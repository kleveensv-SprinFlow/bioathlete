import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ received: true });
    }

    const stripe = new Stripe(stripeKey);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const payload = await req.text();
    const sig = req.headers.get("Stripe-Signature") as string;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle checkout success
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            is_premium: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("user_id", userId);
      }
    }

    // Handle cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("profiles")
        .update({
          is_premium: false,
        })
        .eq("stripe_subscription_id", subscription.id);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
