import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUBSCRIPTION_PLANS, type SubscriptionTier } from "./config";
import { createClient } from "@/lib/supabase/server";

// Only initialize Stripe if the secret key is properly configured
let stripe: Stripe | null = null;

if (
  process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY !== "sk_test_51234567890abcdef" &&
  process.env.STRIPE_SECRET_KEY.startsWith("sk_")
) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
    typescript: true,
  });
} else {
  console.warn("Stripe not initialized: Missing or invalid STRIPE_SECRET_KEY");
}

export { stripe };

export async function createCheckoutSession({
  userId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const supabase = createClient();

  // Get user profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw new Error("User not found");
  }

  let customerId = profile.stripe_customer_id;

  // Create customer if doesn't exist
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: {
        userId: userId,
      },
    });

    customerId = customer.id;

    // Update profile with customer ID
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", userId);
  }

  // Create checkout session with idempotency key
  const idempotencyKey = `checkout_${userId}_${priceId}_${Date.now()}`;

  const session = await stripe.checkout.sessions.create(
    {
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    },
    {
      idempotencyKey,
    }
  );

  return session;
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string
) {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function handleWebhookEvent(event: Stripe.Event) {
  const supabase = createClient();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;

      if (!userId) {
        console.error("No userId in subscription metadata");
        return;
      }

      const subscriptionData = {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        status: subscription.status as any,
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000).toISOString()
          : null,
      };

      // Upsert subscription
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert(subscriptionData, {
          onConflict: "stripe_subscription_id",
        });

      if (subError) {
        console.error("Error upserting subscription:", subError);
        return;
      }

      // Update profile subscription info
      const tier = getTierFromPriceId(subscription.items.data[0].price.id);
      if (tier) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            subscription_tier: tier,
            subscription_status: subscription.status as any,
            subscription_ends_at: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq("id", userId);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }

        // Update usage limits based on tier
        await updateUsageLimits(userId, tier);
      }

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;

      if (!userId) {
        console.error("No userId in subscription metadata");
        return;
      }

      // Update subscription status
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (subError) {
        console.error("Error updating subscription:", subError);
      }

      // Update profile to starter tier
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_tier: "starter",
          subscription_status: "canceled",
        })
        .eq("id", userId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }

      // Reset usage limits to starter
      await updateUsageLimits(userId, "starter" as SubscriptionTier);

      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId);

        if (error) {
          console.error("Error updating subscription status:", error);
        }
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  for (const [tier, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.priceId === priceId) {
      return tier as SubscriptionTier;
    }
  }
  return null;
}

async function updateUsageLimits(userId: string, tier: SubscriptionTier) {
  const supabase = createClient();

  // Safely access the tier limits with type checking
  const plan = SUBSCRIPTION_PLANS[tier as keyof typeof SUBSCRIPTION_PLANS];
  if (!plan) {
    console.warn(
      `Tier ${tier} not found in SUBSCRIPTION_PLANS, using starter limits`
    );
    return;
  }

  const limits = plan.limits;
  const resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1, 1); // First day of next month

  const updates = [
    {
      user_id: userId,
      limit_type: "posts_per_month",
      limit_value: limits.posts_per_month,
      reset_date: resetDate.toISOString(),
      current_usage: 0,
    },
    {
      user_id: userId,
      limit_type: "ai_generations_per_month",
      limit_value: limits.ai_generations_per_month,
      reset_date: resetDate.toISOString(),
      current_usage: 0,
    },
    {
      user_id: userId,
      limit_type: "social_accounts",
      limit_value: limits.social_accounts,
      reset_date: "2099-12-31T00:00:00Z", // Never resets
      current_usage: 0,
    },
  ];

  for (const update of updates) {
    await supabase.from("usage_limits").upsert(update, {
      onConflict: "user_id,limit_type",
    });
  }
}

export async function checkUsageLimit(
  userId: string,
  limitType: string,
  supabase: SupabaseClient
): Promise<boolean> {
  try {
    const { data: limit, error } = await supabase
      .from("usage_limits")
      .select("current_usage, limit_value")
      .eq("user_id", userId)
      .eq("limit_type", limitType)
      .maybeSingle();

    if (error) {
      console.warn("Usage limit check error:", error);
      return true; // Allow request if we can't check limits
    }

    if (!limit) {
      console.warn(
        "No usage limit found for user, allowing request (development mode)"
      );
      return true;
    }

    // -1 means unlimited
    if (limit.limit_value === -1) {
      return true;
    }

    return limit.current_usage < limit.limit_value;
  } catch (error) {
    console.warn("Usage limit check failed:", error);
    return true; // Allow request if check fails
  }
}

export async function incrementUsage(
  userId: string,
  limitType: string,
  supabase: SupabaseClient
): Promise<void> {
  try {
    await supabase.rpc("increment_usage", {
      p_user_id: userId,
      p_limit_type: limitType,
    });
  } catch (error) {
    console.warn("Failed to increment usage:", error);
    // Non-blocking error
  }
}
