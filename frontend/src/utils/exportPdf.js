import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORE = {
  name: 'SNEAKERS.',
  tagline: 'Premium Footwear',
  website: 'www.sneakers.id',
  email: 'support@sneakers.id',
};

const COLORS = {
  black:       [10,  10,  10],
  white:       [255, 255, 255],
  accent:      [230, 180, 80],   // gold accent
  lightGray:   [248, 248, 248],
  midGray:     [160, 160, 160],
  darkGray:    [60,  60,  60],
  status: {
    PAID:    [22,  163, 74],
    SHIPPED: [37,  99,  235],
    PENDING: [217, 119, 6],
    FAILED:  [220, 38,  38],
  },
};

const FONT = {
  bold:   'helvetica',
  normal: 'helvetica',
};

const PAGE = {
  margin: 18,
  width:  210,   // A4 mm
  height: 297,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style:                 'currency',
    currency:              'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  });
}

function getStatusLabel(status) {
  const map = { pending: 'PENDING', paid: 'PAID', shipped: 'SHIPPED', failed: 'FAILED' };
  return map[status] ?? status.toUpperCase();
}

function setFont(doc, style = 'normal', size = 9) {
  doc.setFont(FONT.normal, style);
  doc.setFontSize(size);
}

function setColor(doc, rgb) {
  doc.setTextColor(...rgb);
}

// ─── Section Renderers ────────────────────────────────────────────────────────

/** Renders the full-width header band with store name + invoice info */
function renderHeader(doc, order) {
  const { margin, width } = PAGE;
  const statusLabel = getStatusLabel(order.status);
  const statusColor = COLORS.status[statusLabel] ?? COLORS.midGray;

  // Black header band
  doc.setFillColor(...COLORS.black);
  doc.rect(0, 0, width, 46, 'F');

  // Gold left accent bar
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, 4, 46, 'F');

  // Store name
  setFont(doc, 'bold', 20);
  setColor(doc, COLORS.white);
  doc.text(STORE.name, margin + 4, 18);

  // Tagline
  setFont(doc, 'normal', 7.5);
  setColor(doc, COLORS.midGray);
  doc.text(STORE.tagline, margin + 4, 25);

  // Thin gold separator line under tagline
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.3);
  doc.line(margin + 4, 28, margin + 60, 28);

  // Store contact info
  setFont(doc, 'normal', 6.5);
  setColor(doc, COLORS.midGray);
  doc.text(`${STORE.website}  ·  ${STORE.email}`, margin + 4, 33);

  // "INVOICE" label (right)
  setFont(doc, 'bold', 22);
  setColor(doc, COLORS.white);
  doc.text('INVOICE', width - margin, 18, { align: 'right' });

  // Invoice number
  setFont(doc, 'normal', 8);
  setColor(doc, COLORS.midGray);
  doc.text(`#${order.id}`, width - margin, 25, { align: 'right' });

  // Date
  setFont(doc, 'normal', 7);
  doc.text(formatDate(order.created_at), width - margin, 31, { align: 'right' });

  // Status badge
  const badgeW = 28;
  const badgeH = 7;
  const badgeX = width - margin - badgeW;
  const badgeY = 35;
  doc.setFillColor(...statusColor);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'F');
  setFont(doc, 'bold', 6.5);
  setColor(doc, COLORS.white);
  doc.text(statusLabel, badgeX + badgeW / 2, badgeY + 4.8, { align: 'center' });
}

/** Renders SHIP TO and ORDER INFO side-by-side cards */
function renderInfoCards(doc, order, startY) {
  const { margin, width } = PAGE;
  const cardW = (width - margin * 2 - 6) / 2;
  const cardH = 44;
  const r = 3;

  // ── Ship To Card ──
  const lx = margin;
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(lx, startY, cardW, cardH, r, r, 'F');

  // Gold top bar on card
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(lx, startY, cardW, 5, r, r, 'F');
  doc.rect(lx, startY + 2, cardW, 3, 'F'); // fill bottom corners of top bar

  setFont(doc, 'bold', 6.5);
  setColor(doc, COLORS.black);
  doc.text('SHIP TO', lx + 5, startY + 3.8);

  setFont(doc, 'bold', 10);
  setColor(doc, COLORS.black);
  doc.text(order.shipping_name, lx + 5, startY + 13);

  setFont(doc, 'normal', 7.5);
  setColor(doc, COLORS.darkGray);
  doc.text(order.shipping_phone, lx + 5, startY + 19.5);

  const addressLines = doc.splitTextToSize(order.shipping_address, cardW - 10);
  doc.text(addressLines, lx + 5, startY + 25.5);
  doc.text(order.shipping_city, lx + 5, startY + 38);

  // ── Order Info Card ──
  const rx = margin + cardW + 6;
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(rx, startY, cardW, cardH, r, r, 'F');

  doc.setFillColor(...COLORS.black);
  doc.roundedRect(rx, startY, cardW, 5, r, r, 'F');
  doc.rect(rx, startY + 2, cardW, 3, 'F');

  setFont(doc, 'bold', 6.5);
  setColor(doc, COLORS.white);
  doc.text('ORDER INFO', rx + 5, startY + 3.8);

  const infoRows = [
    { label: 'Order ID',    value: `#${order.id}` },
    { label: 'Date',        value: new Date(order.created_at).toLocaleDateString('id-ID') },
    { label: 'Midtrans ID', value: order.midtrans_order_id || '-' },
    { label: 'Status',      value: getStatusLabel(order.status) },
  ];

  infoRows.forEach(({ label, value }, i) => {
    const rowY = startY + 13 + i * 7;
    setFont(doc, 'normal', 7.5);
    setColor(doc, COLORS.darkGray);
    doc.text(label, rx + 5, rowY);
    setFont(doc, 'bold', 7.5);
    setColor(doc, COLORS.black);
    doc.text(value, rx + cardW - 5, rowY, { align: 'right' });
  });

  return startY + cardH + 8;
}

/** Renders the items table */
function renderItemsTable(doc, order, startY) {
  const { margin } = PAGE;

  const rows = (order.items ?? []).map((item, idx) => [
    idx + 1,
    item.variant_details?.product_name ?? '-',
    item.variant_details?.color
      ? `${item.variant_details.color} / EU ${item.variant_details.size}`
      : '-',
    item.quantity,
    formatRupiah(item.price),
    formatRupiah(item.price * item.quantity),
  ]);

  // Total usable width = PAGE.width - margin*2 = 210 - 36 = 174mm
  // Col widths: # 10 | Product auto | Variant 38 | Qty 14 | Unit Price 36 | Subtotal 36
  autoTable(doc, {
    startY,
    head: [['#', 'Product', 'Variant', 'Qty', 'Unit Price', 'Subtotal']],
    body: rows,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor:    COLORS.black,
      textColor:    COLORS.white,
      fontStyle:    'bold',
      fontSize:     8,
      cellPadding:  { top: 5, bottom: 5, left: 4, right: 4 },
      valign:       'middle',
      overflow:     'linebreak',
    },
    bodyStyles: {
      fontSize:     8,
      textColor:    COLORS.darkGray,
      cellPadding:  { top: 4, bottom: 4, left: 4, right: 4 },
      valign:       'middle',
    },
    alternateRowStyles: { fillColor: COLORS.lightGray },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 38 },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 36, halign: 'right' },
      5: { cellWidth: 36, halign: 'right' },
    },
    theme: 'grid',
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.2,
  });

  return doc.lastAutoTable.finalY;
}

/** Renders the total amount box */
function renderTotal(doc, order, afterTableY) {
  const { margin, width } = PAGE;
  const boxW  = 80;
  const boxH  = 20;
  const boxX  = width - margin - boxW;
  const boxY  = afterTableY + 8;

  // Gold top stripe
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(boxX, boxY, boxW, 5, 2, 2, 'F');
  doc.rect(boxX, boxY + 2, boxW, 3, 'F');

  // Black body
  doc.setFillColor(...COLORS.black);
  doc.roundedRect(boxX, boxY + 3, boxW, boxH, 2, 2, 'F');
  doc.rect(boxX, boxY + 3, boxW, 4, 'F'); // merge with stripe

  setFont(doc, 'normal', 6.5);
  setColor(doc, COLORS.midGray);
  doc.text('TOTAL AMOUNT', boxX + 5, boxY + 10);

  setFont(doc, 'bold', 13);
  setColor(doc, COLORS.white);
  doc.text(formatRupiah(order.total_amount), boxX + boxW - 5, boxY + 19, { align: 'right' });
}

/** Renders the page footer */
function renderFooter(doc) {
  const { width, height, margin } = PAGE;
  const y = height - 12;

  // Thin gold top line
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.4);
  doc.line(margin, y - 3, width - margin, y - 3);

  setFont(doc, 'normal', 6.5);
  setColor(doc, COLORS.midGray);
  doc.text(
    `${STORE.name}  ·  ${STORE.tagline}  ·  ${STORE.website}`,
    width / 2, y + 1, { align: 'center' },
  );
  doc.text('Thank you for your purchase!', width / 2, y + 6, { align: 'center' });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate and download an invoice PDF for the given order.
 * @param {object} order - Order data object
 */
export function downloadOrderInvoice(order) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  renderHeader(doc, order);

  let y = 54;
  y = renderInfoCards(doc, order, y);

  const afterTable = renderItemsTable(doc, order, y);

  renderTotal(doc, order, afterTable);
  renderFooter(doc);

  doc.save(`Invoice_Order_${order.id}.pdf`);
}