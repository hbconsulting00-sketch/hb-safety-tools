'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

// ── Verified source links (client-side, for rendering only) ──────────────
const SOURCES = {
  safety_admin_main:     { title: 'מינהל הבטיחות — משרד העבודה', url: 'https://www.gov.il/he/departments/units/safety-and-occupational-health-contacts', cat: 'gov' },
  safety_mgmt_plan:      { title: 'תוכנית לניהול בטיחות — משרד העבודה', url: 'https://www.gov.il/he/Departments/General/safety-management-plan', cat: 'gov' },
  nevo_pikuach:          { title: 'חוק ארגון הפיקוח על העבודה, התשי"ד-1954', url: 'https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%90%D7%A8%D7%92%D7%95%D7%9F_%D7%94%D7%A4%D7%99%D7%A7%D7%95%D7%97_%D7%A2%D7%9C_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94', cat: 'law' },
  nevo_safety_ordinance: { title: 'פקודת הבטיחות בעבודה [נוסח חדש], התש"ל-1970', url: 'https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%94%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA_%D7%91%D7%A2%D7%91%D7%95%D7%93%D7%94', cat: 'law' },
  nevo_safety_plan_2013: { title: 'תקנות ארגון הפיקוח (תכנית לניהול הבטיחות), התשע"ג-2013', url: 'https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%90%D7%A8%D7%92%D7%95%D7%9F_%D7%94%D7%A4%D7%99%D7%A7%D7%95%D7%97_%D7%A2%D7%9C_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_(%D7%AA%D7%9B%D7%A0%D7%99%D7%AA_%D7%9C%D7%A0%D7%99%D7%94%D7%95%D7%9C_%D7%94%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA)', cat: 'law' },
  nevo_safety_committees:{ title: 'תקנות ארגון הפיקוח (ועדות בטיחות), התשכ"א-1961', url: 'https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%90%D7%A8%D7%92%D7%95%D7%9F_%D7%94%D7%A4%D7%99%D7%A7%D7%95%D7%97_%D7%A2%D7%9C_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_(%D7%95%D7%A2%D7%93%D7%95%D7%AA_%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA_%D7%95%D7%A0%D7%90%D7%9E%D7%A0%D7%99_%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA)', cat: 'law' },
  nevo_safety_officers:  { title: 'תקנות ארגון הפיקוח (ממונים על הבטיחות), התשנ"ו-1996', url: 'https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%90%D7%A8%D7%92%D7%95%D7%9F_%D7%94%D7%A4%D7%99%D7%A7%D7%95%D7%97_%D7%A2%D7%9C_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_(%D7%9E%D7%9E%D7%95%D7%A0%D7%99%D7%9D_%D7%A2%D7%9C_%D7%94%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA)', cat: 'law' },
  nevo_training:         { title: 'תקנות ארגון הפיקוח (הדרכת עובדים), התשנ"ט-1999', url: 'https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%90%D7%A8%D7%92%D7%95%D7%9F_%D7%94%D7%A4%D7%99%D7%A7%D7%95%D7%97_%D7%A2%D7%9C_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_(%D7%9E%D7%A1%D7%99%D7%A8%D7%AA_%D7%9E%D7%99%D7%93%D7%A2_%D7%95%D7%94%D7%93%D7%A8%D7%9B%D7%AA_%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D)', cat: 'law' },
  nevo_height:           { title: 'תקנות הבטיחות בעבודה (עבודה בגובה), התשס"ז-2007', url: 'https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%94%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA_%D7%91%D7%A2%D7%91%D7%95%D7%93%D7%94_(%D7%A2%D7%91%D7%95%D7%93%D7%94_%D7%91%D7%92%D7%95%D7%91%D7%94)', cat: 'law' },
  nevo_hazardous:        { title: 'חוק החומרים המסוכנים, התשנ"ג-1993', url: 'https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%94%D7%97%D7%95%D7%9E%D7%A8%D7%99%D7%9D_%D7%94%D7%9E%D7%A1%D7%95%D7%9B%D7%A0%D7%99%D7%9D', cat: 'law' },
  nevo_noise:            { title: 'תקנות הבטיחות בעבודה (גיהות תעסוקתית ברעש), התשמ"ד-1984', url: 'https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%94%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA_%D7%91%D7%A2%D7%91%D7%95%D7%93%D7%94_(%D7%92%D7%99%D7%94%D7%95%D7%AA_%D7%AA%D7%A2%D7%A1%D7%95%D7%A7%D7%AA%D7%99%D7%AA_%D7%95%D7%91%D7%A8%D7%99%D7%90%D7%95%D7%AA_%D7%94%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D_%D7%91%D7%A8%D7%A2%D7%A9)', cat: 'law' },
  nevo_accidents:        { title: 'פקודת התאונות ומחלות משלח-יד, 1945', url: 'https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%94%D7%AA%D7%90%D7%95%D7%A0%D7%95%D7%AA_%D7%95%D7%9E%D7%97%D7%9C%D7%95%D7%AA_%D7%9E%D7%A9%D7%9C%D7%97_%D7%99%D7%93_(%D7%94%D7%95%D7%93%D7%A2%D7%94)', cat: 'law' },
  nevo_monitoring:       { title: 'תקנות הבטיחות בעבודה (ניטור סביבתי), התשע"א-2011', url: 'https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%94%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA_%D7%91%D7%A2%D7%91%D7%95%D7%93%D7%94_(%D7%A0%D7%99%D7%98%D7%95%D7%A8_%D7%A1%D7%91%D7%99%D7%91%D7%AA%D7%99_%D7%95%D7%A0%D7%99%D7%98%D7%95%D7%A8_%D7%91%D7%99%D7%95%D7%9C%D7%95%D7%92%D7%99_%D7%A9%D7%9C_%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D_%D7%91%D7%92%D7%95%D7%A8%D7%9E%D7%99%D7%9D_%D7%9E%D7%96%D7%99%D7%A7%D7%99%D7%9D)', cat: 'law' },
  mlg_main:              { title: 'המוסד לבטיחות ולגיהות (מל"ג)', url: 'https://www.osh.org.il/', cat: 'mlg' },
  mlg_publications:      { title: 'חוקים ותקנות בבטיחות — מל"ג', url: 'https://www.osh.org.il/heb/info/laws/laws_list/', cat: 'mlg' },
};

const QUICK_TERMS = [
  'ממונה בטיחות','ועדת בטיחות','תוכנית ניהול בטיחות','LOTO',
  'ציוד מגן אישי','תאונת עבודה','הערכת סיכונים','עבודה בגובה',
  'חומרים מסוכנים','כשירות עובדים','Stop Work Authority',
  'חקירת תאונות','מוכנות לחירום','ביקורת בטיחות',
];

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function download(html, filename) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ════════════════════════════════════════════════════════════════
export default function Page() {
  const [tab, setTab]           = useState(0);

  // Plan checker
  const [file, setFile]         = useState(null);
  const [b64, setB64]           = useState(null);
  const [planLoading, setPL]    = useState(false);
  const [planResult, setPR]     = useState(null);
  const [planError, setPE]      = useState('');
  const [procLoading, setProc]  = useState(false);
  const [procText, setProcText] = useState('');
  const [procError, setProcErr] = useState('');
  const fileRef = useRef(null);

  // Dictionary
  const [termInput, setTermInput] = useState('');
  const [dictLoading, setDL]      = useState(false);
  const [dictResult, setDR]       = useState(null);
  const [dictError, setDE]        = useState('');

  // Collection
  const [terms, setTerms]         = useState([]);
  const [termsLoading, setTL]     = useState(false);

  // Toast
  const [toast, setToast]         = useState({ show: false, msg: '', type: '' });
  const toastTimer = useRef(null);

  useEffect(() => { fetchTerms(); }, []);

  // ── Toast ────────────────────────────────────────────────────
  function showToast(msg, type = 'info') {
    setToast({ show: true, msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2600);
  }

  // ── Collection API ───────────────────────────────────────────
  async function fetchTerms() {
    setTL(true);
    try {
      const res  = await fetch('/api/terms');
      const data = await res.json();
      setTerms(data.terms ?? []);
    } catch { /* silent */ }
    setTL(false);
  }

  async function saveTerm() {
    if (!dictResult) return;
    const { term, definition, practical } = dictResult;
    if (terms.some(t => t.term === term)) { showToast('המושג כבר שמור', 'info'); return; }
    try {
      const res  = await fetch('/api/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term, definition, practical }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTerms(prev => [data.term, ...prev]);
      showToast('⭐ נוסף למאגר הצוות', 'success');
    } catch (e) { showToast('שגיאה: ' + e.message, 'error'); }
  }

  async function deleteTerm(id) {
    try {
      await fetch(`/api/terms/${id}`, { method: 'DELETE' });
      setTerms(prev => prev.filter(t => t.id !== id));
      showToast('הוסר מהמאגר', 'info');
    } catch (e) { showToast('שגיאה: ' + e.message, 'error'); }
  }

  // ── File upload ──────────────────────────────────────────────
  function processFile(f) {
    if (!f || f.type !== 'application/pdf') { showToast('יש להעלות קובץ PDF בלבד', 'error'); return; }
    if (f.size > 5 * 1024 * 1024) { showToast('הקובץ גדול מדי (מקסימום 5MB)', 'error'); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setB64(ev.target.result.split(',')[1]);
    reader.readAsDataURL(f);
    setPR(null); setPE(''); setProcText(''); setProcErr('');
  }

  function removeFile() {
    setFile(null); setB64(null);
    setPR(null); setPE(''); setProcText(''); setProcErr('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    processFile(e.dataTransfer.files[0]);
  }

  // ── Plan analysis ────────────────────────────────────────────
  async function analyzePlan() {
    if (!b64) return;
    setPL(true); setPR(null); setPE(''); setProcText(''); setProcErr('');
    try {
      const res  = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: b64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPR(data);
    } catch (e) { setPE(e.message); }
    setPL(false);
  }

  // ── Generate procedure ───────────────────────────────────────
  async function generateProcedure() {
    if (!planResult) return;
    setProc(true); setProcText(''); setProcErr('');
    try {
      const res  = await fetch('/api/generate-procedure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: planResult }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProcText(data.text);
    } catch (e) { setProcErr(e.message); }
    setProc(false);
  }

  // ── Dictionary search ────────────────────────────────────────
  async function searchTerm(override) {
    const t = (override ?? termInput).trim();
    if (!t) return;
    setTermInput(t);
    setDL(true); setDR(null); setDE('');
    try {
      const res  = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: t }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDR(data);
    } catch (e) { setDE(e.message); }
    setDL(false);
  }

  // ── Gap report export (client-side HTML) ─────────────────────
  function exportGapReport() {
    if (!planResult) return;
    const r    = planResult;
    const date = new Date().toLocaleDateString('he-IL');
    const gaps = r.items.filter(i => i.status !== 'found');

    const rowsAll = r.items.map(item => {
      const c = item.status === 'found' ? '#16a34a' : item.status === 'partial' ? '#d97706' : '#dc2626';
      const l = item.status === 'found' ? 'קיים' : item.status === 'partial' ? 'חלקי' : 'חסר';
      return `<tr><td style="font-weight:600">${esc(item.req)}</td><td style="text-align:center;direction:ltr">${esc(item.section)}</td><td style="color:${c};font-weight:700;text-align:center">${l}</td><td>${esc(item.found_text||'—')}</td><td>${esc(item.notes||'—')}</td></tr>`;
    }).join('');

    const rowsGap = gaps.map(item => {
      const c = item.status === 'missing' ? '#dc2626' : '#d97706';
      const l = item.status === 'missing' ? 'חסר לחלוטין' : 'חלקי';
      return `<tr><td style="font-weight:600">${esc(item.req)}</td><td style="text-align:center;direction:ltr">${esc(item.section)}</td><td style="color:${c};font-weight:700;text-align:center">${l}</td><td>${esc(item.found_text||'—')}</td><td>${esc(item.notes||'—')}</td></tr>`;
    }).join('');

    const found = r.items.filter(i => i.status === 'found').length;
    const part  = r.items.filter(i => i.status === 'partial').length;
    const miss  = r.items.filter(i => i.status === 'missing').length;

    const html = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>דוח פערים</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:32px;color:#1e293b;direction:rtl}
h1{color:#2e81c5;font-size:24px;margin-bottom:6px}.meta{color:#64748b;font-size:13px;margin-bottom:28px;padding-bottom:14px;border-bottom:2px solid #2e81c5}
.stats{display:flex;gap:14px;margin-bottom:28px}.stat{flex:1;max-width:150px;text-align:center;padding:14px;border-radius:10px;border:1px solid #e2e8f0}
.stat .num{font-size:30px;font-weight:800}.stat .lbl{font-size:12px;color:#64748b;margin-top:3px}
.green{border-color:#86efac;background:#f0fdf4}.green .num{color:#16a34a}
.yellow{border-color:#fde68a;background:#fffbeb}.yellow .num{color:#d97706}
.red{border-color:#fca5a5;background:#fef2f2}.red .num{color:#dc2626}
h3{font-size:15px;color:#2e81c5;margin:24px 0 10px;border-bottom:1px solid #e2e8f0;padding-bottom:5px}
table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:28px}
th{background:#2e81c5;color:#fff;padding:9px 12px;text-align:right;font-size:12px}
td{padding:8px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top;line-height:1.5}
tr:nth-child(even) td{background:#f8fafc}
.summary{background:#eff6ff;border:1px solid #bfdbfe;border-radius:9px;padding:16px 20px;margin-top:20px}
.summary h4{color:#1d4ed8;margin-bottom:7px;font-size:14px}.summary p{font-size:13px;color:#334155;line-height:1.7}
.footer{margin-top:36px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:14px}
@media print{body{padding:16px}}</style></head><body>
<h1>דוח פערים — בדיקת תוכנית ניהול בטיחות</h1>
<div class="meta">תאריך: ${date} | תקנות ארגון הפיקוח (תכנית לניהול הבטיחות), התשע"ג-2013 | קובץ: ${esc(file?.name ?? '')}</div>
<div class="stats">
  <div class="stat green"><div class="num">${found}</div><div class="lbl">דרישות קיימות</div></div>
  <div class="stat yellow"><div class="num">${part}</div><div class="lbl">דרישות חלקיות</div></div>
  <div class="stat red"><div class="num">${miss}</div><div class="lbl">דרישות חסרות</div></div>
</div>
${gaps.length > 0 ? `<h3>⚠️ פערים שנמצאו (${gaps.length})</h3><table><thead><tr><th>דרישה</th><th>סעיף</th><th>סטטוס</th><th>מה נמצא</th><th>הערות</th></tr></thead><tbody>${rowsGap}</tbody></table>` : '<p style="color:#16a34a;font-weight:700">✅ לא נמצאו פערים — התוכנית עומדת בכל 12 הדרישות.</p>'}
<h3>📋 סיכום כל הדרישות</h3>
<table><thead><tr><th>דרישה</th><th>סעיף</th><th>סטטוס</th><th>מה נמצא</th><th>הערות</th></tr></thead><tbody>${rowsAll}</tbody></table>
<div class="summary"><h4>💡 סיכום כללי</h4><p>${esc(r.summary)}</p></div>
<div class="footer">הופק ע"י HB Safety Tools · ${date}</div>
</body></html>`;

    download(html, `דוח-פערים-${date}.html`);
    showToast('📊 דוח הפערים הורד', 'success');
  }

  // ── Procedure download ────────────────────────────────────────
  function downloadProcedure() {
    const date = new Date().toLocaleDateString('he-IL');
    const html = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>תוכנית ניהול בטיחות</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#1e293b;direction:rtl;line-height:1.8}
h1{color:#2e81c5;font-size:22px;margin-bottom:6px}.meta{color:#64748b;font-size:13px;margin-bottom:32px;padding-bottom:14px;border-bottom:2px solid #2e81c5}
pre{white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px}
@media print{body{padding:20px}}</style></head><body>
<h1>תוכנית ניהול בטיחות — טיוטה</h1>
<div class="meta">הופק: ${date} | תקנות ארגון הפיקוח (תכנית לניהול הבטיחות), התשע"ג-2013</div>
<pre>${esc(procText)}</pre>
</body></html>`;
    download(html, `תוכנית-בטיחות-${date}.html`);
  }

  // ── Glossary page export ──────────────────────────────────────
  function exportGlossaryPage() {
    const date  = new Date().toLocaleDateString('he-IL');
    const cards = terms.map(t => `<div class="card"><h2>${esc(t.term)}</h2><p><strong>הגדרה:</strong> ${esc(t.definition)}</p>${t.practical ? `<p class="prac">💼 ${esc(t.practical)}</p>` : ''}</div>`).join('');
    const html  = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>מילון בטיחות תעסוקתית</title>
<style>body{font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:32px;direction:rtl;color:#1e293b}
h1{color:#2e81c5;font-size:26px;margin-bottom:4px}.sub{color:#64748b;font-size:13px;margin-bottom:28px;padding-bottom:14px;border-bottom:2px solid #2e81c5}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px}
.card{background:#fff;border:1px solid #e2e8f0;border-right:4px solid #2e81c5;border-radius:12px;padding:18px 20px}
.card h2{font-size:17px;color:#2e81c5;margin-bottom:9px}.card p{font-size:13px;color:#334155;line-height:1.7;margin-bottom:7px}
.prac{color:#64748b;font-size:12px}
.footer{margin-top:36px;text-align:center;font-size:12px;color:#94a3b8}
@media print{.grid{grid-template-columns:repeat(2,1fr)}}</style></head><body>
<h1>מילון בטיחות תעסוקתית</h1>
<div class="sub">תאריך: ${date} | ${terms.length} מושגים | תקנות ניהול בטיחות 2013</div>
<div class="grid">${cards}</div>
<div class="footer">הופק ע"י HB Safety Tools · ${date}</div>
</body></html>`;
    download(html, `מילון-בטיחות-${date}.html`);
    showToast('📄 דף המילון הורד', 'success');
  }

  // ── Presentation export ───────────────────────────────────────
  function exportPresentation() {
    const date   = new Date().toLocaleDateString('he-IL');
    const slides = terms.map((t, i) => `<div class="slide" id="s${i}"><div class="num">${i+1}/${terms.length}</div><div class="icon">📖</div><h1>${esc(t.term)}</h1><p class="def">${esc(t.definition)}</p>${t.practical ? `<div class="prac">💼 ${esc(t.practical)}</div>` : ''}</div>`).join('');
    const html   = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>מצגת מילון בטיחות</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;background:#0d1117;direction:rtl;overflow:hidden;height:100vh}
.slide{display:none;position:absolute;inset:0;align-items:center;justify-content:center;flex-direction:column;padding:60px;text-align:center}
.slide.active{display:flex}.num{position:absolute;top:22px;left:28px;font-size:13px;color:#607090}
.icon{font-size:52px;margin-bottom:22px}h1{font-size:34px;font-weight:800;color:#fff;margin-bottom:18px;line-height:1.2}
.def{font-size:17px;color:#9aaac8;line-height:1.8;max-width:720px;margin-bottom:18px}
.prac{background:rgba(120,49,142,0.2);border:1px solid rgba(120,49,142,0.4);border-radius:11px;padding:14px 20px;font-size:14px;color:#c48ad8;max-width:720px;line-height:1.6}
.nav{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);display:flex;gap:14px}
.nav button{padding:11px 26px;background:rgba(46,129,197,0.3);border:1px solid rgba(46,129,197,0.5);border-radius:10px;color:#e8eef8;font-size:14px;font-weight:700;cursor:pointer}
.nav button:hover{background:rgba(46,129,197,0.5)}
.bar{position:fixed;bottom:0;right:0;height:3px;background:linear-gradient(90deg,#2e81c5,#93c93e);transition:width 0.3s}</style></head><body>
${slides}
<div class="nav"><button onclick="go(-1)">→ הקודם</button><button onclick="go(1)">← הבא</button></div>
<div class="bar" id="bar"></div>
<script>
let c=0,n=${terms.length};
function show(i){document.querySelectorAll('.slide').forEach((s,j)=>s.classList.toggle('active',j===i));document.getElementById('bar').style.width=((i+1)/n*100)+'%';}
function go(d){c=Math.max(0,Math.min(n-1,c+d));show(c);}
document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')go(1);if(e.key==='ArrowRight')go(-1);});
show(0);
<\/script></body></html>`;
    download(html, `מצגת-בטיחות-${date}.html`);
    showToast('📊 המצגת הורדה', 'success');
  }

  // ════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════
  const isSaved = dictResult && terms.some(t => t.term === dictResult.term);

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="logo-badge">HB</div>
        <div className="header-text">
          <h1>HB Safety Tools</h1>
          <p>כלי בינה מלאכותית לניהול בטיחות תעסוקתית</p>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tabs">
        {[
          { icon: '📋', label: 'בדיקת תוכנית ניהול בטיחות' },
          { icon: '📖', label: 'מילון בטיחות וחקיקה' },
          { icon: '⭐', label: 'המאגר המשותף', count: terms.length },
        ].map((t, i) => (
          <button key={i} className={`tab-btn${tab === i ? ' active' : ''}`} onClick={() => { setTab(i); if (i === 2) fetchTerms(); }}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
            {t.count > 0 && <span className="tab-badge">{t.count}</span>}
          </button>
        ))}
      </nav>

      <div className="main">

        {/* ── TAB 0: Plan Checker ─────────────────────────────── */}
        {tab === 0 && (
          <div>
            <div className="section-title">בדיקת תוכנית ניהול בטיחות לפי תקנות 2013</div>
            <div className="section-desc">
              העלה תוכנית ניהול בטיחות בפורמט PDF. המערכת תבדוק אותה מול כל 12 דרישות תקנות ארגון הפיקוח על העבודה (תכנית לניהול בטיחות), התשע&quot;ג-2013 — ותפיק דוח פערים ונוהל מעודכן.
            </div>

            {!file ? (
              <div
                className="upload-zone"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                onDrop={e => { e.currentTarget.classList.remove('drag-over'); handleDrop(e); }}
              >
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => processFile(e.target.files[0])} />
                <div className="upload-icon">📄</div>
                <h3>גרור PDF לכאן או לחץ להעלאה</h3>
                <p>קובץ PDF בלבד · מקסימום 5MB</p>
              </div>
            ) : (
              <div className="file-info">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{(file.size / 1024).toFixed(0)} KB</div>
                </div>
                <button className="remove-file" onClick={removeFile}>✕</button>
              </div>
            )}

            <button className="analyze-btn" disabled={!b64 || planLoading} onClick={analyzePlan}>
              {planLoading ? <><span className="spinner" style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', margin: 0 }} /> מנתח...</> : <><span>🔍</span> בדוק תוכנית לפי תקנות 2013</>}
            </button>

            {planError && <div className="error-box">⚠️ {planError}</div>}

            {planResult && (
              <>
                <PlanResults result={planResult} />
                <div className="action-btns">
                  <button className="action-btn primary" onClick={exportGapReport}>📊 ייצא דוח פערים</button>
                  <button className="action-btn" disabled={procLoading} onClick={generateProcedure}>
                    {procLoading ? '⏳ מכין נוהל...' : '✍️ הכן נוהל מעודכן'}
                  </button>
                </div>
              </>
            )}

            {procError && <div className="error-box" style={{ marginTop: 14 }}>⚠️ {procError}</div>}

            {procText && (
              <div className="procedure-box">
                <div className="procedure-box-header">
                  <h4>✍️ טיוטת תוכנית ניהול בטיחות מעודכנת</h4>
                  <button className="action-btn" style={{ minWidth: 'unset', padding: '8px 14px', fontSize: 13 }} onClick={downloadProcedure}>⬇️ הורד</button>
                </div>
                <div className="procedure-body">{procText}</div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 1: Dictionary ───────────────────────────────── */}
        {tab === 1 && (
          <div>
            <div className="section-title">מילון בטיחות — חיפוש בחקיקה ובמקורות מקצועיים</div>
            <div className="section-desc">
              הכנס מושג מעולם הבטיחות התעסוקתית וקבל הגדרה מפורטת + הפניות לסעיפים ספציפיים בחוקים ותקנות. שמור מושגים למאגר הצוות המשותף.
            </div>

            <div className="search-wrap">
              <input
                className="search-input"
                value={termInput}
                onChange={e => setTermInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchTerm()}
                placeholder="לדוגמה: ועדת בטיחות, ממונה בטיחות, LOTO..."
              />
              <button className="search-btn" disabled={!termInput.trim() || dictLoading} onClick={() => searchTerm()}>
                {dictLoading ? '...' : 'חפש'}
              </button>
            </div>

            <div className="quick-terms">
              {QUICK_TERMS.map(t => (
                <button key={t} className="quick-term" onClick={() => searchTerm(t)}>{t}</button>
              ))}
            </div>

            {dictLoading && (
              <div className="loading-wrap">
                <div className="spinner" />
                <p>מחפש בחקיקה ובמקורות מקצועיים...</p>
              </div>
            )}
            {dictError && <div className="error-box">⚠️ {dictError}</div>}
            {!dictLoading && !dictError && !dictResult && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>הזן מושג בשדה החיפוש לקבלת הגדרה והפניות לחקיקה</p>
              </div>
            )}
            {dictResult && (
              <DictResult
                result={dictResult}
                isSaved={isSaved}
                onSave={saveTerm}
              />
            )}
          </div>
        )}

        {/* ── TAB 2: Collection ────────────────────────────────── */}
        {tab === 2 && (
          <div>
            <div className="section-title">המאגר המשותף</div>
            <div className="section-desc">
              מושגים שנשמרו על ידי חברי הצוות. כולם רואים את אותו המאגר. ניתן לייצא כדף מילון מודפס או כמצגת.
            </div>

            {termsLoading && (
              <div className="loading-wrap"><div className="spinner" /><p>טוען מאגר...</p></div>
            )}

            {!termsLoading && terms.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">⭐</div>
                <p>המאגר ריק עדיין.<br />חפש מושג במילון ולחץ &quot;שמור למאגר&quot;.</p>
              </div>
            )}

            {!termsLoading && terms.length > 0 && (
              <>
                <div className="action-btns" style={{ marginBottom: 22 }}>
                  <button className="action-btn primary" onClick={exportGlossaryPage}>📄 ייצא דף מילון</button>
                  <button className="action-btn" onClick={exportPresentation}>📊 ייצא מצגת</button>
                </div>
                {terms.map(t => (
                  <div key={t.id} className="term-card">
                    <div className="term-card-body">
                      <div className="term-card-title">{t.term}</div>
                      <div className="term-card-def">{t.definition}</div>
                      {t.practical && <div className="term-card-practical">💼 {t.practical}</div>}
                    </div>
                    <button className="remove-term-btn" onClick={() => deleteTerm(t.id)} title="הסר">✕</button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      <div className={`toast${toast.show ? ' show' : ''} ${toast.type}`}>{toast.msg}</div>
    </>
  );
}

// ── Plan Results component ────────────────────────────────────────
function PlanResults({ result: r }) {
  const found   = r.items.filter(i => i.status === 'found').length;
  const partial = r.items.filter(i => i.status === 'partial').length;
  const missing = r.items.filter(i => i.status === 'missing').length;
  const statusLabel = { found: 'קיים', partial: 'חלקי', missing: 'חסר' };
  const statusIcon  = { found: '✅', partial: '⚠️', missing: '❌' };
  return (
    <div className="results-section">
      <div className="results-header">
        <h3>תוצאות הבדיקה — תקנות ניהול בטיחות 2013</h3>
        <div className="score-badge">
          <div className="score-item"><div className="dot green" /> קיים: {found}</div>
          <div className="score-item"><div className="dot yellow" /> חלקי: {partial}</div>
          <div className="score-item"><div className="dot red" /> חסר: {missing}</div>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>דרישה</th><th>סעיף</th><th>סטטוס</th><th>מה נמצא</th><th>הערות / המלצות</th></tr>
          </thead>
          <tbody>
            {r.items.map((item, i) => (
              <tr key={i}>
                <td>{item.req}</td>
                <td style={{ direction: 'ltr', textAlign: 'center' }}>{item.section}</td>
                <td><span className={`status-badge ${item.status}`}>{statusIcon[item.status]} {statusLabel[item.status]}</span></td>
                <td>{item.found_text || '—'}</td>
                <td>{item.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="summary-box">
        <h4>💡 סיכום והמלצות</h4>
        <p>{r.summary}</p>
      </div>
    </div>
  );
}

// ── Dict Result component ─────────────────────────────────────────
function DictResult({ result: r, isSaved, onSave }) {
  return (
    <div className="dict-result">
      <div className="dict-result-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📖</span>
          <h3>{r.term}</h3>
        </div>
        <button className={`save-term-btn${isSaved ? ' saved' : ''}`} onClick={onSave}>
          {isSaved ? '✅ שמור' : '⭐ שמור למאגר'}
        </button>
      </div>
      <div className="dict-result-body">
        <div className="ref-card cyan-accent" style={{ marginBottom: 6 }}>
          <h5>הגדרה</h5>
          <p>{r.definition}</p>
        </div>

        {(r.sources ?? []).length > 0 && (
          <>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: '18px 0 10px', color: 'var(--text2)' }}>📋 מקורות חקיקה</h4>
            <div className="ref-cards">
              {r.sources.map((s, i) => (
                <div key={i} className={`ref-card${s.accent === 'purple' ? ' purple-accent' : s.accent === 'cyan' ? ' cyan-accent' : ''}`}>
                  <h5>📚 {s.law}</h5>
                  <p>{s.text}</p>
                  <div style={{ marginTop: 6 }}><span className="law-tag">{s.section}</span></div>
                  {(s.source_ids ?? []).filter(id => SOURCES[id]).map(id => (
                    <a key={id} className="source-link" href={SOURCES[id].url} target="_blank" rel="noreferrer">
                      🔗 {SOURCES[id].title}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="ref-card purple-accent" style={{ marginTop: 14 }}>
          <h5>💼 משמעות מעשית לארגון</h5>
          <p>{r.practical}</p>
        </div>

        {(r.related ?? []).length > 0 && (
          <>
            <h4 style={{ fontSize: 13, fontWeight: 700, margin: '18px 0 9px', color: 'var(--text3)' }}>מושגים קשורים</h4>
            <div className="quick-terms">
              {r.related.map(t => (
                <button key={t} className="quick-term">{t}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
