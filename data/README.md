# Publication maintenance

The publication HTML is maintained by hand. `publications.json` is a metadata
record, not a renderer. Keep it consistent with `publications.html`, selected
work and News in `index.html`, and related-work links in `research.html`.

## SWAN preview

- The user requested a visible preview on 2026-10-26, with an author placeholder.
- `SHOW_SWAN_PREVIEW` in `assets/js/main.js` controls all four elements marked
  `data-swan-preview`: News, selected work, the publication entry, and related work.
- Set that flag to `false` to hide them. Update the script version in the affected
  HTML pages when publishing a change so cached scripts do not show the old state.
- This is a display switch, not privacy protection. HTML, JSON, and the figure
  remain accessible if deployed. To unpublish the material, remove those files
  or entries from the served site as well.
- Status is `Manuscript, 2026`, not an accepted conference paper. Author order
  and contribution marks are pending; do not infer them from the anonymous PDF.
- `links.paper` and `links.code` are null. Do not render buttons until real public
  URLs are supplied. The project URL comes from the manuscript.
- The October News date is this homepage introduction, not a claimed acceptance
  or arXiv release date.
- `assets/images/figures/swan-pipeline.png` is Figure 2 from page 4 of
  `ICLR_SWAN.pdf`, exported on white at 450 dpi (2513 x 844 pixels). The PDF crop
  is (105, 578, 507, 713) in PDF points. The source manuscript is not copied here.

## Lens

- News uses June 2026 acceptance, as reported by the first author:
  https://v-enzo.github.io/
- Publication grouping uses TMLR 2026. The official index lists July 2026:
  https://jmlr.org/tmlr/papers/
- Official paper: https://openreview.net/forum?id=cGDwTgnJIR
- Keep the 2024 arXiv link as an additional version, not a second publication.
