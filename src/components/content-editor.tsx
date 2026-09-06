"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { contentFields, type ContentKey, type SiteContent } from "@/domain/site-content";
async function data(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "The request failed. Please try again.");
  return body;
}
export function ContentEditor({ initialContent, initialVersion }: { initialContent: SiteContent; initialVersion: number }) {
  const [content, setContent] = useState(initialContent);
  const [version, setVersion] = useState(initialVersion);
  const [group, setGroup] = useState<string>("Brand");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function change(key: ContentKey, value: string) { setContent((current) => ({ ...current, [key]: value })); setDirty(true); setMessage(""); }
  async function upload(key: ContentKey, file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Choose a photograph smaller than 5 MB.");
      const result = await data(await fetch("/api/admin/images", { method: "POST", headers: { "Content-Type": file.type }, body: file }));
      change(key, result.imageUrl);
      setMessage("Photograph uploaded. Save a draft or publish to use it.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  async function save(publish: boolean) {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await data(await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, version, publish }) }));
      setVersion(result.version); setDirty(false);
      setMessage(publish ? "Published. Refresh the shop to see your changes." : "Draft saved. Your live website is unchanged. Open Preview draft to review it.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Save failed."); }
    finally { setBusy(false); }
  }
  async function reload() {
    if (dirty && !window.confirm("Discard your unsaved website changes and reload the latest draft?")) return;
    setBusy(true); setError("");
    try { const result = await data(await fetch("/api/admin/content", { cache: "no-store" })); setContent(result.content); setVersion(result.version); setDirty(false); setMessage("Latest draft loaded."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Reload failed."); }
    finally { setBusy(false); }
  }
  return <main className="admin-main"><div className="admin-heading"><div><h1>Website content</h1><p>Edit existing words, photos and links throughout your shop.</p></div><a className="secondary-button" href="/admin/content/preview" target="_blank" rel="noreferrer">Preview saved draft ↗</a></div><p>Your shop currently has one public page with the sections below. Products and prices are managed under Products.</p>{error && <div className="admin-message admin-error" role="alert">{error} <button disabled={busy} onClick={() => void reload()}>Reload latest draft</button></div>}{message && <div className="admin-message" role="status">{message}</div>}<div className="admin-grid"><aside className="admin-panel"><h2>Page sections</h2><nav className="content-sections" aria-label="Content sections">{Array.from(new Set(contentFields.map((field) => field.group))).map((name) => <button key={name} aria-pressed={group === name} onClick={() => setGroup(name)}>{name}</button>)}</nav></aside><section className="admin-panel"><h2>{group}</h2><form className="admin-form" onSubmit={(event) => { event.preventDefault(); void save(false); }}><fieldset disabled={busy} className="content-fields">{contentFields.filter((field) => field.group === group).map((field) => <div key={field.key} className="admin-field"><label htmlFor={field.key}>{field.label}</label>{field.kind === "image" ? <><Image className="content-image" src={content[field.key]} alt={`${field.label} preview`} width={280} height={180} unoptimized /><input id={field.key} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { void upload(field.key, event.target.files?.[0]); event.target.value = ""; }} /><small>Replace image: JPG, PNG or WebP, up to 5 MB.</small><button type="button" className="secondary-button" onClick={() => change(field.key, field.value)}>Use original image</button></> : field.kind === "url" ? <input id={field.key} type="url" required value={content[field.key]} onChange={(event) => change(field.key, event.target.value)} /> : <textarea id={field.key} required maxLength={2000} rows={field.key.toLowerCase().includes("description") || field.key.includes("Answer") ? 4 : 2} value={content[field.key]} onChange={(event) => change(field.key, event.target.value)} />}</div>)}</fieldset><div className="admin-actions"><p>{dirty ? "You have unsaved changes." : "Your saved draft is ready to review."}</p><button className="secondary-button" type="submit" disabled={busy}>Save draft</button><button className="primary-button" type="button" disabled={busy} onClick={() => void save(true)}>{busy ? "Saving…" : "Publish website"}</button></div><small>Save and publish apply to every section. Publishing updates the public shop immediately.</small></form></section></div></main>;
}
