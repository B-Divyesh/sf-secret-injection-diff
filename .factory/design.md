# Visual thesis: the credential conservatory

## Direction

Secret Injection Diff uses **surreal editorial scenery**. A cutaway glass conservatory stands in for a software system. Luminous seed capsules travel through transparent pipes into named chambers. The scene makes an invisible boundary problem visible without suggesting that the tool can see secret values.

The interface borrows its hierarchy from a field journal: large serif headlines, compact marginal notes, numbered captions, and ink-like rules. Product output remains a restrained monospaced ledger. This is not a generic dashboard and has no gradient hero, floating feature cards, or decorative software icons.

## Palette

The site is intentionally single-mode, like a printed night edition.

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#F4EEDC` | Primary text on the dark ground |
| `--night` | `#101917` | Page background |
| `--moss` | `#1C2A25` | Raised surfaces |
| `--sage` | `#AFCDBB` | Muted text and quiet rules |
| `--acid` | `#D8F05B` | Primary action and focus |
| `--acid-ink` | `#17200D` | Text on the primary action |
| `--coral` | `#FF8D70` | Added edges and warnings |
| `--ice` | `#9ED8D5` | Existing edges and links |
| `--paper` | `#F2E8CC` | Light editorial inserts |

All normal text pairs meet WCAG AA. Color always has a word or symbol beside it in change output.

## Type

- Display: Georgia, Times New Roman, serif. Its high contrast and bookish shape carry the editorial voice without a font download.
- Body and utility: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace. The same family connects the page to command output.
- Scale: 16, 18, 24, 36, and fluid 64 px. Body line-height is 1.55. Reading measure tops out at 68 characters.

System fonts keep the first load small and make the site work offline without third-party requests.

## Spacing and shape

- Base unit: 8 px. Section rhythm: 80–128 px desktop and 64–80 px mobile.
- Content width: 1184 px. Text columns: 640 px maximum.
- Corners use clipped diagonal cuts, echoing redacted paper labels rather than rounded SaaS cards.
- Fine one-pixel rules and specimen numbers separate sections before boxes do.

## Interaction grammar

- The primary button behaves like a paper tab: it shifts 2 px and loses its shadow when pressed.
- Links keep a visible underline. Focus uses a 3 px acid outline with a 3 px offset.
- The demo terminal advances through a real, bundled CLI transcript when the visitor starts it. Controls remain ordinary labeled buttons.
- Route changes move focus to the new page heading and announce it.

## Motion policy

The only signature motion is **the travelling capsule**: small dots cross the hero pipes once when the scene enters, then stop. UI transitions last 180–260 ms and use only opacity and transforms. Under `prefers-reduced-motion: reduce`, every element appears in its final position and the demo transcript renders without timed playback.

## Original asset plan and provenance

- `hero-conservatory.webp`: generated for this product with `/opt/fleet/lib/gen-image.sh` using the factory image deployment. The exact prompt and deployment are stored in `site/public/assets/hero-conservatory.provenance.json`. The generated raster is original project art and is optimized to a 132 KB WebP. A responsive 640 px version is 41 KB.
- `social-card.webp`: a 1200×630 crop composed from the same original scene with CSS-free image tooling. It contains no required text.
- Wordmark, favicon, and disclosure-path symbols are hand-made SVG/CSS geometry in this repository. They contain no borrowed marks.

## Responsive intent

At 390 px, the art follows the action and the terminal becomes a horizontally scrollable ledger with a visible instruction. Editorial marginalia moves into the document flow. Navigation keeps only Demo and Install; legal links stay in the footer. No fixed bars cover content.
