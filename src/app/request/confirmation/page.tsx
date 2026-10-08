import Link from "next/link";

export const metadata = {
  title: "Payment Review | Lovely Bakes",
  description: "Your cake booking status is verified separately from the payment redirect.",
};

export default function RequestConfirmationPage() {
  return <main className="bespoke-page">
    <section className="bespoke-intro">
      <p className="eyebrow">Your cake request</p>
      <h1>Thank you for your payment.</h1>
      <p>Payment processing and booking confirmation are checked separately. This page does not confirm your booking. Please wait for our confirmation message before making arrangements.</p>
      <Link href="/">Return to Lovely Bakes</Link>
    </section>
  </main>;
}
