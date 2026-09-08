import { jsPDF } from 'jspdf';

/**
 * Checks if the user is running on a mobile platform (Android, iOS, iPadOS, etc.)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent || '');
}

/**
 * Checks if Web Share API with files is supported on the current device
 */
export function canShareFiles(file?: File): boolean {
  if (typeof window === 'undefined' || !navigator.share) return false;
  if (!navigator.canShare) return false;
  if (file) {
    try {
      return navigator.canShare({ files: [file] });
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Robustly shares or downloads a Blob on mobile and desktop browsers.
 * - On Mobile (Android / iOS): If Web Share API is available, it natively invokes the system share sheet
 *   allowing the user to "Save to device / Downloads", "WhatsApp", "Google Drive", or open directly in PDF reader.
 * - On Desktop / Fallback: Creates a clean anchor download WITHOUT target="_blank" so Chromium/Android doesn't
 *   open an unreadable empty tab.
 */
export async function shareOrDownloadBlob(
  blob: Blob,
  fileName: string,
  title = 'TNPA Document',
  forceDirectDownload = false
): Promise<{ success: boolean; method: 'share' | 'download' | 'fallback'; error?: string }> {
  const isMobile = isMobileDevice();

  // 1. Try Mobile Web Share API first unless forced to direct download
  if (isMobile && !forceDirectDownload && typeof navigator !== 'undefined' && navigator.share) {
    try {
      const mimeType = blob.type || 'application/pdf';
      const file = new File([blob], fileName, { type: mimeType });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: `${title} - தமிழ்நாடு பெயிண்டர்கள் நல சங்கம்`
        });
        return { success: true, method: 'share' };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User intentionally dismissed or completed share sheet
        return { success: true, method: 'share' };
      }
      console.warn('Native share failed, proceeding to direct download:', err);
    }
  }

  // 2. Direct browser anchor download (CRITICAL: NO target="_blank"!)
  try {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
      setTimeout(() => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {}
      }, 60000);
    }, 1500);

    return { success: true, method: 'download' };
  } catch (err: any) {
    console.warn('Anchor download failed, attempting data URI fallback:', err);
  }

  // 3. Fallback: Base64 Data URI download
  try {
    const dataUrl = await blobToDataUrl(blob);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
    }, 2000);

    return { success: true, method: 'fallback' };
  } catch (error: any) {
    console.error('All download methods failed:', error);
    return { success: false, method: 'fallback', error: error?.message || 'Download failed' };
  }
}

/**
 * Converts a Blob to a Base64 Data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generates an official, high-resolution Government Welfare Board Application Form PDF (Form XXVII, Form B, etc.)
 */
export async function generateWelfareFormPdf(form: {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  version: string;
}): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Top Header banner
  doc.setFillColor(192, 0, 0); // Official Red
  doc.rect(0, 0, 210, 28, 'F');

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TAMIL NADU MANUAL WORKERS WELFARE BOARD', 105, 10, { align: 'center' });
  doc.setFontSize(10);
  doc.text('TAMIL NADU PAINTERS & ARTISTS WELFARE ASSOCIATION (TNPA)', 105, 16, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Reg No: TNMDUJCLMDUTU-50-26-00044 | Official Statutory E-Form Template', 105, 22, { align: 'center' });

  // Form Name Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, 34, 180, 22, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(form.nameEn.toUpperCase(), 105, 42, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Official Document Category: ${form.category}  |  Version: ${form.version}`, 105, 50, { align: 'center' });

  // Instructions Bar
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(252, 211, 77);
  doc.roundedRect(15, 60, 180, 14, 1.5, 1.5, 'FD');
  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('INSTRUCTIONS / வழிகாட்டுதல்கள்:', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text('Fill in Capital letters with black or blue ballpoint pen. Attach copy of TNPA Member ID card & Aadhaar.', 20, 70);

  // Form Fields Table
  let currentY = 82;
  const fields = [
    { num: '1', label: 'Applicant Full Name / விண்ணப்பதாரர் பெயர்:', sample: '________________________________________________' },
    { num: '2', label: 'TNPA Membership Registration No:', sample: 'TNP-____________________________________________' },
    { num: '3', label: 'Father / Husband Name / தந்தை அல்லது கணவர் பெயர்:', sample: '________________________________________________' },
    { num: '4', label: 'Date of Birth & Age / பிறந்த தேதி மற்றும் வயது:', sample: 'DD / MM / YYYY      |  Age: ______ Years' },
    { num: '5', label: 'Permanent Address / நிரந்தர முகவரி:', sample: '________________________________________________\n____________________ District: ___________________' },
    { num: '6', label: 'Mobile / WhatsApp Number / கைபேசி எண்:', sample: '+91 ____________________' },
    { num: '7', label: 'Aadhaar Card Number / ஆதார் எண்:', sample: 'XXXX - XXXX - ________________' },
    { num: '8', label: 'Bank Account Number & IFSC / வங்கிக் கணக்கு எண்:', sample: 'A/c: ___________________  IFSC: _________________' },
    { num: '9', label: 'Painting Experience / தொழில் அனுபவம் (வருடங்கள்):', sample: '______ Years (Commercial / Residential)' },
    { num: '10', label: 'Scheme Details / நலத்திட்டக் கோரிக்கை விவரம்:', sample: `${form.nameEn} claim under welfare bylaws` }
  ];

  fields.forEach((f) => {
    // Row background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, currentY, 180, 14, 'D');

    // Number tag
    doc.setFillColor(241, 245, 249);
    doc.rect(15, currentY, 10, 14, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(f.num, 20, currentY + 9, { align: 'center' });

    // Field Label
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(f.label, 28, currentY + 6);

    // Field line / sample
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(f.sample, 28, currentY + 11);

    currentY += 14;
  });

  // Photo Box (at top right)
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.rect(158, 38, 32, 40);
  doc.setFillColor(248, 250, 252);
  doc.rect(158, 38, 32, 40, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text('Affix Passport Size', 174, 55, { align: 'center' });
  doc.text('Recent Photograph', 174, 60, { align: 'center' });
  doc.text('(Signed Across)', 174, 65, { align: 'center' });

  // Declaration section
  currentY += 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, currentY, 180, 22, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('APPLICANT UNDERTAKING & DECLARATION:', 19, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'I hereby affirm that all particulars filled above are true and complete to the best of my knowledge.\nI am an active painter member of the Tamil Nadu Painters Association (TNPA).',
    19,
    currentY + 12
  );

  // Signatures Section
  currentY += 28;
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY, 85, 22);
  doc.rect(105, currentY, 90, 22);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Signature / Thumb Impression of Applicant', 57, currentY + 18, { align: 'center' });
  doc.text('District Secretary / State Office Seal', 150, currentY + 18, { align: 'center' });

  // Footer bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Official TNPA Welfare Board Application Portal  |  Download Time: ' + new Date().toLocaleDateString('en-IN') + '  |  Form Security ID: TNP-EFORM-2026',
    105,
    293.5,
    { align: 'center' }
  );

  return doc.output('blob');
}

/**
 * Generates an official Course Workbook / Safety Bylaws / Technical Manual PDF
 */
export async function generateCourseDocumentPdf(docInfo: {
  title: string;
  titleEn: string;
  category: string;
  desc: string;
  fileName: string;
}): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header Banner
  doc.setFillColor(192, 0, 0);
  doc.rect(0, 0, 210, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TAMIL NADU PAINTERS & ARTISTS WELFARE ASSOCIATION', 105, 11, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Skill Development & Occupational Safety Council  |  Official Training Workbook', 105, 18, { align: 'center' });

  // Title Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 33, 180, 25, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(docInfo.titleEn.toUpperCase(), 105, 42, { align: 'center' });

  doc.setTextColor(192, 0, 0);
  doc.setFontSize(9);
  doc.text(`Subject: ${docInfo.category.toUpperCase()} | Version 2026.1 | Ref: ${docInfo.fileName}`, 105, 51, { align: 'center' });

  // Course Overview
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. COURSE SYLLABUS & OVERVIEW / பாடத்திட்டம்:', 15, 68);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const splitDesc = doc.splitTextToSize(docInfo.desc, 180);
  doc.text(splitDesc, 15, 75);

  // Technical Modules Table
  let curY = 100;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. TECHNICAL MODULES & CORE COMPETENCIES:', 15, curY);

  curY += 6;
  const modules = [
    { title: 'Module 1: Safety & Environmental PPE Protocols', desc: 'Respirators, safety goggles, chemical-resistant gloves, scaffolding checks.' },
    { title: 'Module 2: Substrate Inspection & Primer Application', desc: 'Moisture metering, sandpaper grades (80/120/220), acrylic wall putty adhesion.' },
    { title: 'Module 3: Equipment Operation & Maintenance', desc: 'Spray pressure calibration, viscosity check, nozzle cleanup and filters.' },
    { title: 'Module 4: Quality Inspection & Longevity Standards', desc: 'DFT measurement, adhesion peel tests, weather resistance certification.' }
  ];

  modules.forEach((mod, idx) => {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, curY, 180, 18, 1.5, 1.5, 'FD');

    doc.setTextColor(192, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`0${idx + 1}. ${mod.title}`, 20, curY + 6);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(mod.desc, 20, curY + 12);

    curY += 22;
  });

  // Checklist
  curY += 4;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(252, 211, 77);
  doc.roundedRect(15, curY, 180, 45, 2, 2, 'FD');

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('MANDATORY SAFETY RULES / உயிர் பாதுகாப்பு விதிகள்:', 20, curY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  doc.text('• Always wear cartridge respirator when spraying solvent-based or epoxy paints.', 22, curY + 16);
  doc.text('• Double check all scaffolding planks and safety harnesses above 10 feet height.', 22, curY + 23);
  doc.text('• Keep first-aid and eye-wash kits easily accessible at all commercial work sites.', 22, curY + 30);
  doc.text('• Ensure adequate cross-ventilation in interior residential paint jobs.', 22, curY + 37);

  // Signoff footer
  curY += 52;
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Issued by: Technical Education Directorate, Tamil Nadu Painters Association (TNPA)', 105, curY, { align: 'center' });
  doc.text('Verification: https://tamilnadupainters.org/verify  |  All rights reserved', 105, curY + 5, { align: 'center' });

  // Footer bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('TNPA Official Training Materials  |  Reg No: TNMDUJCLMDUTU-50-26-00044', 105, 293.5, { align: 'center' });

  return doc.output('blob');
}

/**
 * Generates an official Verified Skill Certification PDF
 */
export async function generateSkillCertificatePdf(cert: {
  title: string;
  titleEn: string;
  recipientName: string;
  regNo: string;
  issueDate: string;
  score: string;
  verificationId: string;
}): Promise<Blob> {
  // A4 Landscape certificate
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Outer Gold / Blue Border
  doc.setDrawColor(217, 119, 6); // Amber Gold
  doc.setLineWidth(3);
  doc.rect(10, 10, 277, 190);

  doc.setDrawColor(15, 23, 42); // Slate Navy
  doc.setLineWidth(0.8);
  doc.rect(14, 14, 269, 182);

  // Certificate Header
  doc.setFillColor(192, 0, 0);
  doc.rect(14, 14, 269, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TAMIL NADU PAINTERS & ARTISTS WELFARE ASSOCIATION', 148.5, 24, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('State Council of Vocational Skills & Professional Painter Certification', 148.5, 30, { align: 'center' });

  // Certificate Main Heading
  doc.setTextColor(217, 119, 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CERTIFICATE OF PROFESSIONAL COMPETENCY', 148.5, 52, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.text('This is to officially certify that', 148.5, 62, { align: 'center' });

  // Recipient Name
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(cert.recipientName.toUpperCase(), 148.5, 75, { align: 'center' });

  // Underline
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.line(70, 78, 227, 78);

  // Membership & Details
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Membership Reg No: ${cert.regNo}  |  Assessment Score: ${cert.score}`, 148.5, 86, { align: 'center' });

  // Certification Course Title
  doc.setTextColor(192, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(cert.titleEn, 148.5, 102, { align: 'center' });

  // Description text
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const certText =
    'has successfully completed all required technical modules, safety standards, and practical assessments, demonstrating outstanding professional expertise and compliance with Tamil Nadu state occupational craftsmanship bylaws.';
  const splitText = doc.splitTextToSize(certText, 220);
  doc.text(splitText, 148.5, 114, { align: 'center' });

  // Details Grid Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(30, 132, 237, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`Verification ID: ${cert.verificationId}`, 36, 142);
  doc.text(`Date of Certification: ${cert.issueDate}`, 36, 150);

  doc.text('Authority: Tamil Nadu Painters Association Council', 140, 142);
  doc.text('Verification Portal: https://tamilnadupainters.org/verify', 140, 150);

  // Signatures
  doc.setDrawColor(148, 163, 184);
  doc.line(40, 180, 95, 180);
  doc.line(200, 180, 255, 180);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('STATE PRESIDENT / SECRETARY', 67.5, 186, { align: 'center' });
  doc.text('CHIEF TECHNICAL DIRECTOR', 227.5, 186, { align: 'center' });

  return doc.output('blob');
}
