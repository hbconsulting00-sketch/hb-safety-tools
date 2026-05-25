import { NextResponse } from 'next/server';

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

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY לא מוגדר על השרת' }, { status: 500 });
  }

  let fileBase64;
  try {
    const body = await request.json();
    fileBase64 = body.fileBase64;
  } catch {
    return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 });
  }

  if (!fileBase64) {
    return NextResponse.json({ error: 'חסר קובץ PDF' }, { status: 400 });
  }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
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
    });

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

    return NextResponse.json(JSON.parse(match[0]));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
