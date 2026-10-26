# Resume Sources

Only two documents are maintained here:

- `resume_en.tex`: the English resume, renamed from `resume_updated.tex`.
- `resume_zh.tex`: the Chinese resume, renamed from `resume-zh_CN.tex`.

The 2026-10-26 cleanup preserves both original document bodies, including dates,
publication statuses, contact details, and comments. The Chinese version is an
older resume, not a translation of the current English version. Content updates
are a separate task. Do not treat either draft as an automatically updated CV.

## Build locally

From the repository root:

```sh
make -C resume/source       # Build both languages
make -C resume/source en    # English only
make -C resume/source zh    # Chinese only
```

Outputs:

- `build/resume_en.pdf`
- `build/resume_zh.pdf`

The build prefers a local TinyTeX installation in `resume/.tools/TinyTeX/`.
If that directory is absent, it uses `latexmk` and `xelatex` from `PATH`.
For another installation, pass its absolute binary directory:

```sh
make -C resume/source TEXBIN=/absolute/path/to/texlive/bin/x86_64-linux
```

`make -C resume/source clean` removes only the named resume build products. It
does not delete the published PDFs in `resume/` or unrelated PDFs.

## Set up another computer

Use XeLaTeX, matching the original Overleaf project. Install TeX Live, MacTeX,
MiKTeX, or [TinyTeX](https://yihui.org/tinytex/faq/), including `latexmk`.
For a minimal TeX Live / TinyTeX installation, install these dependencies:

```sh
tlmgr install latexmk xetex fontspec geometry hyperref url tools \
  xltxtra realscripts metalogo xifthen ifmtarg progressbar nth titlesec enumitem setspace cite \
  fontawesome xecjk fandol
```

The current Linux setup uses TinyTeX v2026.10 (TeX Live 2026), installed locally
without root privileges or changes to shell startup files. The toolchain is not
committed to Git, so a fresh clone needs its own TeX installation.

## Shared files and fonts

- `resume.cls`: the original shared layout, with a Font Awesome file-loading
  fix for portable TeX installations, text-only bookmarks, and unique page
  anchors; the original icon scale is preserved.
- `linespacing_fix.sty`: the original spacing helper.
- `resume_chinese.sty`: Chinese font configuration using the TeX-distributed
  [Fandol fonts](https://ctan.org/pkg/fandol), replacing the incomplete Adobe set.
- `fonts/Main/`: the original Latin fonts, retained for consistent typography.
- Font Awesome icons come from the standard `fontawesome` TeX package instead
  of a local copy of its style, symbol tables, and font.
- `LICENSE`: the original template license; it does not override font licenses.

For Overleaf, upload this source directory without `build/`, set the compiler to
XeLaTeX, and choose either `resume_en.tex` or `resume_zh.tex` as the main document.

The local build was checked with Ghostscript rendering and PyMuPDF text/link
extraction: English is one page and Chinese is two pages. Fandol uses Adobe-GB1
character mappings; text extractors need CJK mapping support. The installed
`pypdf` extractor does not decode this Chinese text correctly, while PyMuPDF does.
The PDF converter still reports `Invalid glyph name component in "_388"`.
Both PDFs render correctly in the checked pages, with no missing-character or
overflow warnings in the LaTeX logs; the original Latin fonts remain unchanged.

## Original drafts and publishing

Unrelated template examples and the sample avatar were removed without backups.
The four original personal drafts are retained locally in
`resume/.archive/2026-10-26/`; they are not additional maintained versions.
That archive, the local toolchain, and build output are ignored by Git.

Building does not publish or overwrite `resume/Snowball_Resume_CN.pdf`. Review
the generated PDF before explicitly updating that public file. The website's
existing CV links remain unchanged.
