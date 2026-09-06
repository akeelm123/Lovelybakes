import { beforeEach, expect, it, vi } from "vitest";
vi.mock("@/server/auth", () => ({ requireAdmin: vi.fn(), AuthorizationError: class extends Error { constructor(public status: number, message: string) { super(message); } } }));
vi.mock("@/server/site-content", () => ({ getSiteContent: vi.fn(), saveSiteContent: vi.fn() }));
import { requireAdmin, AuthorizationError } from "@/server/auth";
import { getSiteContent, saveSiteContent } from "@/server/site-content";
import { defaultContent } from "@/domain/site-content";
import { GET, PUT } from "./route";
function request(content = defaultContent) { return new Request("http://localhost/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, version: 1, publish: true }) }); }
beforeEach(() => vi.resetAllMocks());
it("blocks unauthorized reads and publications", async () => {
  vi.mocked(requireAdmin).mockRejectedValue(new AuthorizationError(401, "Sign in required"));
  expect((await GET(new Request("http://localhost/api/admin/content"))).status).toBe(401);
  expect((await PUT(request())).status).toBe(401);
  expect(getSiteContent).not.toHaveBeenCalled();
  expect(saveSiteContent).not.toHaveBeenCalled();
});
it("rejects unsafe content and reports conflicting publication", async () => {
  vi.mocked(requireAdmin).mockResolvedValue({ sub: "test-admin" });
  expect((await PUT(request({ ...defaultContent, socialUrl: "javascript:alert(1)" }))).status).toBe(400);
  expect(saveSiteContent).not.toHaveBeenCalled();
  vi.mocked(saveSiteContent).mockRejectedValue(new Error("EDIT_CONFLICT"));
  expect((await PUT(request())).status).toBe(409);
});
