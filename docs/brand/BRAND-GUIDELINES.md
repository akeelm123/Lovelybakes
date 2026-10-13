# Lovely Bakes · Brand identity v1.0
13 October 2026

## Approved identity
The integrated gold cake-stand monogram is the approved master. Use logo-master.svg as the source of truth. APPROVAL.json records its checksum. Preserve the exact curves, proportions, gradients and integrated stand. Earlier detached-stand versions are superseded for future brand use. Supporting layouts and the small icon are adaptations supplied with this package.

## Logo selection
- Master: detailed monogram for large placements, packaging and brand features; recommended minimum width 240px.
- Stacked: monogram, outlined Lovely Bakes wordmark and Celebration Cakes descriptor; recommended minimum width 320px.
- Horizontal: website headers and wide banners; recommended minimum width 480px. Below this, use the wordmark or simplified icon with a visible brand name rather than shrinking the descriptor beyond readability.
- Burgundy: flat one-colour printing on cream or white.
- White: reversed use on solid dark burgundy or teal.
- Gold: flat gold artwork for foil separation; ask the printer to select the actual foil stock. RGB artwork does not specify metallic ink.
- Small icon: a simplified LB companion, for favicon and app icons only. It does not replace the approved detailed master.

Keep clear space of at least 10% of the asset width around the logo. Never stretch, rotate, crop, recolour individual parts, add shadows or place on a busy photograph. Use cream behind the shaded master. Preserve SVG transparency when exporting.

## Colour
| Token | Colour | Use |
|---|---|---|
| Burgundy | #99003E | Primary actions, headings, identity |
| Deep teal | #005A57 | Secondary panels and accents |
| Gold | #D5AC62 | Decorative accents, never small text on cream |
| Cream | #FFFAF2 | Primary surface |
| Ink | #2C2725 | Body text |
| Muted | #665B57 | Secondary text |
| Border | #877670 | Input boundaries |

The monogram uses additional highlight/shadow stops for its metallic and ribbon finish. Those are illustration colours, not UI text colours. Use white text on burgundy or deep teal. Error messages must have explicit wording, not just a colour change. Test every actual component state before release; this package is not a website accessibility certification.

## Typography
Use Georgia or the existing licensed editorial serif for website headings, paired with system-ui for body text. Keep body and form controls at least 16px, body line height 1.5–1.65, and supporting text generally 14px or larger. Display headings can scale from 32px on mobile to 56px on desktop. The supplied logo lettering is outlined from the earlier approved-direction package; no font installation is needed. Do not recreate it by typing the name in a substitute font.

## Voice and imagery
Warm, refined and celebratory. Explain sizes, servings, lead times and fulfilment plainly. Avoid unsupported claims about ingredients, allergens, certifications or delivery guarantees. Prefer real cake photography, natural soft light, uncluttered cream backgrounds and faithful colours. Never use the logo to cover important product details.

## Website handoff
Use logo-horizontal.svg only where there is enough space for its descriptor. Use logo-master.svg in larger brand features. On narrow headers prefer the visible brand name with the supplied small icon. Copy brand.css tokens into the site's theme deliberately, rather than overriding unrelated styles globally.

Example: <a href="/" aria-label="Lovely Bakes home"><img src="/brand/logo-horizontal.svg" alt="" width="600" height="165"></a>

Provide explicit image dimensions. Set informative standalone logo alt text to "Lovely Bakes". Maintain 44px interaction targets, visible focus rings and semantic links/buttons. Use favicon.svg, with PNG fallback files. The actual website is not changed or deployed by generating this package.

## Social and print
social-avatar.png is 1080×1080 with clear space for profile cropping. social-card.png is 1200×630 for sharing previews. PNG logo exports retain transparency. SVG is the scalable source for print; obtain a printer's colour/foil proof before manufacturing. No CMYK or press certification is implied.

## Verification
All SVG files were parsed as XML and rendered with Sharp. The stacked and horizontal layouts, social card and 16px companion were visually inspected. The master uses paths and gradients, not embedded raster artwork. Gradients intentionally flatten in single-colour versions. Previous iterations remain in their original directories.
