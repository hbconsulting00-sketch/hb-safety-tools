import { NextResponse } from 'next/server';

// Fixes raw control characters inside JSON string values (common in Claude output)
function repairJson(str) {
  let inString = false;
  let escaped = false;
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (escaped) { result += c; escaped = false; continue; }
    if (c === '\\' && inString) { result += c; escaped = true; continue; }
    if (c === '"') { inString = !inString; result += c; continue; }
    if (inString && c === '\n') { result += '\\n'; continue; }
    if (inString && c === '\r') { result += '\\r'; continue; }
    if (inString && c === '\t') { result += '\\t'; continue; }
    result += c;
  }
  return result;
}

const MODEL = 'claude-sonnet-4-6';

const PLAN_SYSTEM = `אתה מומחה לדיני בטיחות תעסוקתית בישראל, בעל ידע מעמיק בתקנות ארגון הפיקוח על העבודה (תכנית לניהול בטיחות), התשע"ג-2013.

דרישות התקנות לתוכנית ניהול בטיחות (2013):
1. תקנה 3 – מדיניות בטיחות: הצהרת מדיניות חתומה ע"י המנהל הבכיר
2. תקנה 4 – הגדרת אחריות ותפקידים: מינוי ממונה בטיחות, הגדרת תפקידים היררכיים
3. תקנה 5 – הערכת סיכונים: זיהוי סיכונים, ניתוח, תיעוד והטמעת בקרות
4. תקנה 6 – יעדים ותוכנית פעולה: יעדים מדידים שנתיים ותוכנית ביצוע
5. תקנה 7 – נהלים ובקרות תפעוליות: נהלי עבודה בטוחה לפעולות מסוכנות
6. תקנה 8 – הכשרה והדרכה: תוכנית הדרכות, רישום, בדיקת אפקטיביות
7. תקנה 9 – תקשורת פנימית: ועדת בטיחות, ישיבות, ערוצי דיווח
8. תקנה 10 – מוכנות לחירום: נהלי חירום, תרגולים, ציוד כיבוי/פינוי
9. תקנה 11 – חקירת תאונות ואירועים: נוהל חקירה, טפסי דיווח, למידה מתאונות
10. תקנה 12 – ניטור ובקרה: ביקורות בטיחות תקופתיות, מדדים, מעקב תקלות
11. תקנה 13 – ביקורת פנימית: ביקורת מערכת שנתית
12. תקנה 14 – סקר הנהלה: סקר הנהלה תקופתי ותיעוד ממצאים

החזר תמיד JSON תקני בלבד ללא markdown, בפורמט הזה:
{
  "summary": "סיכום כללי של האיכות",
  "score": 75,
  "items": [
    {
      "req": "שם הדרישה",
      "section": "תקנה X",
      "status": "found|partial|missing",
      "found_text": "מה שנמצא בתוכנית (קצר)",
      "notes": "הערה / מה חסר"
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
          max_tokens: 4000,
          system: PLAN_SYSTEM,
          messages: [{
            role: 'user',
            content: `${textContent}\n\nנתח את תוכנית ניהול הבטיחות לעיל מול כל 12 דרישות תקנות 2013. החזר JSON בלבד ללא markdown ולא טקסט נוסף.`,
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
          max_tokens: 4000,
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
                text: 'נתח את תוכנית ניהול הבטיחות המצורפת מול כל 12 דרישות תקנות 2013. החזר JSON בלבד ללא markdown ולא טקסט נוסף.',
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
