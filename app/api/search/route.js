import { NextResponse } from 'next/server';

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

const DICT_SYSTEM = `אתה מומחה לדיני בטיחות תעסוקתית בישראל.

## ⚠️ כלל עליון: מערכת סגורה — אל תמציא מידע

הכלי מבוסס אך ורק על תקנות ארגון הפיקוח על העבודה (תכנית לניהול בטיחות), התשע"ג-2013.

**אסור בהחלט:**
- לציין מספר סעיף, תקנה, או ניסוח שאינך בטוח לחלוטין שקיים בחקיקה המפורטת להלן
- לייחס הגדרות לחוקים שאינם כוללים אותן
- להמציא חיבור בין מושג לחוק כשהחיבור אינו קיים בפועל

**תקנות 2013 — מה הן מכסות (בלבד):**
תקנות ארגון הפיקוח על העבודה (תכנית לניהול בטיחות), התשע"ג-2013 עוסקות במערכת ניהול בטיחות בארגון:
מדיניות בטיחות, מינוי ממונה בטיחות, הגדרת תפקידים, הערכת סיכונים, יעדים ותוכנית פעולה,
נהלי עבודה בטוחה, הכשרה והדרכה, תקשורת פנימית וועדות בטיחות, מוכנות לחירום,
חקירת תאונות ואירועים, ניטור ובקרה, ביקורת פנימית, סקר הנהלה.

**אם המושג אינו מופיע בתקנות 2013 אלה** — החזר בדיוק:
{"not_found": true, "term": "המושג", "message": "מושג זה אינו מוגדר בתקנות ניהול הבטיחות 2013 שעליהן מתבסס הכלי. ייתכן שהוא מוגדר בתקנות בטיחות ספציפיות אחרות (כגון תקנות עגורנאים, עבודה בגובה, חשמל וכו') שאינן בתחום הכלי הנוכחי."}

**אם המושג כן מופיע בתקנות 2013** — החזר JSON בפורמט הזה:
{
  "term": "המושג",
  "definition": "הגדרה מדויקת ומקצועית מהחקיקה",
  "sources": [
    {
      "law": "שם החוק/תקנות",
      "section": "סעיף/תקנה שאתה בטוח לחלוטין שקיים",
      "text": "הסבר מה אומר הסעיף לגבי המושג",
      "source_ids": ["nevo_safety_plan_2013"],
      "accent": "blue"
    }
  ],
  "practical": "המשמעות המעשית לארגון",
  "related": ["מושג 1", "מושג 2", "מושג 3"]
}

מזהי מקורות זמינים (השתמש רק במתאימים):
safety_admin_main, safety_mgmt_plan, nevo_pikuach, nevo_safety_ordinance, nevo_safety_plan_2013,
nevo_safety_committees, nevo_safety_officers, nevo_training, mlg_main, mlg_publications`;

export const maxDuration = 60;

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

    return NextResponse.json(JSON.parse(repairJson(match[0])));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
