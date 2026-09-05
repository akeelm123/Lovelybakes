import { z } from "zod";
import { imagePathSchema } from "./product";
export const contentFields = [
  {
    "key": "announcement",
    "group": "Brand",
    "label": "Announcement",
    "value": "Home-baked in Singapore. Made for your kind of celebration.",
    "kind": "text"
  },
  {
    "key": "brandName",
    "group": "Brand",
    "label": "Business name",
    "value": "Lovelybakes",
    "kind": "text"
  },
  {
    "key": "brandByline",
    "group": "Brand",
    "label": "Byline",
    "value": "by Nash",
    "kind": "text"
  },
  {
    "key": "searchPlaceholder",
    "group": "Brand",
    "label": "Search placeholder",
    "value": "Find your celebration cake…",
    "kind": "text"
  },
  {
    "key": "navAll",
    "group": "Brand",
    "label": "All cakes label",
    "value": "All cakes",
    "kind": "text"
  },
  {
    "key": "navCelebration",
    "group": "Brand",
    "label": "Celebration label",
    "value": "Celebration cakes",
    "kind": "text"
  },
  {
    "key": "navCupcakes",
    "group": "Brand",
    "label": "Cupcakes label",
    "value": "Cupcakes",
    "kind": "text"
  },
  {
    "key": "navCustom",
    "group": "Brand",
    "label": "Custom orders label",
    "value": "Something personal",
    "kind": "text"
  },
  {
    "key": "navStory",
    "group": "Brand",
    "label": "Story label",
    "value": "Meet Lovelybakes",
    "kind": "text"
  },
  {
    "key": "heroEyebrow",
    "group": "Hero",
    "label": "Eyebrow",
    "value": "Lovely cakes. Personal touches.",
    "kind": "text"
  },
  {
    "key": "heroTitle",
    "group": "Hero",
    "label": "Heading",
    "value": "A little lovely.\nA lot to celebrate.",
    "kind": "text"
  },
  {
    "key": "heroDescription",
    "group": "Hero",
    "label": "Description",
    "value": "Home-baked celebration cakes, vintage piping and handmade toppers. Thoughtful details for a moment that’s yours.",
    "kind": "text"
  },
  {
    "key": "heroButton",
    "group": "Hero",
    "label": "Shop button",
    "value": "Find your cake",
    "kind": "text"
  },
  {
    "key": "heroSecondary",
    "group": "Hero",
    "label": "Custom orders button",
    "value": "Have a design in mind?",
    "kind": "text"
  },
  {
    "key": "heroSignature",
    "group": "Hero",
    "label": "Signature",
    "value": "Baked by Nash, for your happy moments.",
    "kind": "text"
  },
  {
    "key": "heroCaption",
    "group": "Hero",
    "label": "Photo caption",
    "value": "From the Lovelybakes kitchen",
    "kind": "text"
  },
  {
    "key": "highlightOne",
    "group": "Highlights",
    "label": "First highlight",
    "value": "Home-baked celebration cakes",
    "kind": "text"
  },
  {
    "key": "highlightTwo",
    "group": "Highlights",
    "label": "Second highlight",
    "value": "Vintage piping",
    "kind": "text"
  },
  {
    "key": "highlightThree",
    "group": "Highlights",
    "label": "Third highlight",
    "value": "Handmade toppers",
    "kind": "text"
  },
  {
    "key": "highlightFour",
    "group": "Highlights",
    "label": "Fourth highlight",
    "value": "Singapore",
    "kind": "text"
  },
  {
    "key": "catalogTitle",
    "group": "Catalog",
    "label": "Heading",
    "value": "Find your lovely.",
    "kind": "text"
  },
  {
    "key": "catalogDescription",
    "group": "Catalog",
    "label": "Description",
    "value": "A few creations from Nash’s kitchen. Which one feels like you?",
    "kind": "text"
  },
  {
    "key": "catalogSocial",
    "group": "Catalog",
    "label": "Social link label",
    "value": "More on Instagram ↗",
    "kind": "text"
  },
  {
    "key": "photoTag",
    "group": "Catalog",
    "label": "Photo credit",
    "value": "By Nash",
    "kind": "text"
  },
  {
    "key": "customEyebrow",
    "group": "Custom orders",
    "label": "Eyebrow",
    "value": "Your moment, your cake",
    "kind": "text"
  },
  {
    "key": "customTitle",
    "group": "Custom orders",
    "label": "Heading",
    "value": "Some occasions deserve a personal touch.",
    "kind": "text"
  },
  {
    "key": "customDescription",
    "group": "Custom orders",
    "label": "Description",
    "value": "A favourite colour. A meaningful detail. A topper that makes someone smile. Explore Nash’s creations and share what you have in mind.",
    "kind": "text"
  },
  {
    "key": "customButton",
    "group": "Custom orders",
    "label": "Contact button",
    "value": "Talk cake with Nash ↗",
    "kind": "text"
  },
  {
    "key": "storyEyebrow",
    "group": "Story",
    "label": "Eyebrow",
    "value": "Lovelybakes by Nash",
    "kind": "text"
  },
  {
    "key": "storyTitle",
    "group": "Story",
    "label": "Heading",
    "value": "From my kitchen,\nto your celebration.",
    "kind": "text"
  },
  {
    "key": "storyDescription",
    "group": "Story",
    "label": "Description",
    "value": "Home-baked celebration cakes with a love for vintage piping and handmade toppers. See the little details, the colourful characters and the celebrations behind Lovelybakes on Instagram.",
    "kind": "text"
  },
  {
    "key": "storyButton",
    "group": "Story",
    "label": "Social link label",
    "value": "Follow @lovelybakesbynash ↗",
    "kind": "text"
  },
  {
    "key": "faqTitle",
    "group": "FAQs",
    "label": "Heading",
    "value": "A few things to know",
    "kind": "text"
  },
  {
    "key": "faqOneQuestion",
    "group": "FAQs",
    "label": "First question",
    "value": "Can I request a personalised design?",
    "kind": "text"
  },
  {
    "key": "faqOneAnswer",
    "group": "FAQs",
    "label": "First answer",
    "value": "Share your occasion, preferred design and date with Nash on Instagram to discuss availability and a quote.",
    "kind": "text"
  },
  {
    "key": "faqTwoQuestion",
    "group": "FAQs",
    "label": "Second question",
    "value": "Are these the final prices?",
    "kind": "text"
  },
  {
    "key": "faqTwoAnswer",
    "group": "FAQs",
    "label": "Second answer",
    "value": "Confirm the design, size and final price with Nash before placing an order.",
    "kind": "text"
  },
  {
    "key": "faqThreeQuestion",
    "group": "FAQs",
    "label": "Third question",
    "value": "Can I place an order on this website?",
    "kind": "text"
  },
  {
    "key": "faqThreeAnswer",
    "group": "FAQs",
    "label": "Third answer",
    "value": "This is a UAT preview. You can try the bag and checkout, but no order or payment is submitted. For enquiries, visit @lovelybakesbynash on Instagram.",
    "kind": "text"
  },
  {
    "key": "footerDescription",
    "group": "Footer",
    "label": "Tagline",
    "value": "A little lovely for your next celebration.",
    "kind": "text"
  },
  {
    "key": "footerSocial",
    "group": "Footer",
    "label": "Social link label",
    "value": "Instagram ↗",
    "kind": "text"
  },
  {
    "key": "seoTitle",
    "group": "Search engines",
    "label": "Page title",
    "value": "Lovelybakes | Baked with heart in Singapore",
    "kind": "text"
  },
  {
    "key": "seoDescription",
    "group": "Search engines",
    "label": "Page description",
    "value": "Small-batch cakes, tarts and celebration bakes, handcrafted in Singapore.",
    "kind": "text"
  },
  {
    "key": "socialUrl",
    "group": "Brand",
    "label": "Instagram / contact URL",
    "value": "https://www.instagram.com/lovelybakesbynash/",
    "kind": "url"
  },
  {
    "key": "heroLink",
    "group": "Hero",
    "label": "Photo link",
    "value": "https://www.instagram.com/lovelybakesbynash/p/DbwefT8Ohwi/",
    "kind": "url"
  },
  {
    "key": "logoImage",
    "group": "Brand",
    "label": "Logo",
    "value": "/lovelybakes/logo.jpg",
    "kind": "image"
  },
  {
    "key": "heroImage",
    "group": "Hero",
    "label": "Hero photograph",
    "value": "/lovelybakes/vintage-pink.jpg",
    "kind": "image"
  },
  {
    "key": "heroImageAlt",
    "group": "Hero",
    "label": "Photo description",
    "value": "Lovelybakes celebration cake",
    "kind": "text"
  },
  {
    "key": "customImage",
    "group": "Custom orders",
    "label": "Photograph",
    "value": "/lovelybakes/floral-marble.jpg",
    "kind": "image"
  },
  {
    "key": "customImageAlt",
    "group": "Custom orders",
    "label": "Photo description",
    "value": "A Lovelybakes cake with marbled buttercream and a bouquet of roses",
    "kind": "text"
  }
] as const;
export type ContentKey = typeof contentFields[number]["key"];
export type SiteContent = Record<ContentKey, string>;
export const defaultContent = Object.fromEntries(contentFields.map((field) => [field.key, field.value])) as SiteContent;
const safeLink = z.url().refine((value) => { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; });
export const siteContentSchema = z.object(Object.fromEntries(contentFields.map((field) => [field.key, field.kind === "image" ? imagePathSchema : field.kind === "url" ? safeLink : z.string().trim().min(1).max(2000)]))).strict();
export const contentSaveSchema = z.object({ content: siteContentSchema, version: z.number().int().nonnegative(), publish: z.boolean() }).strict();
