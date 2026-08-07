export interface PdfColumn {
  header: string;
  key: string;
}

export interface PdfExportOptions {
  /** Shown under the org name in the header band, e.g. "Member List". */
  subtitle: string;
  columns: PdfColumn[];
  rows: Record<string, any>[];
  /** Without extension — ".pdf" is appended. */
  fileName: string;
}

const ORG_NAME = 'Sri Basava Vidyabhivruddhi Sangha';
const MARGIN_X = 40;
const HEADER_HEIGHT = 70;

const ORANGE: [number, number, number] = [234, 88, 12];
const ORANGE_TINT: [number, number, number] = [255, 247, 237];
const INK: [number, number, number] = [41, 37, 36];
const MUTED: [number, number, number] = [168, 143, 115];
const RULE: [number, number, number] = [230, 218, 195];

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
}

/**
 * Renders a table export with a branded header/footer and downloads it as a PDF.
 *
 * jsPDF + jspdf-autotable (and their transitive canvas/html2canvas dependencies) are loaded
 * dynamically here rather than imported at the top of the file — PDF export is an occasional
 * admin action, not something every visitor's initial page load should pay for. A static
 * import pushed the production bundle over its budget.
 */
export async function exportTableToPdf({ subtitle, columns, rows, fileName }: PdfExportOptions): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);

  const orientation = columns.length > 5 ? 'landscape' : 'portrait';
  const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const generatedOn = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(ORG_NAME, MARGIN_X, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(subtitle, MARGIN_X, 49);

  doc.setFontSize(9);
  doc.text(
    `Generated ${generatedOn}  ·  ${rows.length} record${rows.length === 1 ? '' : 's'}`,
    pageWidth - MARGIN_X,
    49,
    { align: 'right' },
  );

  autoTable(doc, {
    startY: HEADER_HEIGHT + 20,
    margin: { left: MARGIN_X, right: MARGIN_X, bottom: 40 },
    head: [columns.map((column) => column.header)],
    body: rows.map((row) => columns.map((column) => formatCell(row[column.key]))),
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 7,
      textColor: INK,
      lineColor: RULE,
      lineWidth: 0.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: ORANGE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
    },
    alternateRowStyles: { fillColor: ORANGE_TINT },
  });

  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, pageHeight - 30, pageWidth - MARGIN_X, pageHeight - 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(ORG_NAME, MARGIN_X, pageHeight - 18);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - MARGIN_X, pageHeight - 18, { align: 'right' });
  }

  doc.save(`${fileName}.pdf`);
}
