# INFINITE TV — reference implementation QA

final result: passed

## Evidence and exact references

- The user supplied a yellow CRT room photograph and an aged diary-window image. The latest request assigns the reference's aging/material language to the landing scene; it is not a request to duplicate a blank page layout.
- Source assets were opened and inspected. Final actual captures: `validation/desktop.png`, `validation/mobile.png`, `validation/curatorial-desktop.png`, `validation/curatorial-mobile.png`.
- Source/implementation comparison boards were made and inspected: `validation/design-comparison.png` and `validation/diary-comparison.png`.
- Fixed initial camera depth is 0, paused, signal time 8. The DOM desktop viewport is 1440 × 900; the screenshot tool returns 1417 × 900. Reference and page regions were scaled proportionally for comparison.

## Findings resolved

1. [P2] The original photograph's rectangular room boundary made the opening television look pasted on. Only absolute layer 0 now uses an alpha-transparent foreground, shared wall/cabinet and contact shadows. Inner photographic rooms retain their original content.
2. [P2] The source plant ended at a vertical photograph edge. Image editing restored natural leaf endings within the frame; no straight cut remains in the final opening capture.
3. [P2] The first scene appeared too new. The final foreground uses faded ochre plastic, rubbing, seam dust and scratches, with a warm mottled paper wall sampled from the supplied diary template.
4. [P2] A temporary DV softness experiment was rejected by the user. Blur and downsampling were removed. The final capture retains native render detail with mild saturation/contrast fading only.
5. [P2] The note did not match the selected diary template. It now uses the actual supplied frame with nine-slice scaling, native scrolling and live bilingual text. Header/footer artwork retains its relative scale across widths.
6. [P2] The note's earlier return control could scroll offscreen. The final user-selected close action is a transparent semantic button over the top-right plus icon, fixed to the window chrome. Both desktop and mobile clicks pass. The redundant return text is removed.

## Fidelity surfaces

- Typography: Chinese uses the local 12px Fusion Pixel face, with readable scaled sizes. Unicode coverage preserves the existing system monospace English. Chinese paragraphs precede their English translations. Browser title is exactly INFINITE TV.
- Spacing/layout: television remains the central focal point. Wide views extend the room; mobile retains the single-subject layout. The diary intentionally changes its blank middle area's height to fit the viewport while preserving chrome proportions.
- Colors/materials: cream paper, tarnished ochre casing, dusty dark seams and warm wood follow the supplied visual direction. The earlier cold black prototype is superseded by explicit user direction.
- Images: original photograph and diary image are local. The opening cutout was edited with imagegen; it does not introduce an AI model/API into the running browser. Source, prompt and licenses are documented in ASSETS.md.
- Copy: the original conceptual note and its translation stay live/selectable. The template's embedded title and toolbar are retained as supplied artwork. Nonessential toolbar pictograms are decorative.

## Functional and rendering checks

- Opening from playback pauses; plus-close resumes. Opening from pause and closing preserves pause.
- Top-right close button is 44 × 44 CSS px and stays visible when text scrolls. Escape/backdrop/red-dot closure remains available.
- Chinese/English content wraps inside the paper area on a 390 × 844 viewport; no horizontal overflow.
- Eight unit tests and final typecheck/production builds pass. Production page was actually opened and its note close action checked; no console errors/warnings.
- Latest integer-depth, ancestor-removal and million-layer comparisons show zero pixels with channel jumps above 20/255 outside the changing HUD. Raw metrics are in VALIDATION.md.

## Remaining P3 / validation limits

- The source remains a grainy low-resolution photograph, so very deep camera passes inherit that photographic detail limit.
- Other diary toolbar icons are part of the supplied decorative artwork, outside the reading/close flow.
- Simulated mobile viewports do not replace physical iOS Safari verification. No physical-device frame-rate or overnight stability claim is made.


## Publication review — 2026-10-16

The author link reads exactly `@ 马路Milo` and targets the supplied personal site. Sparse opening rain uses the shared simulation clock and fades before the first integer boundary. Paused screenshots were pixel-identical. Updated English text, 390 × 844 layout and the actual production page were checked without console errors. Current evidence is in RELEASE_REVIEW.md and validation/release-*.png.
