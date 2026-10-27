.DEFAULT_GOAL := all
.PHONY: all en zh check-tools clean
.DELETE_ON_ERROR:

# Use the project-local toolchain when present; otherwise use the system PATH.
TEXBIN ?= $(firstword $(wildcard $(abspath ../.tools/TinyTeX)/bin/*))
ifneq ($(strip $(TEXBIN)),)
export PATH := $(TEXBIN):$(PATH)
LATEXMK ?= $(TEXBIN)/latexmk
else
LATEXMK ?= latexmk
endif

BUILD_DIR := build
# The website links only to the default English resume.
EN_PDF := ../Snowball_Resume.pdf
ZH_PDF := ../Snowball_Resume_ZH.pdf
STYLE_DEPS := resume.cls linespacing_fix.sty $(wildcard fonts/Main/*.otf)
LATEX_FLAGS := -xelatex -interaction=nonstopmode -halt-on-error -file-line-error -outdir=$(BUILD_DIR)

all: en zh
en: $(BUILD_DIR)/resume_en.pdf
	@if ! cmp -s "$<" "$(EN_PDF)"; then \
		cp "$<" "$(EN_PDF).tmp" && mv -f "$(EN_PDF).tmp" "$(EN_PDF)"; \
	fi
zh: $(BUILD_DIR)/resume_zh.pdf
	@if ! cmp -s "$<" "$(ZH_PDF)"; then \
		cp "$<" "$(ZH_PDF).tmp" && mv -f "$(ZH_PDF).tmp" "$(ZH_PDF)"; \
	fi

check-tools:
	@command -v "$(LATEXMK)" >/dev/null || { printf '%s\n' 'latexmk not found. See README.md for TeX setup.'; exit 1; }
	@command -v xelatex >/dev/null || { printf '%s\n' 'xelatex not found. Set TEXBIN to your TeX bin directory.'; exit 1; }

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(BUILD_DIR)/resume_en.pdf: resume_en.tex $(STYLE_DEPS) | check-tools $(BUILD_DIR)
	"$(LATEXMK)" $(LATEX_FLAGS) resume_en.tex

$(BUILD_DIR)/resume_zh.pdf: resume_zh.tex resume_chinese.sty $(STYLE_DEPS) | check-tools $(BUILD_DIR)
	"$(LATEXMK)" $(LATEX_FLAGS) resume_zh.tex

# Never touch the published PDFs in resume/ or unrelated PDFs in this directory.
clean:
	$(RM) $(addprefix $(BUILD_DIR)/resume_en.,aux fdb_latexmk fls log out synctex.gz xdv pdf) $(addprefix $(BUILD_DIR)/resume_zh.,aux fdb_latexmk fls log out synctex.gz xdv pdf)
