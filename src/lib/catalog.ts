export type Product = { id: string; name: string; description: string; priceCents: number; currency: "SGD"; category: string; imageUrl: string; imageAlt: string; };

export const sampleProducts: Product[] = [
  { id: "sample-vintage-pink", name: "Vintage Pink", description: "A celebration in pink, with intricate piping and floral details.", priceCents: 6800, currency: "SGD", category: "Celebration", imageUrl: "/lovelybakes/vintage-pink.jpg", imageAlt: "Lovelybakes pink vintage cake with piped swags, flowers and a gold birthday topper" },
  { id: "sample-floral-marble", name: "Floral Marble", description: "Soft roses meet a striking grey marbled finish.", priceCents: 7200, currency: "SGD", category: "Celebration", imageUrl: "/lovelybakes/floral-marble.jpg", imageAlt: "Lovelybakes grey marble cake decorated with pale roses" },
  { id: "sample-celestial", name: "Written in the Stars", description: "Midnight blue, golden stars and a telescope topper.", priceCents: 7600, currency: "SGD", category: "Celebration", imageUrl: "/lovelybakes/celestial.jpg", imageAlt: "Lovelybakes blue and gold astronomy birthday cake with a telescope topper" },
  { id: "sample-character", name: "A Little Character", description: "Colourful birthday details with a handmade character topper.", priceCents: 7600, currency: "SGD", category: "Celebration", imageUrl: "/lovelybakes/character.jpg", imageAlt: "Lovelybakes turquoise birthday cake with a handmade mouse character and yellow stars" },
  { id: "sample-chocolate-drip", name: "Chocolate & Butterflies", description: "Purple piping, a chocolate drip and a playful chocolate topping.", priceCents: 7200, currency: "SGD", category: "Celebration", imageUrl: "/lovelybakes/chocolate-drip.jpg", imageAlt: "Lovelybakes purple cake with chocolate drip, chocolates and butterfly decorations" },
  { id: "sample-cupcakes", name: "Little Celebrations", description: "A box of cupcakes finished with deep red swirls and golden details.", priceCents: 3200, currency: "SGD", category: "Cupcakes", imageUrl: "/lovelybakes/cupcakes.jpg", imageAlt: "Box of Lovelybakes cupcakes with burgundy frosting and gold sprinkles" },
];

export function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(priceCents / 100);
}
