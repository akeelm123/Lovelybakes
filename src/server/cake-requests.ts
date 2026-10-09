import "server-only";
import { randomUUID } from "node:crypto";
import { database } from "@/server/database";
import { enqueueCakeRequestReceipt } from "@/server/cake-request-notifications";
import type { CakeRequestInput } from "@/domain/cake-request";

export async function createCakeRequest(input: CakeRequestInput): Promise<string> {
  // Request and notification intent commit together; retries cannot duplicate either.
  return database().begin(async tx => {
    const rows = await tx`
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
    let id = rows[0]?.id;
    if (!id) {
      const existing = await tx`select cake_request_id as id from cake_request where submission_key=${input.submissionKey}`;
      id = existing[0]?.id;
    }
    if (!id) throw new Error("REQUEST_NOT_SAVED");
    await enqueueCakeRequestReceipt(tx, String(id));
    return String(id);
  });
}
