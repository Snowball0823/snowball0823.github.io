// Display control only: hiding the preview does not remove its public assets or metadata.
const SHOW_SWAN_PREVIEW = true;

document.querySelectorAll("[data-swan-preview]").forEach((item) => {
  item.hidden = !SHOW_SWAN_PREVIEW;
});

const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelector("[data-nav-links]");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const newsToggle = document.querySelector("[data-news-toggle]");
const extraNewsItems = document.querySelectorAll("[data-news-extra]");

if (newsToggle && extraNewsItems.length > 0) {
  newsToggle.addEventListener("click", () => {
    const isExpanded = newsToggle.getAttribute("aria-expanded") === "true";

    extraNewsItems.forEach((item) => {
      item.hidden = isExpanded;
    });

    newsToggle.setAttribute("aria-expanded", String(!isExpanded));
    newsToggle.textContent = isExpanded ? "Show More" : "Show Less";
  });
}

const photoGrid = document.querySelector("[data-photo-grid]");
const photoStatus = document.querySelector("[data-photo-status]");
const photoRetry = document.querySelector("[data-photo-retry]");
const photoCount = document.querySelector("[data-photo-count]");
const photoLightbox = document.querySelector("[data-photo-lightbox]");
const photoLightboxImage = document.querySelector("[data-photo-lightbox-image]");
const photoLightboxTitle = document.querySelector("[data-photo-lightbox-title]");
const photoLightboxMeta = document.querySelector("[data-photo-lightbox-meta]");
const photoLightboxClose = document.querySelector("[data-photo-lightbox-close]");
let loadedPhotos = [];
let renderedPhotoColumnCount = 0;
let photoResizeFrame = null;
let photosLoading = false;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPhotoColumnCount() {
  if (window.matchMedia("(max-width: 520px)").matches) return 1;
  if (window.matchMedia("(max-width: 900px)").matches) return 2;
  return 3;
}

function renderPhotoCard(photo, index) {
  const title = photo.title || "Untitled";
  const location = photo.location || "";
  const caption = photo.caption || "";
  const src = photo.src || "";
  const category = photo.category || "";
  const camera = photo.camera || "";
  const date = photo.date || "";
  const focus = photo.focus || "";
  const meta = [location, date, camera].filter(Boolean).join(" · ");
  const displayMeta = [category, meta].filter(Boolean).join(" · ");
  const requestedLayout = photo.layout || "";
  const allowedLayouts = ["large", "tall", "wide", "square"];
  const visualClass = requestedLayout === "standard"
    ? ""
    : allowedLayouts.includes(requestedLayout)
    ? `photo-card-${requestedLayout}`
    : (["photo-card-large", "photo-card-tall", "", "", "photo-card-wide", ""][index % 6] || "");

  return `
    <figure class="photo-card ${visualClass}" tabindex="0" role="button" aria-label="View ${escapeHtml(title)}" data-photo-src="${escapeHtml(src)}" data-photo-title="${escapeHtml(title)}" data-photo-meta="${escapeHtml(meta)}">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(title)}" loading="lazy"${focus ? ` style="object-position: ${escapeHtml(focus)};"` : ""}>
      <figcaption>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(displayMeta)}</p>
        ${caption ? `<p>${escapeHtml(caption)}</p>` : ""}
      </figcaption>
    </figure>
  `;
}

function bindPhotoCards() {
  document.querySelectorAll(".photo-card").forEach((card) => {
    const openPhoto = () => {
      if (!photoLightbox || !photoLightboxImage) return;

      photoLightboxImage.src = card.dataset.photoSrc || "";
      photoLightboxImage.alt = card.dataset.photoTitle || "";
      if (photoLightboxTitle) photoLightboxTitle.textContent = card.dataset.photoTitle || "";
      if (photoLightboxMeta) photoLightboxMeta.textContent = card.dataset.photoMeta || "";
      photoLightbox.showModal();
    };

    card.addEventListener("click", openPhoto);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPhoto();
      }
    });
  });
}

function renderPhotoColumns(photos) {
  if (!photoGrid || !Array.isArray(photos) || photos.length === 0) return;

  const columnCount = getPhotoColumnCount();
  renderedPhotoColumnCount = columnCount;
  const columns = Array.from({ length: columnCount }, () => []);

  photos.forEach((photo, index) => {
    columns[index % columnCount].push(renderPhotoCard(photo, index));
  });

  photoGrid.innerHTML = columns
    .map((items) => `<div class="photo-column">${items.join("")}</div>`)
    .join("");

  bindPhotoCards();
}

async function renderPhotos() {
  if (!photoGrid || photosLoading) return;

  const restoreRetryFocus = photoRetry && document.activeElement === photoRetry;
  photosLoading = true;
  photoGrid.setAttribute("aria-busy", "true");
  if (photoStatus) {
    photoStatus.hidden = false;
    photoStatus.textContent = "Loading photographs...";
  }
  if (photoRetry) photoRetry.disabled = true;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("data/photos.json", {
      signal: controller.signal,
      cache: "no-cache",
    });
    if (!response.ok) throw new Error(`Gallery request failed: ${response.status}`);
    const photos = await response.json();

    if (!Array.isArray(photos) || photos.some((photo) => (
      !photo || typeof photo.src !== "string" || !photo.src.trim()
    ))) {
      throw new Error("Invalid gallery data");
    }

    loadedPhotos = photos;
    renderPhotoColumns(loadedPhotos);
    if (photoCount) photoCount.textContent = `${photos.length} ${photos.length === 1 ? "Frame" : "Frames"}`;
    if (photoStatus) {
      photoStatus.textContent = photos.length ? "" : "No photographs are available yet.";
      photoStatus.hidden = photos.length > 0;
    }
    if (photoRetry) {
      if (restoreRetryFocus && (
        document.activeElement === photoRetry || document.activeElement === document.body
      )) {
        const focusTarget = photoGrid.querySelector(".photo-card") || photoStatus;
        focusTarget?.focus({ preventScroll: true });
      }
      photoRetry.hidden = true;
    }
  } catch {
    if (photoStatus) photoStatus.textContent = "Photographs could not be loaded. Please try again.";
    if (photoRetry) photoRetry.hidden = false;
  } finally {
    window.clearTimeout(timeout);
    photosLoading = false;
    photoGrid.setAttribute("aria-busy", "false");
    if (photoRetry) {
      photoRetry.disabled = false;
      if (restoreRetryFocus && !photoRetry.hidden && document.activeElement === document.body) {
        photoRetry.focus({ preventScroll: true });
      }
    }
  }
}

if (photoRetry) photoRetry.addEventListener("click", renderPhotos);

renderPhotos();

if (photoGrid) {
  window.addEventListener("resize", () => {
    if (photoResizeFrame) window.cancelAnimationFrame(photoResizeFrame);
    photoResizeFrame = window.requestAnimationFrame(() => {
      const nextColumnCount = getPhotoColumnCount();
      if (loadedPhotos.length > 0 && nextColumnCount !== renderedPhotoColumnCount) {
        renderPhotoColumns(loadedPhotos);
      }
    });
  });
}

if (photoLightboxClose && photoLightbox) {
  photoLightboxClose.addEventListener("click", () => photoLightbox.close());
}

if (photoLightbox) {
  photoLightbox.addEventListener("click", (event) => {
    if (event.target === photoLightbox) photoLightbox.close();
  });
}
