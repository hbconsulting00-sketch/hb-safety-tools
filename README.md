# HB Safety Tools — Web App

כלי בינה מלאכותית לניהול בטיחות תעסוקתית. מופעל על Vercel + Supabase.

---

## שלבי הקמה

### 1. Supabase — צור מסד נתונים

1. היכנס ל-[supabase.com](https://supabase.com) → **New Project**
2. לאחר יצירת הפרויקט, לחץ **SQL Editor** ← הדבק את תוכן `supabase-schema.sql` ← **Run**
3. לך ל-**Project Settings → API** ועתיק:
   - `Project URL` → זה `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → זה `SUPABASE_SERVICE_ROLE_KEY`

---

### 2. Gemini API Key

1. היכנס ל-[aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. לחץ **Create API Key** ← זה `GEMINI_API_KEY`

---

### 3. GitHub — העלה את הקוד

```bash
git init
git add .
git commit -m "initial commit"
# צור repo חדש ב-GitHub, אחר כך:
git remote add origin https://github.com/YOUR_USERNAME/hb-safety-tools.git
git push -u origin main
```

---

### 4. Vercel — פרוס את האתר

1. היכנס ל-[vercel.com](https://vercel.com) → **Add New → Project**
2. חבר את ה-repo מ-GitHub
3. לחץ **Environment Variables** והוסף:

| שם | ערך |
|----|-----|
| `GEMINI_API_KEY` | המפתח מ-Google AI Studio |
| `NEXT_PUBLIC_SUPABASE_URL` | ה-URL מ-Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ה-service role key מ-Supabase |

4. לחץ **Deploy** — הכלי יהיה זמין בכתובת `https://hb-safety-tools.vercel.app` (או שם שתבחרי)

---

### 5. עדכונים עתידיים

כל `git push` ל-main יפרוס גרסה חדשה באופן אוטומטי ב-Vercel.

---

## ארכיטקטורה

```
Browser → Vercel (Next.js)
               ├── /api/analyze          → Gemini API (PDF analysis)
               ├── /api/search           → Gemini API (dictionary)
               ├── /api/generate-procedure → Gemini API
               └── /api/terms            → Supabase (shared collection)
```

**מפתח ה-Gemini לא נחשף לדפדפן** — כל הקריאות עוברות דרך ה-API routes של Next.js.
