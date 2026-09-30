import { jsPDF } from 'jspdf';

/**
 * Generates a clean, professional, and printable A4 PDF checklist.
 */
export function generateChecklistPDF({ checklist, items, profileName, fullName }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // Primary Colors
  const primaryColor = [13, 148, 136]; // Teal #0d9488
  const darkTextColor = [30, 41, 59];  // Slate-800
  const grayTextColor = [100, 116, 139]; // Slate-500
  const lightBg = [248, 250, 252];     // Slate-50

  // 1. Top Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, contentWidth, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ReadyDocs - Document Readiness Checklist', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Tagline: “One visit is enough.”  •  AI-Powered Verification', margin + 6, y + 14);

  y += 26;

  // 2. Metadata Box
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'FD');

  doc.setTextColor(...darkTextColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Service: ${checklist.result_json?.serviceTitle || checklist.institution_name}`, margin + 5, y + 7);
  doc.text(`Institution: ${checklist.institution_name}`, margin + 5, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayTextColor);
  doc.text(`Applicant Profile: ${profileName || 'Primary'} (${fullName || 'Applicant'})`, margin + 5, y + 19);
  doc.text(`Date Generated: ${new Date(checklist.created_at || Date.now()).toLocaleDateString()}`, margin + 5, y + 24);

  // Status Pill on top right of metadata box
  const statusText = checklist.status === 'ready' 
    ? 'READY FOR VISIT' 
    : checklist.status === 'needs_attention' 
    ? 'NEEDS ATTENTION' 
    : 'INCOMPLETE';
  const statusColor = checklist.status === 'ready' 
    ? [22, 163, 74] 
    : checklist.status === 'needs_attention' 
    ? [217, 119, 6] 
    : [100, 116, 139];

  doc.setFillColor(...statusColor);
  doc.roundedRect(pageWidth - margin - 45, y + 5, 40, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(statusText, pageWidth - margin - 25, y + 9.5, { align: 'center' });

  y += 34;

  // Helper function to render a section
  function renderSection(title, sectionItems, badgeColor, emptyNote) {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
    }

    // Section Header
    doc.setFillColor(...badgeColor);
    doc.roundedRect(margin, y, contentWidth, 6.5, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), margin + 4, y + 4.5);
    y += 9;

    if (!sectionItems || sectionItems.length === 0) {
      doc.setTextColor(...grayTextColor);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.text(emptyNote, margin + 4, y + 2);
      y += 6;
      return;
    }

    sectionItems.forEach((item, idx) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = margin;
      }

      // Checkbox circle
      const isMatched = item.status === 'matched';
      doc.setDrawColor(148, 163, 184);
      doc.circle(margin + 4, y + 2.5, 1.8);
      if (isMatched) {
        doc.setFillColor(22, 163, 74);
        doc.circle(margin + 4, y + 2.5, 1.2, 'F');
      }

      // Item title
      doc.setTextColor(...darkTextColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      const titleLine = `${idx + 1}. ${item.title} ${isMatched ? ' [VERIFIED]' : ''}`;
      doc.text(titleLine, margin + 9, y + 3.5);

      y += 5.5;

      // Explanation / Acceptable options
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...grayTextColor);
      const details = item.explanation || item.acceptableDocuments?.join(', ') || '';
      const splitDetails = doc.splitTextToSize(details, contentWidth - 12);
      doc.text(splitDetails, margin + 9, y + 2);

      y += (splitDetails.length * 3.8) + 2.5;
    });

    y += 3;
  }

  // Split items into 4 required categories
  const allItems = items || [];
  const mustCarry = allItems.filter(i => (i.mandatory && i.section !== 'before_you_go') || i.section === 'must_carry');
  const carryIfNeeded = allItems.filter(i => (!i.mandatory && i.section !== 'before_you_go') || i.section === 'carry_if_needed');
  const beforeYouGo = allItems.filter(i => i.section === 'before_you_go');
  const missingDocs = allItems.filter(i => i.status === 'missing' || !i.status);

  // 1. Must Carry Section
  renderSection('1. Must Carry (Originals & Required Proofs)', mustCarry, [15, 118, 110], 'No mandatory documents specified.');

  // 2. Carry If Needed Section
  renderSection('2. Carry If Needed (Conditional / Alternate Proofs)', carryIfNeeded, [3, 105, 161], 'No conditional documents required.');

  // 3. Before You Go Preparation Tips
  const defaultTips = beforeYouGo.length > 0 ? beforeYouGo : [
    { title: 'Self-Attested Photocopies', explanation: 'Keep 2 photocopies of each original document with your signatures.' },
    { title: 'Recent Photographs', explanation: 'Carry 4 recent passport-size photos with white background.' },
    { title: 'Institution Timings', explanation: 'Confirm operational hours and counters before heading out.' }
  ];
  renderSection('3. Before You Go (Preparation Check)', defaultTips, [100, 116, 139], 'No special preparation tips.');

  // 4. Missing Documents Section
  renderSection('4. Missing Documents (To Be Arranged)', missingDocs, [190, 24, 93], 'All documents are satisfied! No missing documents.');

  // Footer & Disclaimer at bottom
  if (y > pageHeight - 30) {
    doc.addPage();
    y = margin;
  }

  y = Math.max(y, pageHeight - 28);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayTextColor);
  doc.text(`Official Source: ${checklist.source_url || 'Verified Institution Guidelines'}  •  Verified: 2026-09-30`, margin, y);
  y += 4;
  doc.setTextColor(180, 83, 9); // Amber
  doc.text('Disclaimer: Rules, fees, and processing times can change. Please confirm requirements with the institution before visiting.', margin, y);
  y += 4;
  doc.setTextColor(...grayTextColor);
  doc.text('ReadyDocs - Intelligent Document Processing Platform  •  https://readydocs.local', margin, y);

  // Trigger Save
  const safeFilename = `ReadyDocs_Checklist_${(checklist.institution_name || 'Service').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(safeFilename);
}
