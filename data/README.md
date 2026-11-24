# Publication maintenance

The publication HTML is maintained by hand. `publications.json` is a metadata
record, not a renderer. Keep it consistent with `publications.html`, selected
work and News in `index.html`, and related-work links in `research.html`.

## Site polish: 2026-11-24

Confirmed scope: fix research-tile and interest-bubble clipping and the publication
year-column width; unify the website's SWAN title; consolidate its older project
announcement; show ECA and WestWorld in the default News list; add William & Mary
doctoral research without removing internships; add gallery load/retry states and
lazy-load method figures. Preserve ODESteer's second-author wording, the confirmed
September 2026 CoRL date, and the existing resume files.

Implemented without changing the existing page design or resume content. Shared
CSS and JavaScript URLs use `v=20261124a` across all five pages.

Validation completed locally with Playwright/Chromium:

- Five pages at 18 viewport sizes, including breakpoint boundaries, narrow phones,
  tablets, desktop, and landscape: 90 combinations passed. No page overflow,
  targeted text clipping, JavaScript errors, or failed resource responses observed.
- Checked 65 local resource/link targets and anchors, SWAN title/author markers,
  News expansion, mobile navigation, and all selected-paper figures.
- Opened all 36 photos at desktop and narrow-phone widths: 72 dialogs passed.
  Touch interaction and portrait/landscape changes passed in mobile emulation.
- Network failure, HTTP error, malformed JSON, invalid schema, and a real
  15-second request timeout all recovered after retry. The empty state also passed.
- Initial testing exposed lost keyboard focus when Retry became disabled. Focus
  is now restored appropriately after success or failure. A separate test assertion
  was corrected to read text content rather than CSS-transformed uppercase text.
- One combined run lost its browser during a pending-request check. Separate
  layout and gallery reruns both passed; the cause of that browser exit was not
  established. Default combined runs now restart Chromium between these groups.

These are local Chromium results, not live GitHub Pages deployment verification or
real-device Safari/Edge testing. System font and emoji appearance can differ from
the Linux test environment.

Regression checks live in `tests/site-check.cjs`. They launch and close their own
temporary localhost server. With Playwright installed, run `node tests/site-check.cjs`.
`SITE_CHECK_GROUP=layout` or `SITE_CHECK_GROUP=gallery` runs a single group.
`PLAYWRIGHT_MODULE` can point to an existing Playwright package, and
`SITE_CHECK_OUTPUT` selects a directory for screenshots and `report.json`.

For the existing `CIL_MultiModal` installation on this host:

```sh
export PLAYWRIGHT_MODULE=/data/Snowball/anaconda3/envs/CIL_MultiModal/lib/python3.10/site-packages/playwright/driver/package
export PLAYWRIGHT_BROWSERS_PATH=/tmp/snowball-site-browsers
SITE_CHECK_GROUP=layout SITE_CHECK_OUTPUT=/tmp/snowball-site-layout \
  /data/Snowball/anaconda3/envs/CIL_MultiModal/lib/python3.10/site-packages/playwright/driver/node tests/site-check.cjs
SITE_CHECK_GROUP=gallery SITE_CHECK_OUTPUT=/tmp/snowball-site-gallery \
  /data/Snowball/anaconda3/envs/CIL_MultiModal/lib/python3.10/site-packages/playwright/driver/node tests/site-check.cjs
```

This run's reports and screenshots are in
`/tmp/snowball-site-polish-layout-20261124/` and
`/tmp/snowball-site-polish-gallery-20261124/` (temporary artifacts, not committed).

## SWAN preview

- The user requested a visible preview on 2026-10-26, with an author placeholder.
- `SHOW_SWAN_PREVIEW` in `assets/js/main.js` controls the elements marked
  `data-swan-preview`: News, selected work, the publication entry, and related work.
- Set that flag to `false` to hide them. Update the script version in the affected
  HTML pages when publishing a change so cached scripts do not show the old state.
- This is a display switch, not privacy protection. HTML, JSON, and the figure
  remain accessible if deployed. To unpublish the material, remove those files
  or entries from the served site as well.
- The venue label is `NeurIPS 2026 Workshop` and the metadata status is `workshop`.
  Use the formal title `Fast World Planner: Advantage-Aware Action-Chunk Policy
  for Online Planning` consistently in website HTML and publication metadata.
  The full arXiv preprint and shorter workshop version share one publication
  entry, but are distinct versions. Do not imply that the full version is the
  accepted workshop paper.
- Keep Jiangtao Kong first and Yuchen Wang second, both marked `*` for equal
  contribution. Lu Gan, Tianyi Zhou, and Huajie Shao have `†` for co-advising.
  Preserve the homepage's first-author wording.
- `links.arxiv` is https://arxiv.org/abs/2611.28616, publicly verified on
  2026-11-24. Both publication cards label it `arXiv (full version)`.
- `links.paper` remains null until the shorter workshop version has a public
  link. Do not use the full arXiv preprint as its substitute.
- Separate November News entries announce the full arXiv preprint and the
  workshop acceptance. Only the preprint announcement links to arXiv; the
  workshop announcement retains the project link.
- `links.code` remains null. Do not render a Code button until a public URL is
  supplied. The project URL comes from the manuscript.
- The older October project introduction was consolidated into the November
  preprint announcement. Keep the project link there rather than adding a third
  SWAN announcement. News defaults to six entries, including ECA and WestWorld;
  older entries remain under Show More.
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
