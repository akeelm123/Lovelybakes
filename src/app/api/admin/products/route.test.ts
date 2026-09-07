import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/server/auth", () => ({ requireAdmin: vi.fn(), AuthorizationError: class extends Error { constructor(public status: number, message: string) { super(message); } } }));
vi.mock("@/server/products", () => ({ getProducts: vi.fn(), saveProduct: vi.fn() }));
import { requireAdmin, AuthorizationError } from "@/server/auth";
import { getProducts, saveProduct } from "@/server/products";
import { GET, POST, PATCH } from "./route";
const product = { name: "Cake", description: "A lovely cake", category: "Celebration", priceCents: 6800, imageUrl: "/lovelybakes/vintage-pink.jpg", imageAlt: "Pink cake", status: "published", featured: false };
function request(body: unknown, method = "POST") { return new Request("http://localhost/api/admin/products", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
beforeEach(() => { vi.resetAllMocks(); });
describe("protected catalog boundary", () => {
  it("does not read or mutate catalog data without authorization", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new AuthorizationError(401, "Sign in required"));
    expect((await GET(new Request("http://localhost/api/admin/products"))).status).toBe(401);
    expect((await POST(request(product))).status).toBe(401);
    expect(saveProduct).not.toHaveBeenCalled();
    expect(getProducts).not.toHaveBeenCalled();
  });
  it("validates prices before writing", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ sub: "test-admin" });
    expect((await POST(request({ ...product, priceCents: -1 }))).status).toBe(400);
    expect(saveProduct).not.toHaveBeenCalled();
  });
  it("reports an edit conflict instead of claiming success", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ sub: "test-admin" });
    vi.mocked(saveProduct).mockRejectedValue(new Error("EDIT_CONFLICT"));
    const result = await PATCH(request({ ...product, id: "a4b0f12c-bb15-4f41-88f1-3ed9963c5925", version: 1 }, "PATCH"));
    expect(result.status).toBe(409);
  });
});
