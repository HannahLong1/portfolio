# Hannah Longoria — Portfolio

A plain HTML/CSS/JS one-page portfolio site. No build step — open [index.html](index.html) in a browser, or serve it locally.

## Structure

- [index.html](index.html) — page content and structure
- [styles.css](styles.css) — theme (navy/orange palette), layout, responsive rules
- [script.js](script.js) — mobile nav toggle, dark mode toggle, footer year, GitHub-powered projects grid
- [favicon.svg](favicon.svg) — browser tab icon
- [img/](img/) — profile photo

## Projects section

The Projects grid ([index.html](index.html#L134-L147)) is populated dynamically at page load by `loadGithubProjects()` in [script.js](script.js):

- Pins specific repos via `data-pinned-repos` (currently `apace-lab/LIMA,apace-lab/AFG`) — fetched individually so a missing/private repo doesn't break the section.
- Fills remaining slots (up to `data-max-repos`) with the top starred, non-fork repos from `data-github-user` (`HannahLong1`).

To feature different repos, edit those `data-*` attributes on `#projectsGrid`.

## Customizing the look

Colors, spacing, and fonts are controlled by CSS variables at the top of [styles.css](styles.css) under `:root` (light mode) and `:root[data-theme="dark"]` (dark mode). The current palette is a navy/cream/burnt-orange theme.

## Photo

[img/profile.jpg](img/profile.jpg) is a resized/compressed (~460KB) version of the original photo, with EXIF rotation baked in. If you swap in a new photo, keep it under ~1MB and roughly square for best results with the `object-fit: cover` crop in `.about-photo-img`.

## Deploying

Fully static — host for free on GitHub Pages, Netlify, Vercel, or Cloudflare Pages by pointing them at this folder.
