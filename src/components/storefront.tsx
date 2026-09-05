"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { trackCommerceEvent } from "@/analytics/client";
import { formatPrice, type Product } from "@/lib/catalog";

import { defaultContent, type SiteContent } from "@/domain/site-content";
import { defaultOrderingRule, orderDateBounds, type OrderingRule } from "@/domain/ordering";

type Cart = Record<string, number>;
type Stage = "cart" | "checkout" | "confirmed";

export function Storefront({ products, preview = true, content = defaultContent, orderingRule = defaultOrderingRule, commerceEnabled = false }: { products: Product[]; preview?: boolean; content?: SiteContent; orderingRule?: OrderingRule; commerceEnabled?: boolean }) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Cart>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("cart");
  const [fulfilment, setFulfilment] = useState<"collection" | "delivery">(orderingRule.collectionEnabled ? "collection" : "delivery");
  const [requestedDate, setRequestedDate] = useState("");
  const [checkoutRequestKey] = useState(() => crypto.randomUUID());
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  useEffect(() => {
    let restored: Cart = {};
    try {
      const stored: unknown = JSON.parse(localStorage.getItem("lovelybakes_cart") ?? "{}");
      if (stored && typeof stored === "object" && !Array.isArray(stored)) {
        restored = Object.fromEntries(Object.entries(stored).filter(([id, quantity]) => products.some((product) => product.id === id) && Number.isInteger(quantity) && quantity > 0 && quantity <= 20));
      }
    } catch { /* Storage is optional; malformed carts are discarded. */ }
    // Restore client-only state after hydration.
    queueMicrotask(() => { setCart(restored); setCartLoaded(true); });
  }, [products]);
  useEffect(() => {
    if (cartLoaded) {
      try { localStorage.setItem("lovelybakes_cart", JSON.stringify(cart)); } catch { /* Private browsing may disable storage. */ }
    }
  }, [cart, cartLoaded]);
  useEffect(() => {
    if (!drawerOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
      if (event.key !== "Tab") return;
      const controls = drawerRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, textarea, select, [tabindex="0"]');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [drawerOpen]);
  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];
  const visibleProducts = products.filter((product) => (category === "All" || product.category === category) && `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase().trim()));
  const itemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const dateBounds = orderDateBounds(orderingRule);
  const subtotal = useMemo(() => products.reduce((sum, product) => sum + (cart[product.id] ?? 0) * product.priceCents, 0), [cart, products]);
  const deliveryFee = fulfilment === "delivery" ? orderingRule.deliveryFeeCents : 0;
  const orderTotal = subtotal + deliveryFee;
  const unavailableDate = orderingRule.blackoutDates.includes(requestedDate);

  useEffect(() => { if (drawerOpen) closeButtonRef.current?.focus(); }, [drawerOpen, stage]);
  function addToCart(product: Product) { setCart((current) => ({ ...current, [product.id]: Math.min(20, (current[product.id] ?? 0) + 1) })); trackCommerceEvent("product_added_to_cart", { productId: product.id, quantity: 1 }); }
  function setQuantity(productId: string, quantity: number) { setCart((current) => { const next = { ...current }; if (quantity <= 0) delete next[productId]; else next[productId] = Math.min(20, quantity); return next; }); }
  function openCart() { setStage("cart"); setDrawerOpen(true); }
  async function submitCheckout(event: FormEvent<HTMLFormElement>) { event.preventDefault(); trackCommerceEvent("payment_attempted", { method: preview ? "preview" : "stripe", amountCents: orderTotal }); if (preview) { setStage("confirmed"); return; } setCheckoutBusy(true); setCheckoutError(""); const fields=new FormData(event.currentTarget); try { const response=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({checkoutRequestKey,customerName:fields.get("name"),customerEmail:fields.get("email"),customerPhone:fields.get("phone"),fulfilmentMethod:fulfilment,deliveryAddress:fields.get("address"),requestedForDate:requestedDate,orderNotes:fields.get("notes")??"",paymentMethod:"visa",items:Object.entries(cart).map(([productId,quantity])=>({productId,quantity}))})});const value=await response.json();if(!response.ok||typeof value.checkoutUrl!=="string")throw new Error(value.error?.message??"Checkout could not be started.");window.location.assign(value.checkoutUrl);} catch(cause){setCheckoutError(cause instanceof Error?cause.message:"Checkout could not be started.");setCheckoutBusy(false);} }

  return <>
    <a className="skip-link" href="#bakes">Skip to cakes</a>
    <div className="announcement">{content.announcement}</div>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Lovelybakes home"><Image unoptimized src={content.logoImage} alt="" width={60} height={60} /><span><strong>{content.brandName}</strong><small>{content.brandByline}</small></span></a>
      <form className="search-form" role="search" onSubmit={(event) => { event.preventDefault(); document.getElementById("bakes")?.scrollIntoView(); }}><label className="sr-only" htmlFor="cake-search">Search cakes</label><input id="cake-search" type="search" placeholder={content.searchPlaceholder} value={search} onChange={(event) => setSearch(event.target.value)} /><button type="submit" aria-label="Search cakes">Search <span aria-hidden="true">↗</span></button></form>
      {commerceEnabled && <button className="cart-button" type="button" onClick={openCart} aria-label={`Cart, ${itemCount} items`}>Your bag <span>{itemCount}</span></button>}
      <nav className="header-actions" aria-label="Primary navigation"><a href="#bakes" onClick={() => setCategory("All")}>{content.navAll}</a><a href="#bakes" onClick={() => setCategory("Celebration")}>{content.navCelebration}</a><a href="#bakes" onClick={() => setCategory("Cupcakes")}>{content.navCupcakes}</a><a href="#custom">{content.navCustom}</a><a href="#story">{content.navStory}</a></nav>
    </header>
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow">{content.heroEyebrow}</p><h1 id="hero-title">{content.heroTitle}</h1><p>{content.heroDescription}</p><div className="hero-buttons"><a className="primary-button" href="#bakes">{content.heroButton} <span aria-hidden="true">↗</span></a><a className="underlined-link" href="#custom">{content.heroSecondary}</a></div><span className="hero-signature">{content.heroSignature}</span></div>
        <div className="hero-visual"><Image unoptimized src={content.heroImage} alt={content.heroImageAlt} fill sizes="(max-width: 720px) 100vw, 48vw" priority /><a className="hero-caption" href={content.heroLink} target="_blank" rel="noreferrer">{content.heroCaption} <span aria-hidden="true">↗</span></a></div>
      </section>
      <div className="craft-strip"><span>{content.highlightOne}</span><span aria-hidden="true">✳</span><span>{content.highlightTwo}</span><span aria-hidden="true">✳</span><span>{content.highlightThree}</span><span aria-hidden="true">✳</span><span>{content.highlightFour}</span></div>
      <section className="catalog-section" id="bakes" aria-labelledby="catalog-title">
        <div className="section-heading"><div><h2 id="catalog-title">{content.catalogTitle}</h2><p>{content.catalogDescription}</p></div><a className="underlined-link" href={content.socialUrl} target="_blank" rel="noreferrer">{content.catalogSocial}</a></div>
        <div className="catalog-toolbar"><div className="filters" aria-label="Filter products by category">{categories.map((item) => <button key={item} className="filter-button" type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item === "All" ? "All creations" : item === "Celebration" ? "Celebration cakes" : item}</button>)}</div><p className="preview-label">{preview ? "UAT preview · Sample prices in SGD" : "From prices in SGD · Confirm your design and quote"}</p></div>
        <div className="product-grid" aria-live="polite">{visibleProducts.map((product) => <article className="product-card" key={product.id} aria-label={`${product.name}, ${preview ? "sample price " : ""}${formatPrice(product.priceCents)}`}><div className="product-image"><Image unoptimized src={product.imageUrl} alt={product.imageAlt} fill sizes="(max-width: 600px) 50vw, (max-width: 1023px) 50vw, 33vw" /><span className="photo-tag">{content.photoTag}</span></div><div className="product-content"><div className="product-meta"><span className="badge">{product.category === "Celebration" ? "Celebration cake" : product.category}</span><span className="price">{commerceEnabled ? formatPrice(product.priceCents) : `From ${formatPrice(product.priceCents)}`}{preview && <small>sample price</small>}</span></div><h3>{product.name}</h3><p>{product.description}</p>{commerceEnabled ? <button className="primary-button" type="button" onClick={() => addToCart(product)}>Add to bag <span aria-hidden="true">+</span></button> : <a className="primary-button" href={content.socialUrl} target="_blank" rel="noreferrer">Enquire on Instagram ↗</a>}</div></article>)}</div>
        {visibleProducts.length === 0 && <div className="search-empty"><h3>No cakes found</h3><p>Try a different name or browse all creations.</p><button className="secondary-button" onClick={() => { setSearch(""); setCategory("All"); }}>Show all cakes</button></div>}
      </section>
      <section className="custom-section" id="custom"><div className="custom-photo"><Image unoptimized src={content.customImage} alt={content.customImageAlt} fill sizes="(max-width: 720px) 100vw, 40vw" /></div><div className="custom-copy"><p className="eyebrow">{content.customEyebrow}</p><h2>{content.customTitle}</h2><p>{content.customDescription}</p><a className="primary-button" href={content.socialUrl} target="_blank" rel="noreferrer">{content.customButton}</a></div></section>
      <section className="story-band" id="story"><div><p className="eyebrow">{content.storyEyebrow}</p><h2>{content.storyTitle}</h2></div><div><p>{content.storyDescription}</p><a className="underlined-link" href={content.socialUrl} target="_blank" rel="noreferrer">{content.storyButton}</a></div></section>
      <section className="ordering-section" aria-labelledby="ordering-title"><div><p className="eyebrow">Plan your celebration</p><h2 id="ordering-title">Ordering at a glance</h2></div><div className="ordering-rules"><p><strong>{orderingRule.leadTimeDays} days</strong><span>Minimum notice</span></p><p><strong>{formatPrice(orderingRule.minimumOrderCents)}</strong><span>Minimum order</span></p><p><strong>{orderingRule.collectionEnabled ? "Collection" : ""}{orderingRule.collectionEnabled && orderingRule.deliveryEnabled ? " & " : ""}{orderingRule.deliveryEnabled ? "Delivery" : ""}</strong><span>Available fulfilment</span></p></div><p>{orderingRule.collectionEnabled ? orderingRule.collectionInstructions : orderingRule.deliveryArea}</p></section>
      <section className="faq-section" aria-labelledby="faq-title"><h2 id="faq-title">{content.faqTitle}</h2><details><summary>{content.faqOneQuestion}</summary><p>{content.faqOneAnswer}</p></details><details><summary>{content.faqTwoQuestion}</summary><p>{preview ? "The prices here are samples for testing the shopping experience. " : "Prices are set by Lovelybakes. "}{content.faqTwoAnswer}</p></details><details><summary>{content.faqThreeQuestion}</summary><p>{content.faqThreeAnswer}</p></details></section>
    </main>
    <footer className="footer"><div><strong>{content.brandName} <small>{content.brandByline}</small></strong><p>{content.footerDescription}</p></div><a href={content.socialUrl} target="_blank" rel="noreferrer">{content.footerSocial}</a><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><span>{commerceEnabled ? "Secure checkout by Stripe" : "Enquiries via Instagram"}</span></footer>
    {commerceEnabled && drawerOpen && <><div className="backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" /><aside ref={drawerRef} className="drawer checkout" role="dialog" aria-modal="true" aria-labelledby="drawer-title"><div className="drawer-header"><h2 id="drawer-title">{stage === "cart" ? "Your bag" : stage === "checkout" ? "Review your order" : "Preview complete"}</h2><button ref={closeButtonRef} className="icon-button" type="button" onClick={() => setDrawerOpen(false)} aria-label="Close cart">×</button></div>
      {stage === "cart" && <>{itemCount === 0 ? <div className="empty-state"><p>Your bag is waiting for something lovely.</p></div> : <ul className="cart-list">{products.filter((product) => cart[product.id]).map((product) => <li className="cart-item" key={product.id}><div><strong>{product.name}</strong><p>{formatPrice(product.priceCents)} each</p><button className="remove-button" type="button" onClick={() => setQuantity(product.id, 0)}>Remove</button></div><div className="quantity-controls"><button className="quantity-button" type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => setQuantity(product.id, cart[product.id] - 1)}>−</button><span aria-live="polite">{cart[product.id]}</span><button className="quantity-button" type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => setQuantity(product.id, cart[product.id] + 1)}>+</button></div></li>)}</ul>}<div className="cart-footer"><div className="subtotal"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><button className="primary-button" type="button" disabled={!itemCount || subtotal < orderingRule.minimumOrderCents} onClick={() => { setStage("checkout"); trackCommerceEvent("checkout_started", { itemCount, amountCents: subtotal }); }}>Continue to checkout</button>{itemCount > 0 && subtotal < orderingRule.minimumOrderCents && <p className="notice">Add {formatPrice(orderingRule.minimumOrderCents - subtotal)} more to meet the minimum order.</p>}</div></>}
      {stage === "checkout" && <form className="checkout-form" onSubmit={submitCheckout}><p className="notice">Preview only. No order, payment, or personal information will be sent or stored until production services are configured.</p><div className="field"><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" required /></div><div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div><div className="field"><label htmlFor="phone">Mobile number</label><input id="phone" name="phone" type="tel" autoComplete="tel" required /></div><div className="field"><label htmlFor="date">Requested date</label><input id="date" name="date" type="date" min={dateBounds.minimum} max={dateBounds.maximum} required value={requestedDate} onChange={(event) => setRequestedDate(event.target.value)} />{unavailableDate && <strong className="field-error" role="alert">This date is unavailable. Choose another date.</strong>}<small>Unavailable dates: {orderingRule.blackoutDates.length ? orderingRule.blackoutDates.join(", ") : "None currently listed"}</small></div><fieldset className="payment-options"><legend>Fulfilment</legend>{orderingRule.collectionEnabled && <label className="payment-option"><input name="fulfilment" type="radio" value="collection" checked={fulfilment === "collection"} onChange={() => setFulfilment("collection")} /> Collection</label>}{orderingRule.deliveryEnabled && <label className="payment-option"><input name="fulfilment" type="radio" value="delivery" checked={fulfilment === "delivery"} onChange={() => setFulfilment("delivery")} /> Delivery ({formatPrice(orderingRule.deliveryFeeCents)})</label>}</fieldset><div className="field"><label htmlFor="address">Delivery or collection details</label><textarea id="address" name="address" autoComplete="street-address" required /></div><div className="field"><label htmlFor="notes">Order notes (optional)</label><textarea id="notes" name="notes" maxLength={1000} /></div><fieldset className="payment-options"><legend>Payment method</legend><label className="payment-option"><input name="payment" type="radio" value="visa" defaultChecked /> Visa</label><label className="payment-option"><input name="payment" type="radio" value="paynow" /> PayNow</label></fieldset>{deliveryFee > 0 && <div className="subtotal"><span>Delivery</span><span>{formatPrice(deliveryFee)}</span></div>}<div className="subtotal"><span>Total</span><span>{formatPrice(orderTotal)}</span></div>{checkoutError && <p className="field-error" role="alert">{checkoutError}</p>}<button className="primary-button" type="submit" disabled={unavailableDate || checkoutBusy}>{checkoutBusy ? "Opening secure payment…" : preview ? "Complete preview" : "Pay securely with Stripe"}</button><button className="secondary-button" type="button" onClick={() => setStage("cart")}>Back to bag</button></form>}
      {stage === "confirmed" && <div className="confirmation"><div className="confirmation-mark" aria-hidden="true">✓</div><h3>Your checkout preview is ready.</h3><p>No order or payment was created. Connect the approved database and payment providers to enable live checkout.</p><button className="secondary-button" type="button" onClick={() => { setCart({}); setDrawerOpen(false); }}>Return to the shop</button></div>}
    </aside></>}
  </>;
}
