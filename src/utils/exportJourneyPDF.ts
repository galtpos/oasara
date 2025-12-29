import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Facility {
  id: string;
  name: string;
  city: string;
  country: string;
  jci_accredited: boolean;
  google_rating?: number;
}

interface ShortlistedFacility {
  id: string;
  journey_id: string;
  facility_id: string;
  notes: string | null;
  rating: number | null;
  added_at: string;
  facilities: Facility;
}

interface Journey {
  id: string;
  user_id: string;
  procedure_type: string;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  status: string;
  created_at: string;
}

interface ExportData {
  journey: Journey;
  shortlistedFacilities: ShortlistedFacility[];
}

// Oasara brand colors
const COLORS = {
  ocean: {
    primary: '#0A6C94',
    dark: '#084B6B',
    light: '#E6F3F7',
  },
  sage: {
    primary: '#6B8E7C',
    dark: '#4A6656',
    light: '#F0F5F2',
  },
  accent: '#D4A574',
};

export const exportJourneyToPDF = async (data: ExportData): Promise<void> => {
  const { journey, shortlistedFacilities } = data;

  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add page break if needed
  const checkPageBreak = (neededSpace: number): void => {
    if (yPosition + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      addFooter();
    }
  };

  // Add footer to current page
  const addFooter = (): void => {
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | oasara.com`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
  };

  // === HEADER SECTION ===
  // Add Oasara branding
  doc.setFillColor(COLORS.ocean.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('OASARA', margin, 15);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Journey Comparison Report', margin, 25);

  yPosition = 50;

  // === SECTION 1: JOURNEY SUMMARY ===
  doc.setFillColor(COLORS.ocean.light);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');

  doc.setTextColor(COLORS.ocean.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Journey Summary', margin + 3, yPosition + 7);

  yPosition += 15;

  // Journey details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);

  const summaryData = [
    ['Procedure:', journey.procedure_type || 'Not specified'],
    [
      'Budget:',
      journey.budget_min && journey.budget_max
        ? `$${journey.budget_min.toLocaleString()} - $${journey.budget_max.toLocaleString()}`
        : 'Not specified',
    ],
    [
      'Timeline:',
      journey.timeline
        ? journey.timeline.charAt(0).toUpperCase() + journey.timeline.slice(1)
        : 'Not specified',
    ],
    ['Facilities Compared:', shortlistedFacilities.length.toString()],
    ['Journey Created:', new Date(journey.created_at).toLocaleDateString()],
  ];

  summaryData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 40, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // === SECTION 2: FACILITY COMPARISON TABLE ===
  checkPageBreak(60);

  doc.setFillColor(COLORS.ocean.light);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');

  doc.setTextColor(COLORS.ocean.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Facility Comparison', margin + 3, yPosition + 7);

  yPosition += 15;

  if (shortlistedFacilities.length === 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('No facilities have been added to your shortlist yet.', margin + 5, yPosition);
    yPosition += 10;
  } else {
    // Prepare table data
    const tableHeaders = [
      'Facility',
      'Location',
      'JCI',
      'Google Rating',
      'Your Rating',
    ];

    const tableData = shortlistedFacilities.map((item) => [
      item.facilities.name,
      `${item.facilities.city}, ${item.facilities.country}`,
      item.facilities.jci_accredited ? 'Yes' : 'No',
      item.facilities.google_rating
        ? item.facilities.google_rating.toFixed(1) + ' ★'
        : 'N/A',
      item.rating ? '♥'.repeat(item.rating) : 'Not rated',
    ]);

    // Generate table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: yPosition,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: [10, 108, 148], // COLORS.ocean.primary in RGB
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [240, 245, 242], // COLORS.sage.light in RGB
      },
      columnStyles: {
        0: { cellWidth: 50 }, // Facility name
        1: { cellWidth: 45 }, // Location
        2: { cellWidth: 15, halign: 'center' }, // JCI
        3: { cellWidth: 30, halign: 'center' }, // Google Rating
        4: { cellWidth: 30, halign: 'center' }, // Your Rating
      },
    });

    // Update yPosition after table
    const finalY = (doc as any).lastAutoTable.finalY || yPosition;
    yPosition = finalY + 10;
  }

  // === SECTION 3: PERSONAL NOTES ===
  checkPageBreak(60);

  doc.setFillColor(COLORS.ocean.light);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');

  doc.setTextColor(COLORS.ocean.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal Notes', margin + 3, yPosition + 7);

  yPosition += 15;

  const facilitiesWithNotes = shortlistedFacilities.filter((f) => f.notes);

  if (facilitiesWithNotes.length === 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('No notes have been added yet.', margin + 5, yPosition);
    yPosition += 10;
  } else {
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);

    facilitiesWithNotes.forEach((item, index) => {
      checkPageBreak(25);

      // Facility name
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.ocean.primary);
      doc.text(`${index + 1}. ${item.facilities.name}`, margin + 5, yPosition);
      yPosition += 6;

      // Notes
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);

      // Split notes into lines to fit width
      const maxWidth = pageWidth - 2 * margin - 10;
      const noteLines = doc.splitTextToSize(item.notes || '', maxWidth);

      noteLines.forEach((line: string) => {
        checkPageBreak(6);
        doc.text(line, margin + 10, yPosition);
        yPosition += 5;
      });

      yPosition += 5; // Extra space between notes
    });
  }

  // === FOOTER ===
  addFooter();

  // === SAVE THE PDF ===
  const fileName = `Oasara_Journey_${journey.procedure_type.replace(/\s+/g, '_')}_${
    new Date().toISOString().split('T')[0]
  }.pdf`;

  doc.save(fileName);
};
