# Resume Sources

Only two documents are maintained here:

- `resume_en.tex`: the English resume, renamed from `resume_updated.tex`.
- `resume_zh.tex`: the Chinese resume, renamed from `resume-zh_CN.tex`.

The initial 2026-10-26 cleanup preserved both original document bodies. The
English resume has since been updated with separate Ph.D./M.S. education,
revised research interests, six selected publications/manuscripts (including
SWAN and Hybrid Memory Replay), and a `World Models and Reinforcement Learning`
entry dated `2025--Present`, with separate bullets for WestWorld, SWAN, and
`Ongoing: Continual RL.` SWAN is labeled `Submitted to ICLR 2027`, as confirmed
by the author. The Chinese version remains an older resume, not a translation
of the current English version; synchronizing it is a separate editing task.

## Build locally

From the repository root:

```sh
make -C resume/source       # Build and update both final PDFs
make -C resume/source en    # Build and update the website's English CV
make -C resume/source zh    # Build and update the Chinese PDF only
```

Final outputs, relative to the repository root:

- `resume/Snowball_Resume.pdf`: the default English resume, used by every CV
  download link on the website.
- `resume/Snowball_Resume_ZH.pdf`: Chinese, maintained alongside the English
  version but not linked from the website's navigation or download buttons.

The former English filename `Snowball_Resume_CN.pdf` has been replaced by
`Snowball_Resume.pdf`; the build no longer produces the former filename. Both
language PDFs can be generated together, but translating or synchronizing their
content remains a separate editing step.

Compilation takes place in `resume/source/build/`. After each successful build,
the final PDF is copied into `resume/` using a temporary file and an atomic
rename. A failed compilation leaves that language's existing final PDF intact.
An identical PDF is not copied again. With the default two-language build,
each language is updated independently, so one can succeed if the other fails.

For a preview without updating the final PDF, run:

```sh
make -C resume/source build/resume_en.pdf
make -C resume/source build/resume_zh.pdf
```

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
That archive, the local toolchain, and intermediate `source/build/` output are
ignored by Git. Final PDFs directly under `resume/` are not ignored.

Building updates the local final PDFs but does not commit, push, or deploy them.
Review the PDF, then commit its source changes together with the final PDF and
push to the site's publishing branch. Once GitHub Pages finishes deployment,
the existing CV links serve the updated English PDF. Do not overwrite the
historical `resume/Snowball_Resume_CN_old.pdf` as part of this workflow.
