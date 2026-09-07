import { z } from "zod";

export const emailSettingSchema = z.object({
  replyToEmail: z.email().max(254),
  version: z.number().int().positive(),
}).strict();

export type EmailSetting = z.infer<typeof emailSettingSchema>;
export const defaultEmailSetting: EmailSetting = { replyToEmail: "orders@lovelybakestore.com", version: 1 };
