import { NextResponse } from 'next/server';

// Fixes raw control characters inside JSON string values (common in Claude output)
function repairJson(str) {
  let inString = false;
  let escaped = false;
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    const code = c.charCodeAt(0);
    if (escaped) { result += c; escaped = false; continue; }
    if (c === '\\' && inString) { result += c; escaped = true; continue; }
    if (c === '"') { inString = !inString; result += c; continue; }
    if (inString && code < 0x20) {
      if (c === '\n') { result += '\\n'; continue; }
      if (c === '\r') { result += '\\r'; continue; }
      if (c === '\t') { result += '\\t'; continue; }
      result += '\\u' + code.toString(16).padStart(4, '0');
      continue;
    }
    result += c;
  }
  return result;
}

const MODEL = 'claude-sonnet-4-6';

const PLAN_SYSTEM = `אתה מומחה לדיני בטיחות תעסוקתית בישראל, בעל ידע מעמיק בתקנות ארגון הפיקוח על העבודה (תכנית לניהול בטיחות), התשע"ג-2013.

## ⚠️ כלל עליון: אל תמציא — ענה אך ורק על בסיס מה שכתוב במסמך שסופק

**חוקי ברזל:**
1. "found_text" — ציטוט ישיר או פרפרזה ממה שמופיע בפועל במסמך. אם אין — השאר "".
2. "status": "found" רק אם מכוסה במפורש; "partial" אם חלקי; "missing" אם אין התייחסות.
3. אסור לסמן "found" על דרישה שלא מופיעה, גם אם "סביר שקיימת".
4. "notes" — הסבר מה חסר לפי הקריטריונים להלן בלבד, ללא הוספת דרישות מתקנות אחרות.
5. אסור להמציא שמות נהלים, מספרי טפסים, תאריכים, שמות ממונים.

## נוסח תקנות ארגון הפיקוח על העבודה (תכנית לניהול בטיחות), התשע"ג-2013

**תחולה:** מקומות עבודה עם 50+ עובדים, ומקומות שבתוספת (בתי חולים, מלונות, קניונים, שדות תעופה, מוסדות אקדמיים, חקלאות).

**הגדרות עיקריות (תקנה 1):**
- גורם סיכון: מקור, מצב או פעולה שעלולים לגרום פגיעה גופנית
- הערכת סיכונים: זיהוי גורמי סיכון + הערכת חומרה × סבירות + בחירת בקרות + תיעוד
- בקרת סיכונים: פעולות הנדסיות, אדמיניסטרטיביות ו-PPE לצמצום סיכון
- בטיחות ובריאות תעסוקתית: הגנה על גוף ובריאות העובד מסיכוני העבודה
- ניהול סיכונים: תהליך רב-שלבי ושיטתי לזיהוי, הערכה ובקרת סיכונים

**רכיבי התכנית (תקנה 5):** תיאור מקום עבודה, מדיניות בטיחות, מערך בטיחות, ניהול סיכונים, הדרכות, בדיקות ציוד, בדיקות רפואיות, היתרים, מוכנות לחירום.

## קריטריוני הערכה לכל דרישה

**תקנה 3 – מדיניות בטיחות**
found: הצהרת מדיניות כתובה + חתומה ע"י מנהל המקום + מופצת לעובדים
partial: קיימת הצהרה אבל חסר חתימה / פרסום / תוכן ברור
missing: אין הצהרת מדיניות

**תקנה 4 – ארגון ואחריות** (לפי תקנות ממונים 1996)
found: מינוי ממונה בטיחות בעל אישור כשירות + הגדרת תפקידים ואחריות לכל רמה היררכית בכתב
partial: קיים ממונה אך אחריות לא מוגדרת / תפקידים חלקיים
missing: לא מוזכר ממונה ולא הגדרת תפקידים

**תקנה 5 – הערכת סיכונים**
found: טבלת סיכונים עם: זיהוי גורמים + הערכה + בקרות שנבחרו + תיעוד
partial: זיהוי סיכונים ללא הערכה / הערכה ללא תיעוד בקרות
missing: אין הערכת סיכונים

**תקנה 6 – יעדים ותוכנית פעולה**
found: יעדים מדידים שנתיים + תוכנית ביצוע עם לוחות זמנים ואחריות
partial: יעדים ללא מדדים / תוכנית ללא לוחות זמנים
missing: אין יעדים ואין תוכנית פעולה

**תקנה 7 – נהלים ובקרות תפעוליות**
found: נהלים כתובים לפעולות מסוכנות (עבודה בגובה / חשמל / ציוד / חומרים מסוכנים)
partial: חלק מהסיכונים מכוסים בנהלים
missing: אין נהלים מבצעיים

**תקנה 8 – הכשרה והדרכה** (תקנות הדרכת עובדים 1999)
found: תוכנית הדרכות שנתית + הדרכה לעובד חדש לפני תחילת עבודה + תיעוד (שמות/תאריכים/נושאים/מדריך)
partial: יש הדרכות אבל אין תיעוד / אין תוכנית שנתית / חסרה הדרכה לעובד חדש
missing: אין הדרכות בטיחות

**תקנה 9 – תקשורת פנימית** (תקנות ועדות בטיחות 1961)
found: ועדת בטיחות מורכבת + התכנסות לפחות 8 פעמים בשנה + ערוצי דיווח לסיכונים
partial: יש ועדה אבל פחות מ-8 ישיבות / אין ערוצי דיווח ברורים
missing: אין ועדת בטיחות

**תקנה 10 – מוכנות לחירום**
found: נוהלי חירום לסוגי אירועים + תרגולי פינוי (לפחות 2 בשנה) + ציוד כיבוי/פינוי
partial: נוהלים קיימים ללא תרגולים / ציוד לא מוזכר
missing: אין נוהלי חירום

**תקנה 11 – חקירת תאונות**
found: נוהל חקירה כתוב + טפסי דיווח + תיעוד ממצאים + מנגנון למידה מאירועים
partial: יש טפסים ללא נוהל / נוהל ללא תיעוד
missing: אין התייחסות לחקירת תאונות

**תקנה 12 – ניטור ובקרה**
found: ביקורות בטיחות תקופתיות + מדדי בטיחות (KPIs) + מעקב תקלות
partial: ביקורות ללא מדדים / מדדים ללא מעקב
missing: אין ניטור ובקרה

**תקנה 13 – ביקורת פנימית**
found: ביקורת מערכת שנתית + ביצוע ע"י גורם עצמאי + תיעוד ממצאים
partial: ביקורת ללא תיעוד / לא ברור אם גורם עצמאי
missing: אין ביקורת פנימית

**תקנה 14 – סקר הנהלה**
found: סקר הנהלה בכירה + תיעוד דיון ומסקנות + מחויבות לשיפור
partial: קיים דיון ניהולי ללא תיעוד רשמי
missing: אין סקר הנהלה

החזר JSON תקני בלבד ללא markdown:
{
  "summary": "סיכום — מבוסס אך ורק על מה שנמצא במסמך",
  "score": 75,
  "items": [
    {
      "req": "שם הדרישה",
      "section": "תקנה X",
      "status": "found|partial|missing",
      "found_text": "ציטוט/פרפרזה מהמסמך, או '' אם לא נמצא",
      "notes": "מה חסר לפי הדרישה, בלי להמציא"
    }
  ]
}`;

export const maxDuration = 300;

export async function POST(request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY לא מוגדר על השרת' }, { status: 500 });
  }

  let fileBase64, textContent;
  try {
    const body = await request.json();
    fileBase64 = body.fileBase64;
    textContent = body.textContent;
  } catch {
    return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 });
  }

  if (!fileBase64 && !textContent) {
    return NextResponse.json({ error: 'חסר קובץ לניתוח' }, { status: 400 });
  }

  try {
    let fetchOptions;

    if (textContent) {
      // Word document: send as plain text, no beta header needed
      fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 8000,
          system: PLAN_SYSTEM,
          messages: [{
            role: 'user',
            content: `${textContent}\n\nנתח את תוכנית ניהול הבטיחות לעיל מול כל 12 דרישות תקנות 2013. החזר JSON בלבד ללא markdown ולא טקסט נוסף. שמור found_text קצר — עד 2 משפטים.`,
          }],
        }),
      };
    } else {
      // PDF: use document type with beta header
      fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'pdfs-2024-09-25',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 8000,
          system: PLAN_SYSTEM,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: fileBase64,
                },
              },
              {
                type: 'text',
                text: 'נתח את תוכנית ניהול הבטיחות המצורפת מול כל 12 דרישות תקנות 2013. החזר JSON בלבד ללא markdown ולא טקסט נוסף. שמור found_text קצר — עד 2 משפטים.',
              },
            ],
          }],
        }),
      };
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', fetchOptions);

    if (!resp.ok) {
      const errText = await resp.text();
      let errMsg = errText;
      try { errMsg = JSON.parse(errText).error?.message ?? errText; } catch {}
      return NextResponse.json({ error: errMsg }, { status: 502 });
    }

    const data = await resp.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 502 });
    }

    const raw = data.content?.[0]?.text ?? '';
    if (!raw) {
      return NextResponse.json({ error: 'לא התקבלה תשובה מהמודל' }, { status: 502 });
    }

    const match = raw.replace(/```json|```/gi, '').trim().match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: 'לא התקבל JSON תקין מה-AI' }, { status: 502 });
    }

    return NextResponse.json(JSON.parse(repairJson(match[0])));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
