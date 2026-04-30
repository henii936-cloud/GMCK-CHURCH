/**
 * Generates a self-contained, print-ready HTML document from a report data object.
 * Opens in a new window so the user can print / Save as PDF.
 * This version clones the exact React UI and Tailwind styles to ensure it matches the default design.
 * @param {object} report - The full report object from ChurchReportGenerator.generate()
 * @param {number} quarter - The selected quarter (1-4)
 * @param {number} year - The selected Gregorian year
 * @param {string} lang - Explicit language code: 'en' | 'am' (overrides report.lang)
 */
export function openReportPrintWindow(report, quarter, year, lang) {
  // Grab the exact rendered report from the DOM
  const reportElement = document.getElementById('report-document');
  if (!reportElement) {
    // Fallback: just trigger native print on the current window
    window.print();
    return;
  }

  const activeLang = (lang || report.lang || 'en').slice(0, 2);
  const isAmharic = activeLang === 'am';
  const dir = isAmharic ? 'dir="ltr"' : '';
  const title = `${report.header.organization} - Q${quarter} ${year}`;

  // Open a new window
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow pop-ups for this site to export PDF.');
    return;
  }

  // Copy all stylesheets from the current document so Tailwind classes work
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(s => s.outerHTML)
    .join('\n');

  // We wrap it in a max-w-5xl container just like the main page so the layout is constrained similarly
  // We use print media queries to remove extra padding/shadows during actual printing
  const html = `<!DOCTYPE html>
<html lang="${isAmharic ? 'am' : 'en'}" ${dir}>
<head>
<meta charset="UTF-8"/>
<title>${title}</title>
${isAmharic ? '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;700;900&display=swap" rel="stylesheet">' : ''}
${styles}
<style>
  body { 
    background: white !important; 
    padding: 2rem;
  }
  @media print {
    body { padding: 0 !important; background: white !important; }
    @page { margin: 15mm; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body class="bg-white text-gray-900">
  <div class="max-w-5xl mx-auto">
    ${reportElement.outerHTML}
  </div>
  <script>
    // Wait slightly for fonts and styles to render before triggering print
    window.onload = function() {
      setTimeout(function() { 
        window.print(); 
      }, 500);
    };
  </script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}
