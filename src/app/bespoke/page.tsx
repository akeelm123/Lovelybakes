import Link from "next/link";
import { CakeRequestForm } from "@/components/cake-request-form";

export const metadata = {
  title: "Bespoke Celebration Cakes | Lovely Bakes",
  description: "Share your cake ideas with Lovely Bakes. We review each bespoke cake request before confirming availability and payment.",
};

export default function BespokePage() {
  const enabled = process.env.CAKE_REQUEST_INTAKE_ENABLED === "true";
  return <main className="bespoke-page">
    <header className="bespoke-intro">
      <Link href="/">← Back to Lovely Bakes</Link>
      <p className="eyebrow">A cake made for your moment</p>
      <h1>Something beautifully yours.</h1>
      <p>Tell us what you have in mind. We’ll review the details, availability and pricing before your booking is confirmed.</p>
    </header>
    <section className="bespoke-steps" aria-label="How bespoke ordering works">
      <div><span>01</span><h2>Share Your Ideas</h2><p>Tell us about the occasion, design and date.</p></div>
      <div><span>02</span><h2>We Review & Refine</h2><p>We’ll check availability and discuss the details.</p></div>
      <div><span>03</span><h2>Confirm Your Booking</h2><p>Once approved, payment instructions will be sent separately.</p></div>
    </section>
    <section className="bespoke-form-section" aria-labelledby="bespoke-form-title">
      <h2 id="bespoke-form-title">Start your cake request</h2>
      <CakeRequestForm enabled={enabled} />
    </section>
  </main>;
}
