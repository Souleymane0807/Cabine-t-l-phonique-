import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, CaisseBalances } from '../types';
import { formatFCFA } from './helpers';

export interface PDFExportOptions {
  cabineName?: string;
  managerName?: string;
  phoneNumber?: string;
  location?: string;
  title?: string;
}

export function exportTransactionsToPDF(
  transactions: Transaction[],
  options?: PDFExportOptions,
  caisse?: CaisseBalances
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const cabineName = options?.cabineName || 'Cabine Ibrahim - Espace Mobile Money';
  const managerName = options?.managerName || 'Ibrahim Traoré';
  const phone = options?.phoneNumber || '+225 07 48 00 12 34';
  const location = options?.location || 'Abidjan, Cocody Riviera 2';
  const reportTitle = options?.title || 'Journal des Transactions Mobile Money';

  const todayStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Color palette
  const primaryOrange = [255, 107, 0] as [number, number, number];
  const darkNavy = [13, 30, 54] as [number, number, number];
  const slateDark = [30, 41, 59] as [number, number, number];

  // Header Banner
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, 210, 36, 'F');

  // Orange accent bar
  doc.setFillColor(...primaryOrange);
  doc.rect(0, 36, 210, 2, 'F');

  // Title & Cabine Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CABINEPAY - RAPPORT DE TRANSACTIONS', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`${cabineName} | Gérant: ${managerName}`, 14, 23);
  doc.text(`Contact: ${phone} | Localisation: ${location}`, 14, 30);

  // Date top right
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Édité le : ${todayStr} à ${timeStr}`, 196, 15, { align: 'right' });
  doc.text(`Total transactions : ${transactions.length}`, 196, 23, { align: 'right' });

  // Calculation Metrics
  const totalDepots = transactions
    .filter((t) => t.type !== 'Retrait')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalRetraits = transactions
    .filter((t) => t.type === 'Retrait')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCommissions = transactions.reduce(
    (sum, t) => sum + (t.commission || 0),
    0
  );

  // Summary KPI Cards (4 columns)
  const startY = 44;
  const colWidth = 44;
  const colGap = 4;
  const cardHeight = 19;

  const kpis = [
    { label: 'Total Opérations', val: `${transactions.length} tx`, color: [59, 130, 246] as [number, number, number] },
    { label: 'Volume Dépôts', val: `${totalDepots.toLocaleString('fr-FR')} F`, color: [34, 197, 94] as [number, number, number] },
    { label: 'Volume Retraits', val: `${totalRetraits.toLocaleString('fr-FR')} F`, color: [249, 115, 22] as [number, number, number] },
    { label: 'Commissions', val: `+${totalCommissions.toLocaleString('fr-FR')} F`, color: [234, 179, 8] as [number, number, number] },
  ];

  kpis.forEach((kpi, index) => {
    const x = 14 + index * (colWidth + colGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, colWidth, cardHeight, 2, 2, 'FD');

    // Colored left indicator
    doc.setFillColor(...kpi.color);
    doc.rect(x, startY, 2, cardHeight, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 5, startY + 6);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x + 5, startY + 14);
  });

  // Caisse Balances Info if provided
  let tableStartY = 70;
  if (caisse) {
    const totalLiquidites = caisse.cash + caisse.orangeUV + caisse.mtnUV + caisse.moovUV + caisse.waveUV;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 66, 182, 10, 1.5, 1.5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(
      `État Caisse : Cash: ${caisse.cash.toLocaleString('fr-FR')} F  |  Orange: ${caisse.orangeUV.toLocaleString('fr-FR')} F  |  MTN: ${caisse.mtnUV.toLocaleString('fr-FR')} F  |  Moov: ${caisse.moovUV.toLocaleString('fr-FR')} F  |  Wave: ${caisse.waveUV.toLocaleString('fr-FR')} F  |  Total: ${totalLiquidites.toLocaleString('fr-FR')} F`,
      17,
      72.5
    );
    tableStartY = 81;
  }

  // Table rows
  const tableData = transactions.map((t) => [
    `${t.date}\n${t.time}`,
    t.reference,
    t.type,
    t.operator,
    `${t.clientName}\n${t.clientPhone}`,
    t.type === 'Dépôt'
      ? `+${t.amount.toLocaleString('fr-FR')} FCFA`
      : `-${Math.abs(t.amount).toLocaleString('fr-FR')} FCFA`,
    `+${t.commission.toLocaleString('fr-FR')} FCFA`,
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Date / Heure', 'Référence', 'Type', 'Opérateur', 'Client & Contact', 'Montant', 'Commission']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: darkNavy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' },
      1: { cellWidth: 32, font: 'courier', fontSize: 7.5 },
      2: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 42 },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 20, halign: 'right' },
    },
    didParseCell: (data) => {
      // Colorize amount and type cells
      if (data.section === 'body') {
        if (data.column.index === 2) {
          if (data.cell.raw === 'Dépôt') {
            data.cell.styles.textColor = [22, 163, 74];
          } else {
            data.cell.styles.textColor = [234, 88, 12];
          }
        }
        if (data.column.index === 5) {
          const text = String(data.cell.raw || '');
          if (text.startsWith('+')) {
            data.cell.styles.textColor = [22, 163, 74];
          } else {
            data.cell.styles.textColor = [234, 88, 12];
          }
        }
        if (data.column.index === 3) {
          const op = String(data.cell.raw || '');
          if (op === 'Orange') data.cell.styles.textColor = [255, 107, 0];
          else if (op === 'MTN') data.cell.styles.textColor = [202, 138, 4];
          else if (op === 'Moov') data.cell.styles.textColor = [16, 149, 80];
          else if (op === 'Wave') data.cell.styles.textColor = [14, 165, 233];
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 20 },
  });

  // Footer on each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Document officiel édité par CabinePay - Gestion intelligente de caisse & transferts Mobile Money',
      14,
      290
    );
    doc.text(`Page ${i} sur ${pageCount}`, 196, 290, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 286, 196, 286);
  }

  // Save the PDF
  const filename = `Rapport_Transactions_${cabineName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

export function exportSingleTransactionReceiptPDF(transaction: Transaction, cabineName: string = 'Cabine Ibrahim') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 130], // Ticket / Receipt format
  });

  const darkNavy = [13, 30, 54] as [number, number, number];
  const primaryOrange = [255, 107, 0] as [number, number, number];

  // Header band
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, 80, 22, 'F');
  doc.setFillColor(...primaryOrange);
  doc.rect(0, 22, 80, 1.5, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(cabineName.toUpperCase(), 40, 9, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text('REÇU DE TRANSACTION OFFICIEL', 40, 15, { align: 'center' });

  // Ticket Body
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${transaction.type.toUpperCase()} ${transaction.operator.toUpperCase()}`, 40, 31, { align: 'center' });

  // Amount
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  if (transaction.type === 'Dépôt') {
    doc.setTextColor(22, 163, 74);
  } else if (transaction.type === 'Transfert d’unités') {
    doc.setTextColor(2, 132, 199);
  } else if (transaction.type === 'Pass Internet') {
    doc.setTextColor(147, 51, 234);
  } else {
    doc.setTextColor(234, 88, 12);
  }
  doc.text(formatFCFA(Math.abs(transaction.amount)), 40, 40, { align: 'center' });

  // Commission line
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Commission Cabine : +${formatFCFA(transaction.commission)}`, 40, 46, { align: 'center' });

  // Dotted line
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, 50, 74, 50);

  // Key-value pairs
  const lines: { label: string; val: string }[] = [
    { label: 'Réf. Transaction', val: transaction.reference },
    { label: 'Service', val: transaction.type },
    ...(transaction.bundleInfo
      ? [
          {
            label: 'Forfait Data',
            val: `${transaction.bundleInfo.volume || ''} (${transaction.bundleInfo.validity || ''})`,
          },
        ]
      : []),
    { label: 'Client', val: transaction.clientName },
    { label: 'Téléphone', val: transaction.clientPhone },
    { label: 'Opérateur', val: transaction.operator },
    { label: 'Date', val: transaction.date },
    { label: 'Heure', val: transaction.time },
  ];

  let y = 56;
  doc.setFontSize(8);
  doc.setLineDashPattern([], 0);

  lines.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, 8, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.val, 72, y, { align: 'right' });
    y += 6;
  });

  // Dotted line
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y + 2, 74, y + 2);

  // Footer message
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Merci de votre confiance et à bientôt !', 40, y + 8, { align: 'center' });
  doc.text('Application CabinePay - Espace Agent', 40, y + 13, { align: 'center' });

  doc.save(`Recu_${transaction.reference}.pdf`);
}
