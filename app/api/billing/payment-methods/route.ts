import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

export async function GET(req: Request) {
  try {
    // Get cookies and create Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json({
        paymentMethods: [],
        message: "No customer found",
      });
    }

    // Get payment methods from Stripe
    if (!stripe) {
      return NextResponse.json({
        paymentMethods: [],
        message: "Stripe not configured",
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: "card",
    });

    // Get customer to check default payment method
    const customer = await stripe.customers.retrieve(
      profile.stripe_customer_id
    );

    const isCustomer =
      typeof customer === "object" &&
      customer !== null &&
      "invoice_settings" in customer;

    return NextResponse.json({
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type,
        card: pm.card,
        is_default:
          isCustomer &&
          (customer as { invoice_settings?: { default_payment_method?: string } })
            .invoice_settings?.default_payment_method === pm.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { paymentMethodId } = await req.json();

    // Get cookies and create Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    // Detach payment method from customer
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { paymentMethodId } = await req.json();

    // Get cookies and create Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Set as default payment method
    await stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Default payment method updated",
    });
  } catch (error) {
    console.error("Error updating default payment method:", error);
    return NextResponse.json(
      { error: "Failed to update default payment method" },
      { status: 500 }
    );
  }
}