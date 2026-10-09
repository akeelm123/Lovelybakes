"use client";

import { useEffect, useState } from "react";

type Check = { table: string; present: boolean };
type Status = {
  schemaReady?: boolean;
  databaseConnected?: boolean;
  reason?: string;
  note?: string;
  schemaChecks?: Check[];
};

export function CakeDatabaseReadiness() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh(signal?: AbortSignal) {
    if (!signal) setLoading(true);
    try {
      const response = await fetch("/api/admin/cake-database-readiness", { cache: "no-store", signal });
      const body: Status = await response.json();
      if (!response.ok) throw new Error("Database readiness check is unavailable. Please retry after reviewing staging configuration.");
      if (!signal?.aborted) { setStatus(body); setError(""); }
    } catch (cause) {
      if (!signal?.aborted) setError(cause instanceof Error ? cause.message : "Readiness check unavailable");
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

  return <section aria-labelledby="cake-database-readiness-heading">
    <h2 id="cake-database-readiness-heading">Staging database readiness</h2>
    <p>This is a read-only check. Passing it does not authorise opening requests, taking payments or sending emails.</p>
    <button type="button" disabled={loading} onClick={() => void refresh()}>
      {loading ? "Checking…" : "Recheck staging schema"}
    </button>
    {error && <p role="alert">{error}</p>}
    {status && !error && <>
      <p><strong>{status.schemaReady ? "Required tables detected" : "Staging database not ready"}</strong>
        {status.reason ? ` — ${status.reason.replaceAll("_", " ").toLowerCase()}` : ""}
      </p>
      {status.note && <p>{status.note}</p>}
      {status.schemaChecks && <ul>{status.schemaChecks.map(check =>
        <li key={check.table}>{check.present ? "Present" : "Missing"}: {check.table}</li>
      )}</ul>}
    </>}
  </section>;
}
