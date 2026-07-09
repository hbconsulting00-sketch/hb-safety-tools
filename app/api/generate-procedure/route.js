import { NextResponse } from 'next/server';

const MODEL = 'claude-sonnet-4-6';

const SYSTEM = `אתה מומחה לניסוח תוכניות ניהול בטיחות בישראל לפי תקנות ארגון הפיקוח על העבודה (תכנית לניהול בטיחות), התשע"ג-2013.

בהתבסס על דוח הפערים שיסופק לך, כתוב טיוטת תוכנית ניהול בטיחות מלאה ומקיפה שמכסה את כל 12 פרקי התקנות ומשלימה את הפערים.

כתוב בעברית תקנית ומקצועית. כלול כותרות ברורות לכל פרק, נוסח ניהולי מסודר, סעיפי ביצוע, ורשימות תיוג שימושיות.`;

export const maxDuration = 300;

export async function POST(request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY לא מוגדר על השרת' }, { status: 500 });
  }

  let analysis;
  try {
    const body = await request.json();
    analysis = body.analysis;
  } catch {
    return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 });
  }

  if (!analysis) {
    return NextResponse.json({ error: 'חסר ניתוח פערים' }, { status: 400 });
  }

  const gaps    = analysis.items.filter(i => i.status !== 'found');
  const gapText = gaps.map(g => `• ${g.req} (${g.section}): ${g.notes}`).join('\n');
  const allText = analysis.items.map(g => `${g.section} – ${g.req}: ${g.status}`).join('\n');

  const prompt = `להלן ממצאי בדיקת תוכנית ניהול בטיחות:

=== פערים שנמצאו ===
${gapText || 'לא נמצאו פערים משמעותיים'}

=== מצב כל הדרישות ===
${allText}

=== סיכום ===
${analysis.summary}

כתוב טיוטת תוכנית ניהול בטיחות מעודכנת שמכסה את כל 12 פרקי התקנות ומשלימה את הפערים. כתוב בעברית מקצועית בלבד. היה תמציתי — עד 2 פסקאות קצרות לכל פרק.`;

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
        max_tokens: 5000,
        system: SYSTEM,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await resp.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 502 });

    const text = data.content?.[0]?.text ?? '';
    if (!text) return NextResponse.json({ error: 'לא התקבלה תשובה' }, { status: 502 });

    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
