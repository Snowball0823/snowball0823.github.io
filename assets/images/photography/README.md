# Photography Assets

Place selected photography images in this folder and reference them from
`data/photos.json`.

Gallery workflow:

- `gallery/` keeps the selected source images for future recrops or exports.
- `curated/` contains compressed, English-named images used by the website.
- The current public gallery is driven by `data/photos.json`.
- Use `layout` in `data/photos.json` to tune the editorial grid. Supported
  values are `standard`, `wide`, `large`, `tall`, and `square`.

Hero background:

- Save one image as `hero.jpg` in this folder to use it as the blurred
  background on the Photography landing section.
- A wide landscape frame or a high-contrast portrait frame can work. The current
  layout treats the image as a blurred atmospheric layer, so choose a photo with
  strong light, color, or silhouette rather than tiny detail.

Example:

```json
{
  "src": "assets/images/photography/example.jpg",
  "title": "Frame title",
  "category": "Travel",
  "location": "Iceland",
  "country": "Iceland",
  "date": "2026",
  "camera": "Sony A7",
  "tags": ["travel", "coast", "winter"],
  "caption": "A short note about light, place, or motion.",
  "layout": "wide"
}
```
