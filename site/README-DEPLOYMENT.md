# AMAN Website Rebuild — What Changed & What's Next

This is a full rebuild of amanschoolmn.github.io as a real multi-page site. Below is exactly what was fixed, what's still open, and how to ship it.

---

## What I Fixed (No Action Needed From You)

**Architecture**
- Rebuilt as **13 real HTML pages with real URLs** (`/about/`, `/admissions/`, `/apply/`, etc.) instead of one 4,500-line file with fake JS tabs. Every page now has its own address, shareable link, and browser back-button support.
- Split the single 1.02MB file into a shared `style.css`, shared `main.js`, and lightweight per-page HTML — total site weight is now **868KB across the entire site**, not per page.

**Performance**
- Extracted all 18 base64-embedded images (including duplicated og:image/twitter:image) into real, compressed files in `/assets/img/`. Deduplicated 3 identical copies of the logo into one file.
- Generated proper `favicon-32.png` and `apple-touch-icon.png` from the high-res logo instead of stretching a tiny 64×60 favicon.

**SEO**
- Every page has a unique `<title>` and meta description targeting a different search intent (curriculum, admissions, tuition, etc.)
- Added `sitemap.xml` and `robots.txt` — neither existed before.
- Added JSON-LD structured data: `EducationalOrganization` sitewide, `FAQPage` on the Admissions page (your 9 FAQs are now eligible for rich results in Google).
- Note: `SITE_URL` in the code is currently set to `https://amanschoolmn.github.io`. If you buy a custom domain (see below), that's a one-line change in `build.py` plus a rebuild.

**Trust / Content**
- Fixed **"Abdullah" → "Abdallah"** (was wrong in two places: Contact section and the Tuition supply box).
- Split the enrollment form's bundled liability-waiver-plus-media-consent checkbox into **two separate, independently-required checkboxes** — same fix applied to both the weekend school form and the summer program form.
- Resequenced the Admissions page to lead with a warm explanation of *why* the process exists before the 7-step legal process, instead of opening cold.
- Added secondary, low-commitment CTAs ("Contact Us" / "Ask a question first") next to every "Enroll Now" button.
- Built a dedicated `/about/our-team/` page.

**Code quality**
- Removed the redundant dual navigation (top nav + bottom mobile nav) — now just the one responsive nav with a hamburger menu.
- Fixed a genuine bug I found while rebuilding: the original signature-pad and "add student" JavaScript ran unconditionally on page load and would throw an error on any page that didn't have those specific form fields — harmless in the old single-page version (everything lived on one page) but would have broken every other page in a multi-page world. Fixed with proper null-checks.
- Verified: valid JS (`node --check`), balanced HTML tags, zero console errors on all 13 pages (tested with a headless browser).

---

## What I Deliberately Did NOT Fabricate

I won't invent fake trust content — that would actively hurt you if a parent noticed. These sections are built and styled, ready to fill in, honestly marked as placeholders in the meantime:

- **Testimonials** (`/student-life/`) — needs real parent quotes.
- **Additional staff bios** (`/about/our-team/`) — currently just you and Br. Abdallah. Add instructors as they join.
- **More photography** — currently only the game room photo and your headshot exist as real images. A short phone-photo session at the school would fill the new `/student-life/` gallery fast.
- **News posts** (`/news/`) — structurally ready, empty until you post something.

---

## What Still Needs You (Can't Be Done From Here)

1. **Custom domain.** `amanschoolmn.github.io` still reads as a free hobby project. Buying `amanschoolmn.org` (~$12–15/yr) and pointing it at GitHub Pages is the single highest-credibility fix left. Once you have it, tell me and I'll update every canonical URL.
2. **Google Search Console + Analytics.** I can't create accounts on your behalf. Once the new site is live, submit `sitemap.xml` in Search Console and drop in a GA4 or Plausible snippet.
3. **Payment processor.** Still CashApp/Zelle/Cash — moving to Stripe or a school-management platform (FACTS, Procare) needs your business/banking info to set up.
4. **`game-room.jpeg`** — this file already exists in your current repo but wasn't part of what you uploaded to me, so it's not in this package. Drop your existing copy into `/assets/img/game-room.jpeg` and it'll work immediately (both pages that use it already have a graceful fallback if it's missing).
5. **Legal review of `/policies/`** — I wrote a straightforward, honest privacy policy and terms page since none existed, but I'm not a lawyer and this site collects information about minors. Have it reviewed before treating it as final (there's a visible note on the page itself saying so).

---

## How to Deploy This

Your current site is a **GitHub Pages** site (`amanschoolmn.github.io`), which serves files exactly as committed — no build step. To go live:

1. In your `amanschoolmn.github.io` repository, delete the old `index.html` (or back it up somewhere first).
2. Copy every file from this package into the root of that repository, preserving the folder structure (`about/`, `admissions/`, `assets/`, etc.)
3. Add your real `game-room.jpeg` into `assets/img/`.
4. Commit and push. GitHub Pages will serve it immediately — no build process, no dependencies.
5. Submit `https://amanschoolmn.github.io/sitemap.xml` in Google Search Console.

That's it — it's the same hosting you already have, just organized as real pages instead of one file.
