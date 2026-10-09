"use client";

import { useEffect, useState } from "react";

type Notification = {
  notificationId: string;
  requestId: string;
  messageType: string;
  status: string;
  attemptCount: number;
  createdAtUtc: string;
  sentAtUtc: string | null;
  lastErrorCode: string | null;
};

export function CakeNotificationMonitor() {
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh(signal?: AbortSignal) {
    if (!signal) setLoading(true);
    try {
      const response = await fetch("/api/admin/cake-notifications", { cache: "no-store", signal });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? body.message ?? "Unable to load cake notifications");
      if (!signal?.aborted) { setItems(body.notifications ?? []); setError(""); }
    } catch (cause) {
      if (!signal?.aborted) setError(cause instanceof Error ? cause.message : "Unable to load notifications");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    // Defer the fetch to a microtask so state updates occur asynchronously.
    void Promise.resolve().then(() => refresh(controller.signal));
    return () => controller.abort();
  }, []);

  return <section aria-labelledby="cake-notification-heading">
    <h2 id="cake-notification-heading">Cake request notifications</h2>
    <p>Monitoring only. Automated delivery is disabled until staging integration tests and sender configuration are approved.</p>
    <button type="button" disabled={loading} onClick={() => void refresh()}>
      {loading ? "Refreshing…" : "Refresh notification queue"}
    </button>
    {error && <p role="alert">{error}</p>}
    {!error && !loading && items.length === 0 && <p>No cake request notifications have been queued.</p>}
    {items.length > 0 && <div className="cake-operations-table-wrap">
      <table>
        <thead><tr><th>Request</th><th>Message</th><th>Status</th><th>Attempts</th><th>Queued</th></tr></thead>
        <tbody>{items.map(item => <tr key={item.notificationId}>
          <td>{item.requestId.slice(0, 8).toUpperCase()}</td>
          <td>{item.messageType.replaceAll("_", " ")}</td>
          <td>{item.status}{item.lastErrorCode ? ` — ${item.lastErrorCode}` : ""}</td>
          <td>{item.attemptCount}</td>
          <td>{new Date(item.createdAtUtc).toLocaleString("en-SG", { timeZone: "Asia/Singapore" })}</td>
        </tr>)}</tbody>
      </table>
    </div>}
  </section>;
}
