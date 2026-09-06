import "server-only";

export function auditAdminAction(input: { actorId: string; action: string; resourceId: string }): void {
  console.info(JSON.stringify({ type: "admin_audit", actorId: input.actorId, action: input.action, resourceId: input.resourceId, occurredAtUtc: new Date().toISOString() }));
}
