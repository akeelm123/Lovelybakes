import "server-only";
import { randomUUID } from "node:crypto";
import { database } from "./database";
import { defaultEmailSetting, emailSettingSchema, type EmailSetting } from "@/domain/email-setting";

export async function getEmailSetting(): Promise<EmailSetting> {
  const rows = await database()`select reply_to_email as "replyToEmail", version from email_setting where setting_key='transactional'`;
  return rows[0] ? emailSettingSchema.parse(rows[0]) : defaultEmailSetting;
}

export async function saveEmailSetting(setting: EmailSetting, actor: string) {
  const sql = database();
  return sql.begin(async tx => {
    const rows = await tx`update email_setting set reply_to_email=${setting.replyToEmail},version=version+1,updated_at_utc=now() where setting_key='transactional' and version=${setting.version} returning email_setting_id,version`;
    if (!rows.length) throw new Error("EDIT_CONFLICT");
    await tx`insert into administrator_event (administrator_event_id,actor_subject,action,resource_id) values (${randomUUID()},${actor},'email_reply_address_updated',${rows[0].email_setting_id})`;
    return Number(rows[0].version);
  });
}
