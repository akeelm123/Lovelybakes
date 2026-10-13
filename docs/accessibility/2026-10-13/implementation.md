# Approved branding and accessibility repairs
13 October 2026

Based on current GitHub main ff9f45d (editorial patisserie production source), in an isolated worktree. Existing Release 2 work is preserved. No database migration, payment configuration, account permission or business-data change.

## Implemented
- Approved integrated cake-stand master; header derivative with descriptor removed for legibility; stacked footer; branded bespoke/care/admin navigation, favicon, Apple icon and social metadata.
- M1: teal #005a57 and white text.
- M2: two-tone focus indicator and forced-colours fallback.
- M3: stronger checkout and bespoke field boundaries.
- M4: audited navigation, filter, product, FAQ, footer and cart controls have 44px minimum targets.
- m1: product text and form input 16px; supporting labels 14px; single-column products on narrow phones.
- m2: visible selected checkmark, stronger weight and aria-pressed.
- m3: contextual Add to bag/Remove names; decorative category/repeated images silenced; specific alternative for the known default hero only (custom administrator alternatives preserved).
- Follow-ups: inert page background during cart display, focus cleanup, date-help/error association and invalid state, blocked unavailable-date submission, busy state. Native browser required-field validation and live checkout error announcements retained.

## Executed evidence
Production build passed, including TypeScript. ESLint passed. Three focused tests passed: modal focus/isolation/restoration; unavailable-date error association; mocked failed checkout preserving entered details.
Visible Chromium local production-build checks at 1280, 390 and 320 CSS-pixel viewport widths: no horizontal overflow; inspected controls at least 44px high; 16px product text. Keyboard skip link, initial close-button focus, forward/reverse containment, Escape and restored cart focus passed. Background inert verified. Date description and stronger borders verified. Text enlarged to 200% without horizontal overflow. Bespoke 320px reflow and forced-colours focus checked. No browser page errors collected.
See browser-results.json, contrast.json, build.log, lint.log, tests.log and screenshots. Browser checks used local snapshot and disabled payments. No real order or enquiry submitted.

## Limits
No VoiceOver/NVDA run, complete WCAG certification or full administrator/payment audit. No dark theme exists; optional audit dark-mode tokens were not added as an unrequested mode. Earlier vision simulations are supporting evidence, not a new full-page simulation. The install reported seven existing high dependency advisories; no unrelated dependency upgrade was included. Logo artwork is exempt from WCAG text-contrast thresholds; gold is decorative, not small UI text.
