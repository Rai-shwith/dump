# TASK-023: Implement Technical & On-Page SEO

## Objective
Improve search engine visibility for keywords like "dump", "dump clipboard", "online clipboard", and "copy paste online" while ensuring that user clipboard contents remain entirely private and unindexed by search engine crawlers.

## Requirements

### 1. Static Meta Tags & index.html Updates
- Update the `<title>` tag in `apps/dump-web/index.html` to be keyword-rich (e.g., "Dump | Free Online Clipboard & Secure Copy Paste").
- Update the `<meta name="description">` to include target keywords.
- Add Open Graph (OG) and Twitter card meta tags for social sharing.
- Add a `<meta name="keywords">` tag with relevant search terms.

### 2. robots.txt and sitemap.xml
- Create a `public/robots.txt` file that allows crawling of the main site but blocks crawling of dynamic clipboard routes (e.g., `Disallow: /*/raw` and possibly blocking alphanumeric paths if feasible, though `noindex` meta tags are safer).
- Create a static `public/sitemap.xml` containing the known public routes (e.g., `/`, `/docs`). 

### 3. Dynamic Meta Tags (Crucial for Privacy)
- Install `react-helmet-async` in the frontend package.
- Set up the `HelmetProvider` in the app root.
- In `HomePage.tsx` and `DocsPage.tsx`, use Helmet to inject specific titles and descriptions.
- **CRITICAL:** In `ViewPage.tsx` (or `ContentView.tsx`), inject `<meta name="robots" content="noindex, nofollow" />` to guarantee that search engines DO NOT index user clipboard contents.

### 4. Semantic HTML Optimization
- Ensure `HomePage.tsx` uses proper semantic tags (`<main>`, `<header>`, `<footer>`, `<section>`).
- Ensure there is exactly one `<h1>` tag containing primary keywords.

## Execution Flow
1. Install `react-helmet-async` (`npm install react-helmet-async`).
2. Update `index.html` with default static meta tags.
3. Create `robots.txt` and `sitemap.xml` in `apps/dump-web/public/`.
4. Wrap the app with `<HelmetProvider>`.
5. Add `<Helmet>` to page components.
6. Verify semantic tags on the homepage.
