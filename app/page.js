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

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ════════════════════════════════════════════════════════════════
export default function Page() {
  const [tab, setTab]           = useState(0);

  // Plan checker
  const [file, setFile]         = useState(null);
  const [b64, setB64]           = useState(null);
  const [docxText, setDocxText] = useState('');
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

  // Save analysis
  const [showSaveForm, setShowSaveForm]   = useState(false);
  const [analysisName, setAnalysisName]   = useState('');
  const [savingAnalysis, setSavingA]      = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [analysesLoading, setAL]          = useState(false);

  // Collection
  const [terms, setTerms]         = useState([]);
  const [termsLoading, setTL]     = useState(false);

  // Toast
  const [toast, setToast]         = useState({ show: false, msg: '', type: '' });
  const toastTimer = useRef(null);

  useEffect(() => { fetchTerms(); fetchAnalyses(); }, []);

  // ── Toast ────────────────────────────────────────────────────
  function showToast(msg, type = 'info') {
    setToast({ show: true, msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2600);
  }

  // ── Analyses API ─────────────────────────────────────────────
  async function fetchAnalyses() {
    setAL(true);
    try {
      const res  = await fetch('/api/analyses');
      const data = await res.json();
      setSavedAnalyses(data.analyses ?? []);
    } catch { /* silent */ }
    setAL(false);
  }

  async function saveAnalysis() {
    if (!planResult || !analysisName.trim()) return;
    setSavingA(true);
    try {
      const res  = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: analysisName.trim(), summary: planResult.summary, score: planResult.score, items: planResult.items }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSavedAnalyses(prev => [data.analysis, ...prev]);
      setShowSaveForm(false); setAnalysisName('');
      showToast('✅ הניתוח נשמר במאגר', 'success');
    } catch (e) { showToast('שגיאה: ' + e.message, 'error'); }
    setSavingA(false);
  }

  async function deleteAnalysis(id) {
    try {
      await fetch(`/api/analyses/${id}`, { method: 'DELETE' });
      setSavedAnalyses(prev => prev.filter(a => a.id !== id));
      showToast('הוסר מהמאגר', 'info');
    } catch (e) { showToast('שגיאה: ' + e.message, 'error'); }
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
  async function processFile(f) {
    if (!f) return;
    const isDocx = f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.endsWith('.docx');
    const isPdf  = f.type === 'application/pdf' || f.name.endsWith('.pdf');
    if (!isPdf && !isDocx) { showToast('יש להעלות קובץ PDF או Word (.docx) בלבד', 'error'); return; }
    if (isPdf  && f.size > 3 * 1024 * 1024) { showToast('קובץ PDF גדול מדי (מקסימום 3MB). נסי לדחוס לפני ההעלאה.', 'error'); return; }
    if (isDocx && f.size > 5 * 1024 * 1024) { showToast('קובץ Word גדול מדי (מקסימום 5MB).', 'error'); return; }
    setFile(f);
    setPR(null); setPE(''); setProcText(''); setProcErr(''); setDocxText('');
    if (isPdf) {
      setDocxText('');
      const reader = new FileReader();
      reader.onload = ev => setB64(ev.target.result.split(',')[1]);
      reader.readAsDataURL(f);
    } else {
      setB64(null);
      try {
        if (!window.mammoth) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';
            s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
          });
        }
        const arrayBuffer = await f.arrayBuffer();
        const { value: text } = await window.mammoth.extractRawText({ arrayBuffer });
        if (!text?.trim()) { showToast('לא ניתן לחלץ טקסט מהקובץ', 'error'); setFile(null); return; }
        setDocxText(text);
      } catch (e) { showToast('שגיאה בקריאת קובץ Word: ' + e.message, 'error'); setFile(null); }
    }
  }

  function removeFile() {
    setFile(null); setB64(null); setDocxText('');
    setPR(null); setPE(''); setProcText(''); setProcErr('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    processFile(e.dataTransfer.files[0]);
  }

  // ── Plan analysis ────────────────────────────────────────────
  async function analyzePlan() {
    if (!b64 && !docxText) return;
    setPL(true); setPR(null); setPE(''); setProcText(''); setProcErr('');
    try {
      const body = docxText
        ? { textContent: docxText, fileName: file?.name }
        : { fileBase64: b64 };
      const res  = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 413) throw new Error('הקובץ גדול מדי לשרת. נסי לדחוס את הקובץ.');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPR(data);
    } catch (e) { setPE(e.message); }
    setPL(false);
  }

  // ── Generate procedure (streaming) ──────────────────────────
  async function generateProcedure() {
    if (!planResult) return;
    setProc(true); setProcText(''); setProcErr('');
    try {
      const res = await fetch('/api/generate-procedure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: planResult }),
      });
      if (!res.ok) {
        const t = await res.text();
        try { throw new Error(JSON.parse(t).error); } catch { throw new Error(t || 'שגיאת שרת'); }
      }
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setProcText(prev => prev + decoder.decode(value, { stream: true }));
      }
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

  // ── Gap report export → DOCX ──────────────────────────────────
  async function exportGapReport() {
    if (!planResult) return;
    const r    = planResult;
    const date = new Date().toLocaleDateString('he-IL');
    const gaps = r.items.filter(i => i.status !== 'found');
    const found = r.items.filter(i => i.status === 'found').length;
    const part  = r.items.filter(i => i.status === 'partial').length;
    const miss  = r.items.filter(i => i.status === 'missing').length;
    const statusLabel = { found: 'קיים', partial: 'חלקי', missing: 'חסר' };
    try {
      const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
              HeadingLevel, AlignmentType, WidthType } = await import('docx');
      const p = (text, opts = {}) => new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT,
        ...opts, children: [new TextRun({ text: text ?? '', size: 22, ...opts.run })] });
      const hdrRow = () => new TableRow({ tableHeader: true, children:
        ['דרישה','סעיף','סטטוס','מה נמצא','הערות'].map(t => new TableCell({
          shading: { fill: '2E81C5', type: 'clear', color: '2E81C5' },
          children: [new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', size: 18 })] })] }))
      });
      const dataRow = (item) => new TableRow({ children: [
        new TableCell({ children: [p(item.req, { run: { bold: true } })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: item.section ?? '', size: 18 })] })] }),
        new TableCell({ children: [p(statusLabel[item.status] ?? '', { run: { bold: true } })] }),
        new TableCell({ children: [p(item.found_text ?? '—')] }),
        new TableCell({ children: [p(item.notes ?? '—')] }),
      ]});
      const doc = new Document({ sections: [{ properties: { bidi: true }, children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'דוח פערים — בדיקת תוכנית ניהול בטיחות', bold: true, size: 36, color: '2E81C5' })] }),
        p(`תאריך: ${date} | קובץ: ${file?.name ?? ''}`, { run: { size: 20, color: '64748B' } }),
        p(`✅ קיים: ${found}   ⚠️ חלקי: ${part}   ❌ חסר: ${miss}`, { run: { bold: true } }),
        new Paragraph({ children: [] }),
        ...(gaps.length > 0 ? [
          new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: true, alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `פערים שנמצאו (${gaps.length})`, bold: true, size: 28 })] }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [hdrRow(), ...gaps.map(dataRow)] }),
          new Paragraph({ children: [] }),
        ] : []),
        new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'סיכום כל הדרישות', bold: true, size: 28 })] }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [hdrRow(), ...r.items.map(dataRow)] }),
        new Paragraph({ children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'סיכום כללי', bold: true, size: 28 })] }),
        p(r.summary ?? ''),
        p(`הופק ע"י HB Safety Tools · ${date}`, { run: { size: 18, color: '94A3B8' } }),
      ]}]});
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, `דוח-פערים-${date}.docx`);
      showToast('📊 דוח הפערים הורד כ-Word', 'success');
    } catch (e) { showToast('שגיאה: ' + e.message, 'error'); }
  }

  // ── Gap report export → Excel ─────────────────────────────────
  async function exportGapReportExcel() {
    if (!planResult) return;
    const r    = planResult;
    const date = new Date().toLocaleDateString('he-IL');
    const found = r.items.filter(i => i.status === 'found').length;
    const part  = r.items.filter(i => i.status === 'partial').length;
    const miss  = r.items.filter(i => i.status === 'missing').length;
    const statusLabel = { found: 'קיים', partial: 'חלקי', missing: 'חסר' };
    try {
      const XLSX = await import('xlsx');
      const { utils, write } = XLSX;
      const rows = [
        ['דוח פערים — תוכנית ניהול בטיחות'],
        [`ציון: ${r.score ?? '—'} | קיים: ${found} | חלקי: ${part} | חסר: ${miss} | תאריך: ${date}`],
        [],
        ['דרישה', 'סעיף', 'סטטוס', 'מה נמצא', 'הערות'],
        ...r.items.map(i => [i.req, i.section, statusLabel[i.status] ?? '', i.found_text ?? '—', i.notes ?? '—']),
        [],
        [r.summary ?? ''],
      ];
      const ws = utils.aoa_to_sheet(rows);
      ws['!dir'] = 'rtl';
      ws['!cols'] = [{ wch: 28 }, { wch: 12 }, { wch: 10 }, { wch: 35 }, { wch: 35 }];
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'ניתוח פערים');
      const buf = write(wb, { type: 'array', bookType: 'xlsx' });
      downloadBlob(
        new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `דוח-פערים-${date}.xlsx`
      );
      showToast('📊 דוח הפערים הורד כ-Excel', 'success');
    } catch (e) { showToast('שגיאה: ' + e.message, 'error'); }
  }

  // ── Procedure download → DOCX ─────────────────────────────────
  async function downloadProcedure() {
    const date = new Date().toLocaleDateString('he-IL');
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
      const lines = procText.split('\n').map(line => {
        const t = line.trimEnd();
        if (!t) return new Paragraph({ children: [] });
        const isH1 = t.startsWith('# '); const isH2 = t.startsWith('## '); const isH3 = t.startsWith('### ');
        const text = isH1 ? t.slice(2) : isH2 ? t.slice(3) : isH3 ? t.slice(4) : t;
        return new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT,
          heading: isH1 ? HeadingLevel.HEADING_1 : isH2 ? HeadingLevel.HEADING_2 : isH3 ? HeadingLevel.HEADING_3 : undefined,
          children: [new TextRun({ text, bold: isH1 || isH2, size: isH1 ? 32 : isH2 ? 28 : isH3 ? 24 : 22,
            color: (isH1 || isH2) ? '2E81C5' : '1E293B' })] });
      });
      const doc = new Document({ sections: [{ properties: { bidi: true }, children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'תוכנית ניהול בטיחות — טיוטה מעודכנת', bold: true, size: 36, color: '2E81C5' })] }),
        new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: `הופק: ${date} | תקנות ארגון הפיקוח (תכנית לניהול הבטיחות), התשע"ג-2013`, size: 20, color: '64748B' })] }),
        new Paragraph({ children: [] }), ...lines,
      ]}]});
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, `תוכנית-בטיחות-${date}.docx`);
      showToast('📄 הנוהל הורד כ-Word', 'success');
    } catch (e) { showToast('שגיאה: ' + e.message, 'error'); }
  }

  // ── Export single term → DOCX ────────────────────────────────
  async function exportSingleTerm() {
    if (!dictResult) return;
    const { term, definition, practical, sources } = dictResult;
    const date = new Date().toLocaleDateString('he-IL');
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
      const p = (text, opts = {}) => new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT,
        ...opts, children: [new TextRun({ text: text ?? '', size: 22, ...opts.run })] });
      const srcChildren = (sources ?? []).flatMap(s => [
        p(`📚 ${s.law ?? ''}`, { run: { bold: true, size: 22, color: '7C3AED' } }),
        p(s.text ?? ''),
        p(s.section ?? '', { run: { size: 18, color: '3730A3' } }),
        new Paragraph({ children: [] }),
      ]);
      const doc = new Document({ sections: [{ properties: { bidi: true }, children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: term ?? '', bold: true, size: 40, color: '2E81C5' })] }),
        p(`תאריך: ${date} | מילון בטיחות תעסוקתית | HB Safety Tools`, { run: { size: 18, color: '64748B' } }),
        new Paragraph({ children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'הגדרה', bold: true, size: 26 })] }),
        p(definition ?? ''),
        new Paragraph({ children: [] }),
        ...(srcChildren.length > 0 ? [
          new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: true, alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: 'מקורות חקיקה', bold: true, size: 26 })] }),
          ...srcChildren,
        ] : []),
        ...(practical ? [
          new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: true, alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: 'משמעות מעשית לארגון', bold: true, size: 26 })] }),
          p(practical),
        ] : []),
      ]}]});
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, `${term}-${date}.docx`);
      showToast('📄 המושג יוצא כ-Word', 'success');
    } catch (e) { showToast('שגיאה: ' + e.message, 'error'); }
  }

  // ── Glossary page export → DOCX ───────────────────────────────
  async function exportGlossaryPage() {
    const date = new Date().toLocaleDateString('he-IL');
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
      const termChildren = terms.flatMap(t => [
        new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: t.term ?? '', bold: true, size: 28, color: '2E81C5' })] }),
        new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: t.definition ?? '', size: 22 })] }),
        ...(t.practical ? [new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: `💼 ${t.practical}`, size: 20, color: '64748B' })] })] : []),
        new Paragraph({ children: [] }),
      ]);
      const doc = new Document({ sections: [{ properties: { bidi: true }, children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'מילון בטיחות תעסוקתית', bold: true, size: 40, color: '2E81C5' })] }),
        new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: `תאריך: ${date} | ${terms.length} מושגים | HB Safety Tools`, size: 20, color: '64748B' })] }),
        new Paragraph({ children: [] }), ...termChildren,
      ]}]});
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, `מילון-בטיחות-${date}.docx`);
      showToast('📄 דף המילון הורד כ-Word', 'success');
    } catch (e) { showToast('שגיאה: ' + e.message, 'error'); }
  }

  // ── Presentation export → PPTX ────────────────────────────────
  async function exportPresentation() {
    const date = new Date().toLocaleDateString('he-IL');
    try {
      if (!window.PptxGenJS) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.min.js';
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const prs = new window.PptxGenJS();
      prs.layout = 'LAYOUT_WIDE';
      terms.forEach((t, i) => {
        const slide = prs.addSlide();
        slide.background = { color: '0D1117' };
        slide.addText(`${i + 1}/${terms.length}`, { x: 0.15, y: 0.12, w: 1.5, h: 0.25, fontSize: 10, color: '607090' });
        slide.addText(t.term ?? '', { x: 0.4, y: 0.55, w: 9.2, h: 0.85,
          fontSize: 30, bold: true, color: 'FFFFFF', rtlMode: true, align: 'right' });
        slide.addText(t.definition ?? '', { x: 0.4, y: 1.5, w: 9.2, h: 2.0,
          fontSize: 16, color: '9AAAC8', rtlMode: true, align: 'right', valign: 'top', wrap: true });
        if (t.practical) {
          slide.addText(`💼  ${t.practical}`, { x: 0.4, y: 3.6, w: 9.2, h: 1.3,
            fontSize: 14, color: 'C48AD8', rtlMode: true, align: 'right', wrap: true,
            fill: { color: '150822' }, line: { color: '78318E', width: 0.75 } });
        }
      });
      await prs.writeFile({ fileName: `מצגת-בטיחות-${date}.pptx` });
      showToast('📊 המצגת הורדה כ-PowerPoint', 'success');
    } catch (e) { showToast('שגיאה: ' + e.message, 'error'); }
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
          <button key={i} className={`tab-btn${tab === i ? ' active' : ''}`} onClick={() => { setTab(i); if (i === 2) { fetchTerms(); fetchAnalyses(); } }}>
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
                <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => processFile(e.target.files[0])} />
                <div className="upload-icon">📄</div>
                <h3>גרור קובץ לכאן או לחץ להעלאה</h3>
                <p>PDF (עד 3MB) או Word (.docx, עד 5MB)</p>
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

            <button className="analyze-btn" disabled={(!b64 && !docxText) || planLoading} onClick={analyzePlan}>
              {planLoading ? <><span className="spinner" style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', margin: 0 }} /> מנתח...</> : <><span>🔍</span> בדוק תוכנית לפי תקנות 2013</>}
            </button>

            {planError && <div className="error-box">⚠️ {planError}</div>}

            {planResult && (
              <>
                <PlanResults result={planResult} />
                <div className="action-btns">
                  <button className="action-btn primary" onClick={exportGapReport}>📄 ייצא דוח פערים (Word)</button>
                  <button className="action-btn" onClick={exportGapReportExcel}>📊 ייצא לExcel</button>
                  <button className="action-btn" disabled={procLoading} onClick={generateProcedure}>
                    {procLoading ? '⏳ מכין נוהל...' : '✍️ הכן נוהל מעודכן'}
                  </button>
                  <button className="action-btn" onClick={() => setShowSaveForm(s => !s)}>💾 שמור ניתוח</button>
                </div>
                {showSaveForm && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <input
                      className="search-input"
                      style={{ flex: 1 }}
                      placeholder='שם לניתוח (לדוגמה: חברת דמה בע"מ 2025)'
                      value={analysisName}
                      onChange={e => setAnalysisName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveAnalysis()}
                    />
                    <button className="action-btn primary" disabled={!analysisName.trim() || savingAnalysis} onClick={saveAnalysis}>
                      {savingAnalysis ? 'שומר...' : 'שמור'}
                    </button>
                  </div>
                )}
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
            {dictResult && dictResult.not_found && (
              <div className="empty-state" style={{ background: 'rgba(255,165,0,0.07)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: 10, padding: '24px 20px' }}>
                <div className="empty-icon">🔍</div>
                <p style={{ fontWeight: 600, marginBottom: 6 }}>"{dictResult.term}" — לא נמצא בתקנות 2013</p>
                <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7 }}>{dictResult.message}</p>
              </div>
            )}
            {dictResult && !dictResult.not_found && (
              <DictResult
                result={dictResult}
                isSaved={isSaved}
                onSave={saveTerm}
                onExport={exportSingleTerm}
              />
            )}
          </div>
        )}

        {/* ── TAB 2: Collection ────────────────────────────────── */}
        {tab === 2 && (
          <div>
            <div className="section-title">המאגר המשותף</div>
            <div className="section-desc">
              מושגים וניתוחי פערים שנשמרו על ידי חברי הצוות. כולם רואים את אותו המאגר.
            </div>

            {/* Saved analyses */}
            <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: 'var(--text2)' }}>📋 ניתוחי פערים שמורים</h4>
            {analysesLoading && <div className="loading-wrap"><div className="spinner" /><p>טוען...</p></div>}
            {!analysesLoading && savedAnalyses.length === 0 && (
              <div className="empty-state" style={{ padding: '18px 0' }}>
                <p>אין ניתוחים שמורים עדיין. בדוק תוכנית ולחץ &quot;שמור ניתוח&quot;.</p>
              </div>
            )}
            {savedAnalyses.map(a => (
              <div key={a.id} className="term-card">
                <div className="term-card-body">
                  <div className="term-card-title">{a.name}</div>
                  <div className="term-card-def">
                    ציון: {a.score ?? '—'} | {new Date(a.created_at).toLocaleDateString('he-IL')}
                  </div>
                  {a.summary && <div className="term-card-practical">{a.summary}</div>}
                </div>
                <button className="remove-term-btn" onClick={() => deleteAnalysis(a.id)} title="הסר">✕</button>
              </div>
            ))}

            <h4 style={{ fontSize: 15, fontWeight: 700, margin: '28px 0 12px', color: 'var(--text2)' }}>⭐ מונחים שמורים</h4>
            {termsLoading && (
              <div className="loading-wrap"><div className="spinner" /><p>טוען מאגר...</p></div>
            )}

            {!termsLoading && terms.length === 0 && (
              <div className="empty-state" style={{ padding: '18px 0' }}>
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
function DictResult({ result: r, isSaved, onSave, onExport }) {
  return (
    <div className="dict-result">
      <div className="dict-result-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📖</span>
          <h3>{r.term}</h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="action-btn" style={{ minWidth: 'unset', padding: '7px 13px', fontSize: 13 }} onClick={onExport}>📄 ייצא</button>
          <button className={`save-term-btn${isSaved ? ' saved' : ''}`} onClick={onSave}>
            {isSaved ? '✅ שמור' : '⭐ שמור למאגר'}
          </button>
        </div>
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
