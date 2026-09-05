export type CommerceEventName = "product_viewed" | "product_added_to_cart" | "checkout_started" | "payment_attempted" | "payment_succeeded" | "payment_failed" | "order_completed" | "experience_rated";

export function trackCommerceEvent(name: CommerceEventName, properties: Record<string, string | number | boolean> = {}): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem("lovelybakes_analytics_consent") !== "granted") return;
  } catch { return; }
  window.dispatchEvent(new CustomEvent("lovelybakes:analytics", { detail: { name, properties, occurredAtUtc: new Date().toISOString() } }));
}
