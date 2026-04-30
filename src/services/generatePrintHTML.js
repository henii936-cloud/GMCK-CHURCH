/**
 * Generates a self-contained, print-ready HTML document from a report data object.
 * Opens in a new window so the user can print / Save as PDF.
 */
export function openReportPrintWindow(report, quarter, year) {
  const L = report.labels;
  const H = report.header;
  const F = report.footer;
  const isAmharic = report.lang === 'am';

  // ---------- helpers ----------
  const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const badge = (label, value) =>
    `<div class="stat-box">
       <div class="stat-label">${esc(label)}</div>
       <div class="stat-value">${esc(value)}</div>
     </div>`;

  const genderRow = (item) => {
    let cells = '';
    if (item.men  !== undefined) cells += badge(L.men,  item.men);
    if (item.women!== undefined) cells += badge(L.women,item.women);
    if (item.total!== undefined) cells += badge(L.total,item.total);
    if (item.count!== undefined && item.men === undefined) cells += badge(L.count,item.count);
    if (item.sessions    !== undefined) cells += badge(L.sessions,    item.sessions);
    if (item.participants!== undefined) cells += badge(L.participants, item.participants);
    if (item.rating      !== undefined) cells += badge(L.rating,      item.rating);
    return cells ? `<div class="stats-row">${cells}</div>` : '';
  };

  const growthBadges = (item) => {
    let out = '';
    if (item.withinQuarter) out += `<span class="pill">${esc(L.growth)}: ${esc(item.withinQuarter)}</span>`;
    if (item.vsLastQuarter)  out += `<span class="pill pill-tert">${esc(L.vsLast)}: ${esc(item.vsLastQuarter)}</span>`;
    return out ? `<div class="pills">${out}</div>` : '';
  };

  // ---------- sections ----------
  let sectionsHTML = '';

  report.sections.forEach((sec) => {
    let itemsHTML = '';

    Object.entries(sec.items).forEach(([key, item]) => {
      if (key === 'ministryVisits') return;

      if (typeof item !== 'object' || item === null) {
        itemsHTML += `
          <div class="item-card">
            <div class="item-key">${esc(key)}</div>
            <div class="stat-value">${esc(item)}</div>
          </div>`;
        return;
      }

      itemsHTML += `
        <div class="item-card">
          <div class="item-key">${esc(key)}</div>
          <div class="item-label">${esc(item.label || key)}</div>
          ${genderRow(item)}
          ${growthBadges(item)}
          ${item.regional !== undefined ? `<div class="detail-row">${esc(L.regional)}: <b>${esc(item.regional)}</b> &nbsp;|&nbsp; ${esc(L.main)}: <b>${esc(item.main)}</b></div>` : ''}
          ${item.reason ? `<div class="detail-row">${esc(L.reason)}: ${esc(item.reason)}</div>` : ''}
          ${item.plan   ? `<div class="detail-row">${esc(item.plan)}</div>` : ''}
        </div>`;
    });

    // Ministry visits table
    let tableHTML = '';
    if (sec.items.ministryVisits) {
      const rows = sec.items.ministryVisits.map(r =>
        `<tr><td>${esc(r.ministry)}</td><td class="tc">${esc(r.timesEncouraged)}</td></tr>`
      ).join('');
      tableHTML = `
        <table>
          <thead><tr><th>${esc(L.ministryDept)}</th><th class="tc">${esc(L.encVisits)}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    }

    sectionsHTML += `
      <div class="section">
        <div class="section-header">
          <span class="section-num">${esc(sec.section)}</span>
          <span class="section-title">${esc(sec.title)}</span>
        </div>
        ${itemsHTML ? `<div class="items-grid">${itemsHTML}</div>` : ''}
        ${tableHTML}
      </div>`;
  });

  // ---------- full document ----------
  const dir = isAmharic ? 'dir="ltr"' : '';
  const fontFamily = isAmharic
    ? "'Noto Sans Ethiopic', 'Ethiopic', serif"
    : "Georgia, 'Times New Roman', serif";

  const html = `<!DOCTYPE html>
<html lang="${isAmharic ? 'am' : 'en'}" ${dir}>
<head>
<meta charset="UTF-8"/>
<title>${esc(H.organization)} – Q${quarter} ${year}</title>
${isAmharic ? '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;700;900&display=swap" rel="stylesheet">' : ''}
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${fontFamily}; color: #1a1a2e; background: #fff; padding: 20mm 15mm; font-size: 11pt; line-height: 1.6; }

  /* ── Header ── */
  .doc-header { text-align: center; border-bottom: 3px solid #3b4fd8; padding-bottom: 24px; margin-bottom: 32px; }
  .org-name   { font-size: 15pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: #3b4fd8; margin-bottom: 6px; }
  .church-name{ font-size: 13pt; font-weight: 700; margin-bottom: 16px; }
  .period-grid{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
  .period-box { background: #f4f6ff; border: 1px solid #c7cef7; border-radius: 8px; padding: 10px 14px; }
  .period-lbl { font-size: 7.5pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; color: #3b4fd8; margin-bottom: 3px; }
  .period-val { font-size: 10.5pt; font-weight: 600; }

  /* ── Sections ── */
  .section { margin-bottom: 36px; page-break-inside: avoid; }
  .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .section-num    { width: 36px; height: 36px; border-radius: 8px; background: #3b4fd8; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14pt; flex-shrink: 0; }
  .section-title  { font-size: 12pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; color: #3b4fd8; }

  /* ── Items grid ── */
  .items-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-left: 48px; }
  .item-card  { background: #f8f9ff; border: 1px solid #e4e8ff; border-radius: 10px; padding: 12px 14px; }
  .item-key   { font-size: 7pt; font-weight: 900; color: #3b4fd8; opacity: 0.45; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
  .item-label { font-size: 9.5pt; font-weight: 700; color: #333; margin-bottom: 8px; }

  /* ── Stats ── */
  .stats-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px; }
  .stat-box  { }
  .stat-label{ font-size: 7pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 2px; }
  .stat-value{ font-size: 17pt; font-weight: 900; color: #3b4fd8; }

  /* ── Pills ── */
  .pills    { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
  .pill     { background: rgba(59,79,216,0.07); border: 1px solid rgba(59,79,216,0.2); border-radius: 20px; padding: 2px 10px; font-size: 7.5pt; font-weight: 900; text-transform: uppercase; color: #3b4fd8; }
  .pill-tert{ background: rgba(120,60,200,0.07); border-color: rgba(120,60,200,0.2); color: #7830c8; }

  /* ── Detail row ── */
  .detail-row { font-size: 9pt; color: #555; margin-top: 6px; }

  /* ── Ministry table ── */
  table   { width: 100%; border-collapse: collapse; margin-top: 12px; margin-left: 48px; width: calc(100% - 48px); border-radius: 10px; overflow: hidden; border: 1px solid #e4e8ff; }
  thead tr{ background: #f4f6ff; }
  th, td  { padding: 10px 16px; text-align: left; font-size: 9.5pt; }
  th      { font-size: 7.5pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #3b4fd8; }
  td      { border-top: 1px solid #eef0ff; }
  .tc     { text-align: center; font-weight: 900; color: #3b4fd8; }

  /* ── Footer ── */
  .doc-footer { margin-top: 48px; padding-top: 24px; border-top: 3px solid #eef0ff; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
  .sig-block  { }
  .sig-line   { border-bottom: 1px solid #aaa; height: 40px; display: flex; align-items: flex-end; margin-bottom: 8px; }
  .sig-text   { font-size: 9pt; color: #888; font-style: italic; }
  .sig-role   { font-size: 8pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; color: #3b4fd8; }
  .generated  { text-align: center; margin-top: 32px; font-size: 8pt; color: #aaa; text-transform: uppercase; letter-spacing: 0.3em; }

  @media print {
    body { padding: 0; }
    @page { margin: 15mm; }
  }
</style>
</head>
<body>

<div class="doc-header">
  <div class="org-name">${esc(H.organization)}</div>
  <div class="church-name">${esc(H.churchName)} &mdash; ${esc(H.region)}</div>
  <div style="font-size:11pt;font-weight:700;color:#555">${esc(H.quarter)}</div>
  <div class="period-grid">
    <div class="period-box">
      <div class="period-lbl">${esc(L.reportingPeriodGreg)}</div>
      <div class="period-val">${esc(H.reportingPeriod.gregorian)}</div>
    </div>
    <div class="period-box">
      <div class="period-lbl">${esc(L.reportingPeriodEth)}</div>
      <div class="period-val">${esc(H.reportingPeriod.ethiopian)}</div>
    </div>
  </div>
</div>

${sectionsHTML}

<div class="doc-footer">
  <div class="sig-block">
    <div class="sig-line"><span class="sig-text">${esc(F.filledBy)}</span></div>
    <div class="sig-role">${esc(L.preparedBy)}</div>
  </div>
  <div class="sig-block">
    <div class="sig-line"><span class="sig-text">${esc(F.chairman)}</span></div>
    <div class="sig-role">${esc(L.approvedBy)}</div>
  </div>
</div>

<div class="generated">${esc(L.generatedOn)} ${esc(F.date)} ${esc(L.via)} ${esc(F.filledBy)}</div>

<script>
  // Auto-trigger print dialog after fonts load
  window.onload = function() {
    setTimeout(function() { window.print(); }, 800);
  };
<\/script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Please allow pop-ups for this site to export PDF.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
