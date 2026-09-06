"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { sampleProducts, formatPrice } from "@/lib/catalog";
import { parsePrice, type ManagedProduct } from "@/domain/product";

type Form = { id?: string; version?: number; name: string; description: string; category: string; price: string; imageUrl: string; imageAlt: string; status: ManagedProduct["status"]; featured: boolean };
const blank: Form = { name: "", description: "", category: "Celebration", price: "", imageUrl: "", imageAlt: "", status: "draft", featured: false };
const demos: ManagedProduct[] = sampleProducts.map((product) => ({ ...product, status: "draft", version: 1, featured: false }));
function edit(product: ManagedProduct): Form { return { ...product, price: (product.priceCents / 100).toFixed(2) }; }
async function responseData(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "The request failed. Please try again.");
  return body;
}
export function ProductEditor({ preview = false }: { preview?: boolean }) {
  const [products, setProducts] = useState<ManagedProduct[]>(preview ? demos : []);
  const [form, setForm] = useState<Form>(preview ? edit(demos[0]) : blank);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!preview);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (preview) return;
    try {
      const body = await responseData(await fetch("/api/admin/products", { cache: "no-store" }));
      setProducts(body.products);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The catalog could not be loaded."); }
    finally { setLoading(false); }
  }, [preview]);
  useEffect(() => {
    if (preview) return;
    const controller = new AbortController();
    fetch("/api/admin/products", { cache: "no-store", signal: controller.signal })
      .then(responseData)
      .then((body) => setProducts(body.products))
      .catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "The catalog could not be loaded."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [preview]);
  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) { if (dirty) event.preventDefault(); }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  function change<K extends keyof Form>(field: K, value: Form[K]) { setDirty(true); setForm((current) => ({ ...current, [field]: value })); setMessage(""); }
  function select(next: Form) {
    if (dirty && !window.confirm("Discard your unsaved product changes?")) return;
    setForm(next); setDirty(false); setError(""); setMessage("");
  }
  async function upload(file?: File) {
    if (!file || preview) return;
    setError(""); setBusy(true);
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Choose a photograph smaller than 5 MB.");
      const body = await responseData(await fetch("/api/admin/images", { method: "POST", headers: { "Content-Type": file.type }, body: file }));
      change("imageUrl", body.imageUrl);
      setMessage("Photo uploaded. Save the product to use it.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (preview) return;
    const priceCents = parsePrice(form.price);
    if (priceCents === null) { setError("Enter an SGD price between $1.00 and $10,000.00 with up to two decimal places."); return; }
    if (!form.imageUrl) { setError("Upload a photograph before saving."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const body = { name: form.name, description: form.description, category: form.category, priceCents, imageUrl: form.imageUrl, imageAlt: form.imageAlt, status: form.status, featured: form.featured, ...(form.id ? { id: form.id, version: form.version } : {}) };
      const result = await responseData(await fetch("/api/admin/products", { method: form.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
      setDirty(false);
      setForm((current) => ({ ...current, id: result.id, version: (current.version ?? 0) + 1 }));
      setMessage(form.status === "published" ? "Published. Your photo and price are now visible in the shop." : "Saved. This product is hidden from the shop.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The product could not be saved."); }
    finally { setBusy(false); }
  }
  return <main className="admin-main"><div className="admin-heading"><div><h1>Products & photographs</h1><p>Select an existing cake below to edit its photograph, description, price and visibility.</p></div><button className="primary-button" disabled={busy || loading} onClick={() => select({ ...blank })}>New product +</button></div>{preview && <div className="admin-preview-note"><strong>Editor preview</strong> — explore the fields and sample products. Uploading and saving become available after Google sign-in and catalog storage are connected. Nothing edited here changes the shop.</div>}{error && <div className="admin-message admin-error" role="alert">{error} <button className="secondary-button" disabled={busy} onClick={() => { setError(""); void load(); }}>Reload catalog</button></div>}{message && <div className="admin-message" role="status">{message}</div>}<div className="admin-grid"><aside className="admin-panel"><h2>Your catalog <small>({products.length})</small></h2>{loading ? <p role="status">Loading your products…</p> : <div className="admin-product-list">{products.map((product) => <button key={product.id} className="admin-product-option" aria-pressed={form.id === product.id} disabled={busy} onClick={() => select(edit(product))}><Image unoptimized src={product.imageUrl} alt="" width={54} height={64} /><span><strong>{product.name}</strong><small>{product.status} · {formatPrice(product.priceCents)} · Edit</small></span></button>)}{products.length === 0 && <p className="admin-empty">Your catalog is ready for its first cake. Create a product, add a photo and price, then publish when you’re happy.</p>}</div>}</aside><section className="admin-panel">{!form.id && <details className="admin-starters"><summary>Start from an existing Lovelybakes creation</summary><p>Choose a photograph and description, then enter your actual price.</p><div className="admin-starter-grid">{sampleProducts.map((product) => <button key={product.id} type="button" disabled={busy} onClick={() => select({ ...blank, name: product.name, description: product.description, category: product.category, imageUrl: product.imageUrl, imageAlt: product.imageAlt })}><Image src={product.imageUrl} alt="" width={72} height={80} /><span>{product.name}</span></button>)}</div></details>}<h2>{form.id ? "Edit product" : "Create a product"}</h2><form className="admin-form" onSubmit={save}><div className="admin-photo-row"><div className="admin-photo">{form.imageUrl ? <Image unoptimized src={form.imageUrl} alt={form.imageAlt || "Product preview"} fill sizes="160px" /> : <span>Your photo here</span>}</div><div className="admin-field"><label htmlFor="product-photo">{form.imageUrl ? "Replace photograph" : "Upload photograph"}</label><input id="product-photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || preview} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} /><small>JPG, PNG or WebP. Up to 5 MB. Photos are resized and location metadata is removed.</small></div></div><div className="admin-field"><label htmlFor="product-alt">Describe the photograph</label><input id="product-alt" value={form.imageAlt} required maxLength={250} disabled={busy} onChange={(event) => change("imageAlt", event.target.value)} /><small>A short visual description helps customers who use screen readers.</small></div><div className="admin-field"><label htmlFor="product-name">Product name</label><input id="product-name" value={form.name} required maxLength={100} disabled={busy} onChange={(event) => change("name", event.target.value)} /></div><div className="admin-field"><label htmlFor="product-description">Description</label><textarea id="product-description" value={form.description} required maxLength={1000} disabled={busy} onChange={(event) => change("description", event.target.value)} /></div><div className="admin-two"><div className="admin-field"><label htmlFor="product-price">Price (SGD)</label><input id="product-price" inputMode="decimal" placeholder="68.00" value={form.price} required disabled={busy} onChange={(event) => change("price", event.target.value)} /><small>Enter the product price, excluding delivery.</small></div><div className="admin-field"><label htmlFor="product-category">Category</label><input id="product-category" list="product-categories" value={form.category} required maxLength={60} disabled={busy} onChange={(event) => change("category", event.target.value)} /><datalist id="product-categories"><option>Celebration</option><option>Cupcakes</option><option>Tea cakes</option><option>Tarts</option></datalist></div></div><div className="admin-field"><label htmlFor="product-status">Visibility</label><select id="product-status" value={form.status} disabled={busy} onChange={(event) => change("status", event.target.value as Form["status"])}><option value="draft">Draft — only admins can see it</option><option value="published">Published — visible in the shop</option><option value="archived">Archived — hidden from the shop</option></select></div><label className="admin-checkbox"><input type="checkbox" checked={form.featured} disabled={busy} onChange={(event) => change("featured", event.target.checked)} />Feature this product at the top of the shop</label><div className="admin-actions"><p>{dirty ? "You have unsaved changes." : "Photos and prices save together."}</p><button className="primary-button" disabled={busy || preview || loading} type="submit">{busy ? "Saving…" : form.status === "published" ? "Save & publish" : "Save product"}</button></div></form></section></div></main>;
}
