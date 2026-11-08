# Asia Engineering Pte Ltd — Website

Company website for **Asia Engineering Pte Ltd** (UEN 202433164C), Singapore — electrical works and supply of machinery to construction sites.

## Structure
```
index.html            # single-page site
assets/css/style.css  # styles & animations
assets/js/main.js     # intro, cursor, breaker switch, skyline, scroll effects, form
assets/img/           # logos, split logo pieces (mark-a / mark-e / mark-bolt) and favicon
```

## Highlights
- Intro: the logo assembles (A + E slide in, the bolt strikes with a flash)
- Hero "main switch": flip it to light up the animated Singapore skyline and cranes
- Words light up as you scroll the About statement
- Services ride horizontally while scrolling (swipe on mobile)
- Neon stats, filterable supply yard, circuit-board process timeline, custom cursor and sparks

## Run locally
Open `index.html` in a browser, or serve the folder:
```
python3 -m http.server 8000
```

## Deploy
Static site — works on GitHub Pages, Netlify, Vercel or any web host. No build step.

## Notes
- The quotation form opens the visitor's email app addressed to `adminasiaeng@gmail.com`.
  To receive submissions directly, connect it to a form service (e.g. Formspree) later.
- Add a phone / WhatsApp number in the Contact section and footer when available.
