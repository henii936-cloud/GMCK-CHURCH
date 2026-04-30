/**
 * Generates a self-contained, print-ready HTML document from a report data object.
 * Opens in a new window so the user can print / Save as PDF.
 * @param {object} report - The full report object from ChurchReportGenerator.generate()
 * @param {number} quarter - The selected quarter (1-4)
 * @param {number} year - The selected Gregorian year
 * @param {string} lang - Explicit language code: 'en' | 'am' (overrides report.lang)
 */
export function openReportPrintWindow(report, quarter, year, lang) {
  // Use explicit lang param first, fall back to report.lang, then default to 'en'
  const activeLang = (lang || report.lang || 'en').slice(0, 2);
  const L = report.labels;
  const H = report.header;
  const F = report.footer;
  const isAmharic = activeLang === 'am';

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
  .doc-header { border-bottom: 3px solid #1a1a6e; padding-bottom: 28px; margin-bottom: 32px; font-family: ${fontFamily}; }

  /* Row 1 – Main org title */
  .org-name {
    font-size: 17pt;
    font-weight: 900;
    text-align: center;
    color: #1a1a6e;
    margin-bottom: 10px;
    line-height: 1.3;
  }

  /* Row 2 – Report form subtitle */
  .report-subtitle {
    font-size: 13pt;
    font-weight: 700;
    text-align: center;
    color: #1a1a6e;
    margin-bottom: 20px;
    line-height: 1.4;
  }

  /* Row 3 – From church */
  .from-church-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 11pt;
    margin-bottom: 8px;
  }
  .from-church-label { font-weight: 900; color: #1a1a6e; white-space: nowrap; }
  .from-church-value { font-weight: 700; }

  /* Row 4 – Reporting period */
  .period-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 11pt;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .period-row-label { font-weight: 900; color: #1a1a6e; white-space: nowrap; }
  .period-row-start { font-weight: 700; }
  .period-row-sep   { font-weight: 400; color: #555; padding: 0 6px; }
  .period-row-end   { font-weight: 700; }

  /* Row 5 – Official notice */
  .official-notice {
    font-size: 10pt;
    line-height: 1.8;
    color: #1a1a1a;
    text-align: justify;
    font-style: italic;
  }

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

  <!-- Row 1: Organisation name (bold, centred, large) -->
  <div class="org-name">${esc(H.organization)}</div>

  <!-- Row 2: Report form subtitle (bold, centred) -->
  ${H.reportFormSubtitle ? `<div class="report-subtitle">${esc(H.reportFormSubtitle)}</div>` : ''}
  
  <!-- Quarter Display -->
  <div style="text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 16px; text-decoration: underline;">
    ${esc(H.quarter)}
  </div>

  <!-- Row 3: From [church name] — [region] -->
  <div class="from-church-row">
    <span class="from-church-label">${esc(H.fromChurchLabel || 'From:')}</span>
    <span class="from-church-value">${esc(H.churchName)}</span>
    <span style="color:#555; padding:0 4px;">-</span>
    <span class="from-church-value">${esc(H.region)}</span>
  </div>

  <!-- Row 4: Reporting period (Ethiopian calendar) -->
  <div class="period-row">
    <span class="period-row-label">${esc(H.reportingPeriodLabel || 'Reporting Period:')}</span>
    <span class="period-row-start">${esc(H.reportingPeriod.ethiopian.split('–')[0] || H.reportingPeriod.ethiopian)}</span>
    ${H.reportingPeriod.ethiopian.includes('–') ? `
      <span class="period-row-sep">${isAmharic ? 'እስከ' : 'to'}</span>
      <span class="period-row-end">${esc(H.reportingPeriod.ethiopian.split('–')[1] || '')}</span>
    ` : ''}
    <span style="color:#555; font-size:9pt; padding-left:6px;">(${esc(H.reportingPeriod.gregorian)})</span>
  </div>

  <!-- Row 5: Official notice paragraph -->
  ${H.officialNotice ? `<p class="official-notice">${esc(H.officialNotice)}</p>` : ''}

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
