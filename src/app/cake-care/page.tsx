import Link from "next/link";

export const metadata = {
  title: "Cake Care | Lovely Bakes",
  description: "Simple tips for storing, transporting, serving and cutting your Lovely Bakes celebration cake.",
};

const sections = [
  { title: "Keeping Your Cake Cool", body: "Keep your cake in a cool environment and follow any storage instructions provided for your specific order. If refrigeration is recommended, keep the cake boxed and away from strong-smelling foods." },
  { title: "Transporting Your Cake", body: "Travel in an air-conditioned vehicle. Keep the box flat on a stable surface, not on a seat or someone’s lap. Avoid sudden braking, direct sunlight and unnecessary stops." },
  { title: "Before Serving", body: "Follow the serving instructions supplied with your cake. Allow suitable time for the texture to soften if it has been chilled, while keeping food safety in mind." },
  { title: "Cutting Your Cake", body: "For a tall celebration cake, cut a straight section from the edge and divide it into smaller rectangular finger slices. Continue across the cake in sections rather than cutting large wedges." },
  { title: "Leftovers", body: "Cover and refrigerate leftover cake promptly. Follow any order-specific storage guidance, especially for fillings or decorations that need extra care." },
];

export default function CakeCarePage() {
  return (
    <main className="cake-care-page">
      <div className="cake-care-intro">
        <Link href="/">← Back to Lovely Bakes</Link>
        <p className="eyebrow">Helpful guidance</p>
        <h1>Cake Care</h1>
        <p>A few thoughtful steps will help your cake look and taste its best, from collection through to the last slice.</p>
      </div>
      <div className="cake-care-content">
        {sections.map((section) => <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>)}
        <section>
          <h2>Need Help?</h2>
          <p>If you have questions about the care instructions for your particular cake, please contact Lovely Bakes using the details in your order confirmation.</p>
        </section>
      </div>
    </main>
  );
}
