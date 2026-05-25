import { NextResponse } from 'next/server';

const MODEL = 'claude-sonnet-4-6';

const DICT_SYSTEM = `אתה מומחה לדיני בטיחות תעסוקתית בישראל.

חוקים ותקנות מרכזיים:
א. פקודת הבטיחות בעבודה [נוסח חדש], התש"ל-1970
ב. חוק ארגון הפיקוח על העבודה, התשי"ד-1954 ותקנותיו
ג. תקנות ארגון הפיקוח (תכנית לניהול בטיחות), התשע"ג-2013
ד. פקודת התאונות והמחלות המקצועיות, 1945
ה. תקנות בטיחות ספציפיות (גובה, רעש, חומרים מסוכנים, ניטור)

החזר תמיד JSON תקני בלבד ללא markdown, בפורמט הזה:
{
  "term": "המושג",
  "definition": "הגדרה מדויקת ומקצועית",
  "sources": [
    {
      "law": "שם החוק/תקנות",
      "section": "סעיף/תקנה ספציפי",
      "text": "הסבר מה אומר הסעיף לגבי המושג",
      "source_ids": ["nevo_pikuach"],
      "accent": "blue"
    }
  ],
  "practical": "המשמעות המעשית לארגון",
  "related": ["מושג 1", "מושג 2", "מושג 3"]
}

מזהי מקורות זמינים (השתמש רק במתאימים):
safety_admin_main, safety_mgmt_plan, nevo_pikuach, nevo_safety_ordinance, nevo_safety_plan_2013,
nevo_safety_committees, nevo_safety_officers, nevo_training, nevo_height, nevo_hazardous,
nevo_noise, nevo_accidents, nevo_monitoring, mlg_main, mlg_publications`;

export const maxDuration = 30;

export async function POST(request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY לא מוגדר על השרת' }, { status: 500 });
  }

  let term;
  try {
    const body = await request.json();
    term = body.term?.trim();
  } catch {
    return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 });
  }

  if (!term) {
    return NextResponse.json({ error: 'חסר מושג לחיפוש' }, { status: 400 });
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
        max_tokens: 4000,
        system: DICT_SYSTEM,
        messages: [{
          role: 'user',
          content: `הגדר את המושג מחקיקת הבטיחות הישראלית: ${term}\nהחזר JSON בלבד ללא markdown.`,
        }],
      }),
    });

    const data = await resp.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 502 });

    const raw = data.content?.[0]?.text ?? '';
    if (!raw) return NextResponse.json({ error: 'לא התקבלה תשובה' }, { status: 502 });

    const match = raw.replace(/```json|```/gi, '').trim().match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: 'לא התקבל JSON תקין' }, { status: 502 });

    return NextResponse.json(JSON.parse(match[0]));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
