import { describe, expect, it } from "vitest";
import { canTransitionOrder } from "./order";

describe("order fulfilment", () => {
  it("cannot mark an unpaid order paid or fulfilled through administration", () => {
    expect(canTransitionOrder("pending_payment", "paid")).toBe(false);
    expect(canTransitionOrder("pending_payment", "fulfilled")).toBe(false);
  });
  it("requires each fulfilment step and protects terminal states", () => {
    expect(canTransitionOrder("paid", "preparing")).toBe(true);
    expect(canTransitionOrder("preparing", "ready")).toBe(true);
    expect(canTransitionOrder("ready", "fulfilled")).toBe(true);
    expect(canTransitionOrder("paid", "fulfilled")).toBe(false);
    expect(canTransitionOrder("fulfilled", "preparing")).toBe(false);
    expect(canTransitionOrder("cancelled", "paid")).toBe(false);
  });
});
