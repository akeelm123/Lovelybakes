import type Stripe from "stripe";
import { verifiedStripeEvent } from "@/server/payments";
import { reconcileCakePayment } from "@/server/cake-payment";
export const runtime = "nodejs";

// Separate from the production order webhook; no endpoint is active unless explicitly enabled.
// This endpoint accepts Stripe-signed events only, never browser claims of payment.
export async function POST(request: Request) {
  if (process.env.CAKE_PAYMENT_WORKFLOW_ENABLED !== "true") return new Response("Not enabled", { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  let event: Stripe.Event;
  try {
    const bytes = Buffer.from(await request.arrayBuffer());
    if (bytes.length > 1024 * 1024) return new Response("Payload too large", { status: 413 });
    event = verifiedStripeEvent(bytes, signature);
  } catch { return new Response("Invalid signature", { status: 400 }); }
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.expired")
    return Response.json({ received: true });
  const session = event.data.object as Stripe.Checkout.Session;
  // Ignore unrelated existing checkout events: these are processed by the legacy webhook.
  if (!session.metadata?.cakeRequestId) return Response.json({ received: true });
  try {
    const outcome = await reconcileCakePayment({
      id: event.id, type: event.type,
      session: { id: session.id, client_reference_id: session.client_reference_id,
        metadata: session.metadata, amount_total: session.amount_total,
        currency: session.currency, payment_status: session.payment_status },
    });
    return Response.json({ received: true, outcome });
  } catch {
    return new Response("Cake payment reconciliation failed", { status: 500 });
  }
}
