# CLAUDE.md — HB Safety Tools

## Commands

```bash
npm run dev        # local dev server (http://localhost:3000)
npm run build      # production build
git add . && git commit -m "..." && git push origin main   # deploy (Vercel auto-deploys from GitHub)
```

**לא** משתמשים ב-`vercel --prod` ישירות — הפרויקט מוגדר לדפלוי אוטומטי מ-GitHub.

## Accounts

| Service | Account |
|---------|---------|
| Git (local config) | `hbconsulting00@gmail.com` / `HB Consulting` |
| Vercel CLI | `hbconsulting00@gmail.com` |
| GitHub repo | `hbconsulting00-sketch/hb-safety-tools` |
| Vercel project | `hbconsulting/hb-safety-tools` → `hb-safety-tools.vercel.app` |

לפני שמתחילים לעבוד — הרצי `.\start.ps1` בתיקייה זו.

## Architecture

Next.js 15.5.8 App Router. האפליקציה כולה ב-`app/page.js` (single page, 3 טאבים).

| Tab | Hebrew | Purpose |
|-----|--------|---------|
| 0 | בדיקת תוכנית ניהול בטיחות | Upload PDF/DOCX → gap analysis → improved procedure |
| 1 | מילון בטיחות וחקיקה | Search Israeli safety law terms |
| 2 | המאגר המשותף | Saved analyses + saved glossary terms |

## API Routes (`app/api/`)

| Route | Timeout | What it does |
|-------|---------|--------------|
| `analyze/route.js` | 300s | PDF (base64) or Word (plain text) → Claude → 12-chapter gap analysis JSON |
| `generate-procedure/route.js` | 300s | Gap analysis JSON → improved procedure text (returns `{ text }`) |
| `search/route.js` | 60s | Term → Claude → legal definition JSON |
| `analyses/route.js` | — | GET list / POST save analysis (Supabase) |
| `analyses/[id]/route.js` | — | DELETE saved analysis |
| `terms/route.js` | — | GET list / POST save term (Supabase) |
| `terms/[id]/route.js` | — | DELETE saved term |
| `health/route.js` | — | GET — returns `{ ok, hasAnthropicKey, ... }` |

## Critical: generate-procedure

- `max_tokens: 5000` — עברית דורשת ~3 טוקנים למילה; מעל 5000 עלול לחרוג מ-300 שניות
- מחזיר `NextResponse.json({ text })` — **לא streaming**
- הקליינט קורא עם `res.json()` ומציג דרך `renderMarkdown()` ב-`page.js`

## Data Layer

`lib/supabase.js` — `createServerClient()` uses service role key. Two tables:
- `saved_analyses` — `id UUID, name TEXT, summary TEXT, score INTEGER, items JSONB, created_at TIMESTAMPTZ`
- `saved_terms` — `id UUID, term TEXT, definition TEXT, practical TEXT, created_at TIMESTAMPTZ`

## Export Formats

| Format | Package | Notes |
|--------|---------|-------|
| DOCX | `docx` (npm) | Hebrew: `bidirectional: true` + `AlignmentType.RIGHT` |
| XLSX | `xlsx` (npm) | RTL via `ws['!dir'] = 'rtl'` |

## File Upload

`processFile()` ב-`page.js` מקבל `.pdf` ו-`.docx`:
- **PDF**: base64 → analyze route עם `anthropic-beta: pdfs-2024-09-25`. מגבלה: 3MB
- **DOCX**: mammoth.js (CDN) מחלץ טקסט client-side → נשלח כ-`textContent`. מגבלה: 5MB

## Environment Variables (Vercel only — never in code)

- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` — `https://filhprlnxpwncikcuszg.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`

## Common Issues

**Deployment blocked** — Vercel דורש push מ-GitHub ולא CLI ישיר. תמיד לדחוף דרך `git push`.

**Git email שגוי** — הרצי `.\start.ps1` כדי להגדיר `hbconsulting00@gmail.com` לפרויקט זה.

**Timeout ב-generate-procedure** — אם יחזור: הורידי את `max_tokens` ב-`app/api/generate-procedure/route.js`. מגבלת Vercel Pro: 300 שניות.

**"Cannot find module 'docx'"** — אם מופיע בפרוד: ודאי ש-`package.json` כולל `docx` ו-`xlsx` ועשי push.
