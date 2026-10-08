import "server-only";
import { randomUUID } from "node:crypto";
import { database } from "@/server/database";
import type { CakeRequestInput } from "@/domain/cake-request";

export async function createCakeRequest(input: CakeRequestInput): Promise<string> {
  const sql = database();
  // Submission key makes client retries safe without creating duplicate requests.
  const rows = await sql`
    insert into cake_request (
      cake_request_id, submission_key, customer_name, customer_email,
      customer_phone, requested_for_date, fulfilment_preference,
      occasion, cake_details, allergy_notes
    ) values (
      ${randomUUID()}, ${input.submissionKey}, ${input.customerName}, ${input.customerEmail},
      ${input.customerPhone}, ${input.requestedForDate}, ${input.fulfilmentPreference},
      ${input.occasion}, ${input.cakeDetails}, ${input.allergyNotes}
    )
    on conflict (submission_key) do nothing
    returning cake_request_id as id
  `;
  if (rows[0]) return String(rows[0].id);
  const existing = await sql`select cake_request_id as id from cake_request where submission_key=${input.submissionKey}`;
  if (!existing[0]) throw new Error("REQUEST_NOT_SAVED");
  return String(existing[0].id);
}
