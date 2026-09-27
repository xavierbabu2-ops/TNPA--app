import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { shareOrDownloadBlob, directDownloadDataUrl, blobToDataUrl } from './pdfDownloadHelper';
import { renderDigitalMemberCardImage, CardImageRenderOptions, CardImageRenderResult } from './idCardImageRenderer';

export { shareOrDownloadBlob, directDownloadDataUrl, blobToDataUrl, renderDigitalMemberCardImage };
export type { CardImageRenderOptions, CardImageRenderResult };

export const DEFAULT_MEMBER_FALLBACK_PHOTO = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360" width="300" height="360">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>
  <rect width="300" height="360" fill="url(#bgGrad)" rx="8"/>
  <circle cx="150" cy="120" r="55" fill="url(#avatarGrad)"/>
  <path d="M 40,310 C 40,210 100,195 150,195 C 200,195 260,210 260,310 Z" fill="url(#avatarGrad)"/>
  <rect x="0" y="315" width="300" height="45" fill="#C00000"/>
  <text x="150" y="344" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">TNPA MEMBER</text>
</svg>
`)}`;

export const DEFAULT_MEMBER_AVATAR_DATA_URI = DEFAULT_MEMBER_FALLBACK_PHOTO;

export interface IdCardExportResult {
  success: boolean;
  blob?: Blob;
  blobUrl?: string;
  dataUrl?: string;
  fileName?: string;
  frontPngBlob?: Blob;
  frontPngUrl?: string;
  frontPngFileName?: string;
  frontJpgBlob?: Blob;
  frontJpgUrl?: string;
  frontJpgFileName?: string;
  backPngBlob?: Blob;
  backPngUrl?: string;
  backPngFileName?: string;
  backJpgBlob?: Blob;
  backJpgUrl?: string;
  backJpgFileName?: string;
  combPngBlob?: Blob;
  combPngUrl?: string;
  combPngFileName?: string;
  combJpgBlob?: Blob;
  combJpgUrl?: string;
  combJpgFileName?: string;
  error?: string;
}

export interface IdCardExportOptions {
  memberName: string;
  memberId?: string;
  district?: string;
  photoUrl?: string;
  frontElementId?: string;
  backElementId?: string;
  singleElementId?: string;
  onProgress?: (status: string) => void;
  onSuccess?: (result: IdCardExportResult) => void;
}

/**
 * Safely converts an image URL or loaded Image element into a local Data URI so html2canvas never encounters CORS/tainting issues.
 * Returns DEFAULT_MEMBER_FALLBACK_PHOTO if external network or CORS fails, ensuring zero crashes.
 */
async function urlToDataUri(url: string, imgElement?: HTMLImageElement): Promise<string> {
  if (!url) return DEFAULT_MEMBER_FALLBACK_PHOTO;
  if (url.startsWith('data:')) return url;

  // 1. If live DOM <img> element is already fully loaded and rendered, draw directly to canvas
  if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
    try {
      const c = document.createElement('canvas');
      c.width = imgElement.naturalWidth || imgElement.width || 300;
      c.height = imgElement.naturalHeight || imgElement.height || 300;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.drawImage(imgElement, 0, 0);
        const dataUri = c.toDataURL('image/png');
        if (dataUri && dataUri.length > 200) {
          return dataUri;
        }
      }
    } catch {
      // Continue to network/blob fetch if direct canvas capture is restricted
    }
  }

  // 2. If blob URL, convert via FileReader directly
  if (url.startsWith('blob:')) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      // Continue
    }
  }

  // 3. Try fetching image as blob (handles local assets and CORS-enabled remote hosts)
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });
    if (res.ok) {
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Continue to offscreen Image loader
  }

  // 4. Try loading into temporary offscreen Image with anonymous CORS
  try {
    const dataUri = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = img.naturalWidth || img.width || 300;
          c.height = img.naturalHeight || img.height || 300;
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(c.toDataURL('image/png'));
            return;
          }
        } catch (e) {
          reject(e);
        }
        reject(new Error('Canvas conversion failed'));
      };
      img.onerror = reject;
      img.src = url;
    });
    if (dataUri && dataUri.length > 200) return dataUri;
  } catch {
    // Continue
  }

  // 5. If everything fails, return safe embedded SVG so html2canvas never halts with CORS error
  return DEFAULT_MEMBER_FALLBACK_PHOTO;
}

/**
 * Pre-converts all <img> elements inside the target element to safe base64 Data URLs
 * before html2canvas runs, then restores them afterward.
 */
async function prepareElementImages(element: HTMLElement): Promise<() => void> {
  const images = Array.from(element.querySelectorAll('img'));
  const originalData: Array<{ img: HTMLImageElement; src: string; crossOrigin: string | null }> = [];

  await Promise.all(
    images.map(async (img) => {
      const currentSrc = img.src;
      if (!currentSrc || currentSrc.startsWith('data:')) return;

      originalData.push({
        img,
        src: currentSrc,
        crossOrigin: img.getAttribute('crossorigin')
      });

      try {
        const safeData = await urlToDataUri(currentSrc, img);
        if (safeData && safeData !== currentSrc) {
          img.src = safeData;
        }
      } catch (err) {
        console.warn('Image pre-conversion notice:', err);
      }
    })
  );

  return () => {
    for (const item of originalData) {
      item.img.src = item.src;
      if (item.crossOrigin !== null) {
        item.img.setAttribute('crossorigin', item.crossOrigin);
      } else {
        item.img.removeAttribute('crossorigin');
      }
    }
  };
}

/**
 * Configure html2canvas with safe, robust options that support modern Tailwind styles.
 */
function getSafeCanvasOptions(el: HTMLElement, scale = 2) {
  return {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 15000,
    windowWidth: Math.max(900, el.scrollWidth || 900),
    windowHeight: Math.max(600, el.scrollHeight || 600),
    ignoreElements: (element: Element) => {
      // Ignore all buttons, camera icons, edit overlays, and explicit no-print elements
      if (
        element.classList.contains('no-print') ||
        element.getAttribute('data-no-print') === 'true' ||
        element.tagName === 'BUTTON' ||
        element.closest('.no-print') ||
        element.closest('[data-no-print="true"]')
      ) {
        return true;
      }
      return false;
    },
    onclone: (clonedDoc: Document) => {
      // Hide all buttons, camera overlays, edit indicators in cloned DOM
      const toHide = clonedDoc.querySelectorAll('button, .no-print, [data-no-print="true"], .edit-overlay');
      toHide.forEach(item => {
        (item as HTMLElement).style.display = 'none';
      });

      // Ensure all images are displayed and have crossOrigin set when needed
      const images = clonedDoc.getElementsByTagName('img');
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const src = img.src || '';
        if (src.startsWith('http://') || src.startsWith('https://')) {
          img.crossOrigin = 'anonymous';
        }
      }
    }
  };
}

/**
 * Safe canvas to image data URL converter with multiple layers of fallback
 */
function safeCanvasToDataURL(canvas: HTMLCanvasElement): string {
  try {
    return canvas.toDataURL('image/png', 1.0);
  } catch (err) {
    console.warn('Direct toDataURL failed, trying fallback canvas:', err);
    try {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = canvas.width;
      fallbackCanvas.height = canvas.height;
      const ctx = fallbackCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvas, 0, 0);
        return fallbackCanvas.toDataURL('image/png', 1.0);
      }
    } catch (e) {
      console.error('Fallback canvas conversion also failed:', e);
    }
    // Solid 1x1 white PNG fallback so PDF builder never breaks
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  }
}

/**
 * Triggers robust download of a Blob across mobile browsers, iframes, and desktop browsers.
 * Uses Web Share API on mobile (Android / iOS) and clean direct download on desktop without opening blank tabs.
 */
export function triggerBlobDownload(blob: Blob, fileName: string): string {
  const blobUrl = URL.createObjectURL(blob);

  // Trigger robust share or download in background
  shareOrDownloadBlob(blob, fileName, 'TNPA Digital ID Card').catch(err => {
    console.warn('Background share/download handled:', err);
  });

  // Keep the blob URL valid for 5 minutes so user can open/save if needed
  setTimeout(() => {
    try {
      URL.revokeObjectURL(blobUrl);
    } catch {}
  }, 300000);

  return blobUrl;
}

/**
 * Generates an ASCII-safe and filesystem-safe filename
 */
function createSafeFileName(prefix: string, memberName: string, memberId: string, ext: string): string {
  const safeName = (memberName || 'Member')
    .replace(/[^\w-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'Member';
  const safeId = (memberId || 'TNPA')
    .replace(/[^\w-]/g, '_')
    .replace(/_+/g, '_');
  return `${prefix}_${safeId}_${safeName}.${ext}`;
}

/**
 * High-definition PDF generation for Union ID Card (Front & Back or Single Digital Card)
 */
export async function exportIdCardAsPDF(options: IdCardExportOptions): Promise<boolean> {
  const {
    memberName = 'Member',
    memberId = 'TNPA',
    district = 'Tamil Nadu',
    frontElementId = 'union-id-card-front',
    backElementId = 'union-id-card-back',
    singleElementId,
    onProgress,
    onSuccess
  } = options;

  let restoreImages: (() => void) | null = null;

  try {
    if (onProgress) onProgress('அட்டை படங்களை தயார் செய்கிறது (Rendering Card Canvas)...');

    // Case 1: Single card element (e.g. from MemberCardPortal or MemberDashboard)
    let singleEl: HTMLElement | null = null;
    if (singleElementId) {
      singleEl = document.getElementById(singleElementId);
    }

    // Fallback detection if single element requested or if not found
    if (!singleEl && singleElementId) {
      singleEl =
        document.getElementById('printable-member-card') ||
        document.getElementById('dashboard-digital-member-card') ||
        document.getElementById('union-id-card-print-container');
    }

    if (singleEl) {
      if (onProgress) onProgress('டிஜிட்டல் அட்டையைத் தொகுக்கிறது (Rendering Digital Card)...');

      // Pre-sanitize images to prevent any canvas tainting
      restoreImages = await prepareElementImages(singleEl);

      const canvas = await html2canvas(singleEl, getSafeCanvasOptions(singleEl, 2.5));
      const imgData = safeCanvasToDataURL(canvas);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Top banner
      pdf.setFillColor(192, 0, 0); // #C00000
      pdf.rect(0, 0, 210, 22, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('TAMIL NADU PAINTERS & ARTISTS WELFARE ASSOCIATION', 105, 11, { align: 'center' });
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Reg No: TNMDUJCLMDUTU-50-26-00044  |  Official Digital Membership Card', 105, 17, { align: 'center' });

      // Add Card image (centered)
      const cardWidth = 110;
      const cardHeight = (canvas.height * cardWidth) / canvas.width;
      const startY = 38;

      // Draw light frame/border
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.4);
      pdf.roundedRect((210 - cardWidth) / 2 - 2, startY - 2, cardWidth + 4, cardHeight + 4, 3, 3);

      pdf.addImage(imgData, 'PNG', (210 - cardWidth) / 2, startY, cardWidth, cardHeight);

      // Metadata info box
      const metaY = startY + cardHeight + 14;
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(25, metaY, 160, 32, 3, 3, 'FD');

      pdf.setTextColor(51, 65, 85);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text(`Member Name: ${memberName}`, 32, metaY + 8);
      pdf.text(`Membership No: ${memberId}`, 32, metaY + 16);
      pdf.text(`District: ${district}`, 32, metaY + 24);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(`Date of Export: ${new Date().toLocaleDateString('en-IN')}`, 115, metaY + 8);
      pdf.text('Status: APPROVED & DIGITALLY VERIFIED', 115, metaY + 16);
      pdf.text('Verification: Online via Portal QR', 115, metaY + 24);

      // Print Instructions footer
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text(
        'Official Digital Membership Credential. Print on A4 Photo Paper or PVC card stock (100% Scale).',
        105,
        282,
        { align: 'center' }
      );

      const fileName = createSafeFileName('TNPA_Digital_Member_Card', memberName, memberId, 'pdf');
      try {
        pdf.save(fileName);
      } catch (e) {
        console.warn('pdf.save notice:', e);
      }
      const blob = pdf.output('blob');
      const blobUrl = triggerBlobDownload(blob, fileName);

      try {
        const dataUri = pdf.output('datauristring');
        directDownloadDataUrl(dataUri, fileName);
      } catch {}

      if (onSuccess) {
        onSuccess({ success: true, blob, blobUrl, fileName });
      }

      if (onProgress) onProgress('✅ டிஜிட்டல் அட்டை PDF பதிவிறக்கம் முடிந்தது!');
      return true;
    }

    // Case 2: Front and Back element export (Official Double-Sided Card)
    let frontEl = document.getElementById(frontElementId);
    let backEl = document.getElementById(backElementId);

    // Fallbacks if element IDs vary
    if (!frontEl && !backEl) {
      frontEl = document.getElementById('union-id-card-front');
      backEl = document.getElementById('union-id-card-back');
    }

    if (!frontEl && !backEl) {
      const container = document.getElementById('union-id-card-print-container') ||
        document.getElementById('printable-member-card');
      if (container) {
        // Render whole container as single PDF
        if (onProgress) onProgress('அட்டையைத் தொகுக்கிறது (Processing ID Card)...');
        restoreImages = await prepareElementImages(container);
        const containerCanvas = await html2canvas(container, getSafeCanvasOptions(container, 2));
        const cImg = safeCanvasToDataURL(containerCanvas);

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pdf.setFillColor(192, 0, 0);
        pdf.rect(0, 0, 210, 22, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.text('TAMIL NADU PAINTERS AND ARTISTS WELFARE ASSOCIATION', 105, 11, { align: 'center' });
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Reg No: TNMDUJCLMDUTU-50-26-00044  |  Govt. Approved Official Membership ID Card', 105, 17, { align: 'center' });

        const printWidth = 170;
        const printHeight = (containerCanvas.height * printWidth) / containerCanvas.width;
        pdf.addImage(cImg, 'PNG', 20, 32, printWidth, Math.min(printHeight, 230));

        const fileName = createSafeFileName('TNPA_Official_ID_Card', memberName, memberId, 'pdf');
        try {
          pdf.save(fileName);
        } catch (e) {
          console.warn('pdf.save notice:', e);
        }
        const blob = pdf.output('blob');
        const blobUrl = triggerBlobDownload(blob, fileName);

        try {
          const dataUri = pdf.output('datauristring');
          directDownloadDataUrl(dataUri, fileName);
        } catch {}

        if (onSuccess) {
          onSuccess({ success: true, blob, blobUrl, fileName });
        }

        if (onProgress) onProgress('✅ பதிவிறக்கம் முடிந்தது!');
        return true;
      }
      throw new Error('ID Card elements not found in DOM');
    }

    // Pre-sanitize both sides
    const restoreF = frontEl ? await prepareElementImages(frontEl) : null;
    const restoreB = backEl ? await prepareElementImages(backEl) : null;
    restoreImages = () => {
      if (restoreF) restoreF();
      if (restoreB) restoreB();
    };

    if (onProgress) onProgress('முன்பக்க அட்டையைத் தொகுக்கிறது (Processing Front Side)...');
    let frontCanvas: HTMLCanvasElement | null = null;
    if (frontEl) {
      try {
        frontCanvas = await html2canvas(frontEl, getSafeCanvasOptions(frontEl, 2.5));
      } catch (err) {
        console.warn('Front canvas capture warning:', err);
      }
    }

    if (onProgress) onProgress('பின்பக்க அட்டையைத் தொகுக்கிறது (Processing Back Side)...');
    let backCanvas: HTMLCanvasElement | null = null;
    if (backEl) {
      try {
        backCanvas = await html2canvas(backEl, getSafeCanvasOptions(backEl, 2.5));
      } catch (err) {
        console.warn('Back canvas capture warning:', err);
      }
    }

    if (onProgress) onProgress('PDF கோப்பை உருவாக்குகிறது (Building High-Res PDF)...');

    // Create A4 PDF (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Top Header Banner
    pdf.setFillColor(192, 0, 0); // Official Primary Red #C00000
    pdf.rect(0, 0, 210, 24, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('TAMIL NADU PAINTERS AND ARTISTS WELFARE ASSOCIATION', 105, 12, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Reg No: TNMDUJCLMDUTU-50-26-00044  |  Govt. Approved Official Membership ID Card', 105, 18, { align: 'center' });

    const printCardWidth = 92;
    const printCardHeight = 58;

    let currentY = 36;

    // Add Front Side
    if (frontCanvas) {
      pdf.setTextColor(30, 30, 30);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('1. FRONT SIDE (CR-80 PVC Standard)', 105, currentY - 3, { align: 'center' });

      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.rect((210 - printCardWidth) / 2 - 1, currentY - 1, printCardWidth + 2, printCardHeight + 2);

      const frontImg = safeCanvasToDataURL(frontCanvas);
      pdf.addImage(frontImg, 'PNG', (210 - printCardWidth) / 2, currentY, printCardWidth, printCardHeight);
      currentY += printCardHeight + 16;
    } else {
      // Direct Vector Fallback for Front Side
      pdf.setTextColor(30, 30, 30);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('1. FRONT SIDE (Digital Vector Card)', 105, currentY - 3, { align: 'center' });

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(192, 0, 0);
      pdf.setLineWidth(0.8);
      pdf.roundedRect((210 - printCardWidth) / 2, currentY, printCardWidth, printCardHeight, 3, 3, 'FD');

      pdf.setFillColor(192, 0, 0);
      pdf.roundedRect((210 - printCardWidth) / 2, currentY, printCardWidth, 14, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7.5);
      pdf.text('TAMIL NADU PAINTERS & ARTISTS ASSOCIATION', 105, currentY + 6, { align: 'center' });
      pdf.setFontSize(6);
      pdf.text('Reg No: TNMDUJCLMDUTU-50-26-00044', 105, currentY + 11, { align: 'center' });

      pdf.setTextColor(192, 0, 0);
      pdf.setFontSize(8);
      pdf.text(`REG NO: ${memberId}`, (210 - printCardWidth) / 2 + 6, currentY + 22);
      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(9);
      pdf.text(`NAME: ${memberName}`, (210 - printCardWidth) / 2 + 6, currentY + 30);
      pdf.setFontSize(7.5);
      pdf.text(`DISTRICT: ${district}`, (210 - printCardWidth) / 2 + 6, currentY + 38);
      pdf.text('OCCUPATION: Painter & Artist', (210 - printCardWidth) / 2 + 6, currentY + 46);

      currentY += printCardHeight + 16;
    }

    // Add Back Side
    if (backCanvas) {
      pdf.setTextColor(30, 30, 30);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('2. BACK SIDE (CR-80 PVC Standard)', 105, currentY - 3, { align: 'center' });

      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.rect((210 - printCardWidth) / 2 - 1, currentY - 1, printCardWidth + 2, printCardHeight + 2);

      const backImg = safeCanvasToDataURL(backCanvas);
      pdf.addImage(backImg, 'PNG', (210 - printCardWidth) / 2, currentY, printCardWidth, printCardHeight);
      currentY += printCardHeight + 14;
    } else {
      // Direct Vector Fallback for Back Side
      pdf.setTextColor(30, 30, 30);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('2. BACK SIDE (Digital Vector Card)', 105, currentY - 3, { align: 'center' });

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(192, 0, 0);
      pdf.setLineWidth(0.8);
      pdf.roundedRect((210 - printCardWidth) / 2, currentY, printCardWidth, printCardHeight, 3, 3, 'FD');

      pdf.setFillColor(192, 0, 0);
      pdf.roundedRect((210 - printCardWidth) / 2, currentY, printCardWidth, 14, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7.5);
      pdf.text('MEMBERSHIP RULES & CREDENTIALS', 105, currentY + 6, { align: 'center' });
      pdf.setFontSize(6);
      pdf.text('Govt. Approved Welfare Association', 105, currentY + 11, { align: 'center' });

      pdf.setTextColor(40, 40, 40);
      pdf.setFontSize(7.5);
      pdf.text(`Member Name: ${memberName}`, (210 - printCardWidth) / 2 + 6, currentY + 22);
      pdf.text(`District: ${district}`, (210 - printCardWidth) / 2 + 6, currentY + 30);
      pdf.text('Contact / Help: 7010131915 / 9842189420', (210 - printCardWidth) / 2 + 6, currentY + 38);
      pdf.text('Valid Across All Districts in Tamil Nadu', (210 - printCardWidth) / 2 + 6, currentY + 46);

      currentY += printCardHeight + 14;
    }

    // Member metadata & verification note box
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(20, currentY, 170, 32, 3, 3, 'FD');

    pdf.setTextColor(51, 65, 85);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(`Member Name: ${memberName}`, 26, currentY + 8);
    pdf.text(`Membership Reg No: ${memberId}`, 26, currentY + 15);
    pdf.text(`District: ${district}`, 26, currentY + 22);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`Date of Issue: ${new Date().toLocaleDateString('en-IN')}`, 120, currentY + 8);
    pdf.text('Status: APPROVED & DIGITALLY SIGNED', 120, currentY + 15);
    pdf.text('Verification: Online via QR Code / Portal', 120, currentY + 22);

    // Footer notice
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(8);
    pdf.text(
      'Print Instructions: Print on glossy card stock or A4 photo paper (100% scale), cut along guide marks & laminate for CR-80 PVC format.',
      105,
      282,
      { align: 'center' }
    );

    const fileName = createSafeFileName('TNPA_Official_ID_Card', memberName, memberId, 'pdf');
    try {
      pdf.save(fileName);
    } catch (e) {
      console.warn('pdf.save notice:', e);
    }
    const blob = pdf.output('blob');
    const blobUrl = triggerBlobDownload(blob, fileName);

    try {
      const dataUri = pdf.output('datauristring');
      directDownloadDataUrl(dataUri, fileName);
    } catch {}

    if (onSuccess) {
      onSuccess({ success: true, blob, blobUrl, fileName });
    }

    if (onProgress) onProgress('✅ பதிவிறக்கம் முடிந்தது (Download Complete)!');
    return true;
  } catch (error) {
    console.error('Failed to export ID card as PDF:', error);
    if (onProgress) onProgress('❌ பிழை ஏற்பட்டது. அச்சிடு முறையைப் பயன்படுத்தவும்.');
    return false;
  } finally {
    if (restoreImages) {
      restoreImages();
    }
  }
}

/**
 * Direct High-Resolution PNG Image Export for a single element (Front or Back or Container)
 */
export async function exportSingleCardImage(
  elementId: string,
  fileNameSuffix: 'Front' | 'Back' | 'Digital_Card' | 'Official_Card',
  options: {
    memberName: string;
    memberId?: string;
    onProgress?: (status: string) => void;
  }
): Promise<boolean> {
  const { memberName = 'Member', memberId = 'TNPA', onProgress } = options;
  let restoreImages: (() => void) | null = null;

  try {
    const el = document.getElementById(elementId);
    if (!el) {
      if (onProgress) onProgress(`❌ அட்டை விவரம் காணப்படவில்லை (${elementId})`);
      return false;
    }

    if (onProgress) onProgress(`${fileNameSuffix} உயர் தர படம் தயார் செய்கிறது...`);
    restoreImages = await prepareElementImages(el);
    const canvas = await html2canvas(el, getSafeCanvasOptions(el, 3));
    const fileName = createSafeFileName(`TNPA_Card_${fileNameSuffix}`, memberName, memberId, 'png');

    await new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          triggerBlobDownload(blob, fileName);
        } else {
          // Direct base64 fallback
          const dataUrl = safeCanvasToDataURL(canvas);
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            try { document.body.removeChild(link); } catch {}
          }, 1000);
        }
        resolve();
      }, 'image/png', 1.0);
    });

    if (onProgress) onProgress(`✅ ${fileNameSuffix} படம் வெற்றிகரமாக பதிவிறக்கப்பட்டது!`);
    return true;
  } catch (err) {
    console.error('Failed to export single card image:', err);
    if (onProgress) onProgress('❌ படம் சேமிப்பதில் பிழை ஏற்பட்டது.');
    return false;
  } finally {
    if (restoreImages) restoreImages();
  }
}

/**
 * Direct High-Resolution PNG Images Export (Front & Back or Single Card)
 */
export async function exportIdCardAsImages(options: IdCardExportOptions): Promise<boolean> {
  const {
    memberName = 'Member',
    memberId = 'TNPA',
    frontElementId = 'union-id-card-front',
    backElementId = 'union-id-card-back',
    singleElementId,
    onProgress
  } = options;

  let restoreImages: (() => void) | null = null;

  try {
    // Case 1: Single Card export (Digital Card)
    let singleEl: HTMLElement | null = null;
    if (singleElementId) {
      singleEl = document.getElementById(singleElementId);
    }
    if (!singleEl && singleElementId) {
      singleEl =
        document.getElementById('printable-member-card') ||
        document.getElementById('dashboard-digital-member-card') ||
        document.getElementById('track-card-print-area') ||
        document.getElementById('union-id-card-print-container');
    }

    if (singleEl) {
      if (onProgress) onProgress('உயர் தர அட்டை படத்தை உருவாக்குகிறது (Generating Image)...');
      restoreImages = await prepareElementImages(singleEl);
      const canvas = await html2canvas(singleEl, getSafeCanvasOptions(singleEl, 3));
      const fileName = createSafeFileName('TNPA_Digital_Card', memberName, memberId, 'png');
      const dataUrl = safeCanvasToDataURL(canvas);
      directDownloadDataUrl(dataUrl, fileName);

      canvas.toBlob((blob) => {
        if (blob) {
          triggerBlobDownload(blob, fileName);
        }
      }, 'image/png', 1.0);

      if (onProgress) onProgress('✅ டிஜிட்டல் அட்டை படம் சேமிக்கப்பட்டது!');
      return true;
    }

    // Case 2: Front and Back images
    let frontEl = document.getElementById(frontElementId);
    let backEl = document.getElementById(backElementId);

    if (!frontEl && !backEl) {
      frontEl = document.getElementById('union-id-card-front');
      backEl = document.getElementById('union-id-card-back');
    }

    if (!frontEl && !backEl) {
      const container = document.getElementById('union-id-card-print-container') ||
        document.getElementById('printable-member-card') ||
        document.getElementById('track-card-print-area');
      if (container) {
        restoreImages = await prepareElementImages(container);
        const canvas = await html2canvas(container, getSafeCanvasOptions(container, 3));
        const fileName = createSafeFileName('TNPA_Official_Card', memberName, memberId, 'png');
        const dataUrl = safeCanvasToDataURL(canvas);
        directDownloadDataUrl(dataUrl, fileName);
        canvas.toBlob((blob) => {
          if (blob) triggerBlobDownload(blob, fileName);
        }, 'image/png', 1.0);
        return true;
      }
      return false;
    }

    let frontCanvas: HTMLCanvasElement | null = null;
    let backCanvas: HTMLCanvasElement | null = null;

    let frontPngUrl: string | undefined = undefined;
    let frontJpgUrl: string | undefined = undefined;
    let frontPngBlob: Blob | undefined = undefined;
    let frontJpgBlob: Blob | undefined = undefined;
    const fileNameFrontPng = createSafeFileName('TNPA_Card_Front', memberName, memberId, 'png');
    const fileNameFrontJpg = createSafeFileName('TNPA_Card_Front', memberName, memberId, 'jpg');

    if (frontEl) {
      if (onProgress) onProgress('முன்பக்க படம் சேமிக்கிறது (Front Side 300 DPI)...');
      const restoreF = await prepareElementImages(frontEl);
      frontCanvas = await html2canvas(frontEl, getSafeCanvasOptions(frontEl, 3));
      restoreF();
      
      frontPngUrl = safeCanvasToDataURL(frontCanvas);
      try {
        frontJpgUrl = frontCanvas.toDataURL('image/jpeg', 0.95);
      } catch {}

      await new Promise<void>((resolve) => {
        frontCanvas?.toBlob((blob) => {
          if (blob) frontPngBlob = blob;
          resolve();
        }, 'image/png', 1.0);
      });

      await new Promise<void>((resolve) => {
        frontCanvas?.toBlob((blob) => {
          if (blob) frontJpgBlob = blob;
          resolve();
        }, 'image/jpeg', 0.95);
      });
    }

    let backPngUrl: string | undefined = undefined;
    let backJpgUrl: string | undefined = undefined;
    let backPngBlob: Blob | undefined = undefined;
    let backJpgBlob: Blob | undefined = undefined;
    const fileNameBackPng = createSafeFileName('TNPA_Card_Back', memberName, memberId, 'png');
    const fileNameBackJpg = createSafeFileName('TNPA_Card_Back', memberName, memberId, 'jpg');

    if (backEl) {
      if (onProgress) onProgress('பின்பக்க படம் சேமிக்கிறது (Back Side 300 DPI)...');
      const restoreB = await prepareElementImages(backEl);
      backCanvas = await html2canvas(backEl, getSafeCanvasOptions(backEl, 3));
      restoreB();
      
      backPngUrl = safeCanvasToDataURL(backCanvas);
      try {
        backJpgUrl = backCanvas.toDataURL('image/jpeg', 0.95);
      } catch {}

      await new Promise<void>((resolve) => {
        backCanvas?.toBlob((blob) => {
          if (blob) backPngBlob = blob;
          resolve();
        }, 'image/png', 1.0);
      });

      await new Promise<void>((resolve) => {
        backCanvas?.toBlob((blob) => {
          if (blob) backJpgBlob = blob;
          resolve();
        }, 'image/jpeg', 0.95);
      });
    }

    let combPngUrl: string | undefined = undefined;
    let combJpgUrl: string | undefined = undefined;
    let combPngBlob: Blob | undefined = undefined;
    let combJpgBlob: Blob | undefined = undefined;
    const fileNameFullPng = createSafeFileName('TNPA_Full_Card_2in1', memberName, memberId, 'png');
    const fileNameFullJpg = createSafeFileName('TNPA_Full_Card_2in1', memberName, memberId, 'jpg');

    // Generate Combined Front + Back 2-in-1 print image
    if (frontCanvas && backCanvas) {
      try {
        const gap = 30;
        const pad = 30;
        const totalW = Math.max(frontCanvas.width, backCanvas.width) + pad * 2;
        const totalH = frontCanvas.height + backCanvas.height + gap + pad * 2;
        const combCanvas = document.createElement('canvas');
        combCanvas.width = totalW;
        combCanvas.height = totalH;
        const ctx = combCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, totalW, totalH);
          ctx.drawImage(frontCanvas, pad, pad);
          ctx.drawImage(backCanvas, pad, pad + frontCanvas.height + gap);
          
          combPngUrl = safeCanvasToDataURL(combCanvas);
          try {
            combJpgUrl = combCanvas.toDataURL('image/jpeg', 0.95);
          } catch {}

          await new Promise<void>((resolve) => {
            combCanvas.toBlob((blob) => {
              if (blob) combPngBlob = blob;
              resolve();
            }, 'image/png', 1.0);
          });

          await new Promise<void>((resolve) => {
            combCanvas.toBlob((blob) => {
              if (blob) combJpgBlob = blob;
              resolve();
            }, 'image/jpeg', 0.95);
          });
        }
      } catch (e) {
        console.warn('Combined canvas creation notice:', e);
      }
    }

    if (options.onSuccess) {
      options.onSuccess({
        success: true,
        frontPngUrl,
        frontPngBlob,
        frontPngFileName: fileNameFrontPng,
        frontJpgUrl,
        frontJpgBlob,
        frontJpgFileName: fileNameFrontJpg,
        backPngUrl,
        backPngBlob,
        backPngFileName: fileNameBackPng,
        backJpgUrl,
        backJpgBlob,
        backJpgFileName: fileNameBackJpg,
        combPngUrl,
        combPngBlob,
        combPngFileName: fileNameFullPng,
        combJpgUrl,
        combJpgBlob,
        combJpgFileName: fileNameFullJpg,
      });
    }

    if (onProgress) onProgress('✅ அடையாள அட்டை படங்கள் வெற்றிகரமாக தயாராகியுள்ளது!');
    return true;
  } catch (err) {
    console.error('Failed to export ID card as image:', err);
    if (onProgress) onProgress('❌ படம் சேமிப்பதில் பிழை ஏற்பட்டது.');
    return false;
  } finally {
    if (restoreImages) {
      restoreImages();
    }
  }
}

// ============================================================================
// DEDICATED HIGH-RESOLUTION MEMBER ID CARD PDF GENERATION FUNCTION
// Specifically renders the Member ID Card template with 300+ DPI high resolution,
// perfectly positioning all logos, member photos, and dynamic member text,
// completely free of watermarks, edit buttons, or rendering artifacts.
// ============================================================================

export interface DedicatedMemberCardData {
  memberName: string;
  memberNameEn?: string;
  memberId: string;
  district: string;
  place?: string;
  occupation?: string;
  phone?: string;
  bloodGroup?: string;
  joinedDate?: string;
  photoUrl?: string;
  logoLeftUrl?: string;
  logoRightUrl?: string;
  govtSealUrl?: string;
  qrCodeUrl?: string;
  customFullCardFrontUrl?: string;
  customFullCardBackUrl?: string;
  designMode?: 'official_vector' | 'uploaded_exact';
}

export interface DedicatedPDFOptions {
  scale?: number;
  format?: 'a4' | 'cr80_card';
  includeHeaderBanner?: boolean;
  onProgress?: (status: string) => void;
  onSuccess?: (result: IdCardExportResult) => void;
}

/**
 * Dedicated PDF generator specifically crafted for Tamil Nadu Painters & Artists Association Member Cards.
 * Uses html2canvas-pro and jsPDF for 300+ DPI razor-sharp print quality without artifacts or edit watermarks.
 */
export async function generateMemberIdCardPDF(
  memberData: DedicatedMemberCardData,
  options: DedicatedPDFOptions = {}
): Promise<IdCardExportResult> {
  const {
    scale = 3.5,
    format = 'a4',
    includeHeaderBanner = true,
    onProgress,
    onSuccess
  } = options;

  const memberName = memberData.memberName || 'உறுப்பினர்';
  const memberId = memberData.memberId || 'TNPA-MEM';
  const district = memberData.district || 'தமிழ்நாடு (Tamil Nadu)';
  const occupation = memberData.occupation || 'பெயிண்டர் & ஓவியர்';
  const place = memberData.place || district;
  const photoUrl = memberData.photoUrl || DEFAULT_MEMBER_FALLBACK_PHOTO;
  const logoLeftUrl = memberData.logoLeftUrl || '/tnpa_official_logo.svg';
  const logoRightUrl = memberData.logoRightUrl || '/tnpa_official_logo.svg';
  const govtSealUrl = memberData.govtSealUrl || '';

  if (onProgress) onProgress('உயர் தர அடையாள அட்டை PDF உருவாக்கப்படுகிறது (Initializing 300 DPI Engine)...');

  let container: HTMLDivElement | null = null;
  let restoreImages: (() => void) | null = null;

  try {
    // 1. Try to find existing rendered DOM elements first
    let frontEl = document.getElementById('union-id-card-front');
    let backEl = document.getElementById('union-id-card-back');

    // 2. If DOM elements are not currently active/visible, construct an offscreen high-res template
    if (!frontEl || !backEl) {
      if (onProgress) onProgress('அட்டை வார்ப்புரு கட்டமைக்கப்படுகிறது (Building Offscreen Template)...');

      container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '1200px';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '20px';
      container.style.zIndex = '-9999';

      const safePhoto = await urlToDataUri(photoUrl);
      const safeLogoL = await urlToDataUri(logoLeftUrl);
      const safeLogoR = await urlToDataUri(logoRightUrl);
      const safeSeal = govtSealUrl ? await urlToDataUri(govtSealUrl) : '';

      container.innerHTML = `
        <div style="display: flex; gap: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          
          <!-- FRONT SIDE CR-80 CARD -->
          <div id="dedicated-card-front" style="width: 540px; height: 340px; background: #ffffff; border: 4px solid #C00000; border-radius: 14px; overflow: hidden; position: relative; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
            
            <!-- Red Header Banner -->
            <div style="background: linear-gradient(135deg, #C00000 0%, #990000 100%); padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #facc15;">
              <div style="width: 52px; height: 52px; background: #ffffff; border-radius: 50%; border: 2px solid #C00000; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <img src="${safeLogoL}" style="width: 100%; height: 100%; object-fit: contain;" />
              </div>
              <div style="text-align: center; flex: 1; padding: 0 8px; color: #ffffff;">
                <div style="font-size: 13px; font-weight: 900; line-height: 1.2;">தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள்</div>
                <div style="font-size: 13px; font-weight: 900; line-height: 1.2;">முன்னேற்ற சங்கம்</div>
                <div style="font-size: 9px; font-weight: 700; color: #fef08a;">அரசு பதிவு எண்: TNMDUJCLMDUTU-50-26-00044</div>
                <div style="font-size: 8px; font-weight: 600; opacity: 0.95;">1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107</div>
              </div>
              <div style="width: 52px; height: 52px; background: #ffffff; border-radius: 50%; border: 2px solid #C00000; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <img src="${safeLogoR}" style="width: 100%; height: 100%; object-fit: contain;" />
              </div>
            </div>

            <!-- Card Body Content -->
            <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex: 1;">
              <div style="flex: 1; padding-right: 12px; line-height: 1.6;">
                <div style="margin-bottom: 6px;">
                  <span style="font-size: 12px; font-weight: 900; color: #1c1917;">உறுப்பினர் எண் : </span>
                  <span style="font-size: 15px; font-weight: 900; color: #C00000; font-family: monospace;">${memberId}</span>
                </div>
                <div style="margin-bottom: 6px;">
                  <span style="font-size: 12px; font-weight: 900; color: #1c1917;">உறுப்பினர் பெயர் : </span>
                  <span style="font-size: 14px; font-weight: 900; color: #7f1d1d;">${memberName}</span>
                </div>
                <div style="margin-bottom: 6px;">
                  <span style="font-size: 12px; font-weight: 900; color: #1c1917;">உறுப்பினர் தொழில் : </span>
                  <span style="font-size: 12px; font-weight: 700; color: #292524;">${occupation}</span>
                </div>
                <div>
                  <span style="font-size: 11px; font-weight: 900; color: #7f1d1d;">மாவட்டம் : </span>
                  <span style="font-size: 11px; font-weight: 700; color: #44403c;">${district} (${place})</span>
                </div>
              </div>

              <!-- Member Photo Frame -->
              <div style="width: 105px; height: 135px; border: 2px solid #1c1917; border-radius: 4px; overflow: hidden; background: #ffffff; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
                <img src="${safePhoto}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            </div>

            <!-- Footer Strip -->
            <div style="background: #1c1917; padding: 4px 12px; display: flex; justify-content: space-between; align-items: center; color: #ffffff; font-size: 8.5px; font-weight: 700;">
              <span style="color: #facc15;">அங்கீகரிக்கப்பட்ட உறுப்பினர் அடையாள அட்டை</span>
              <span>தமிழ்நாடு முழுவதும் செல்லுபடியாகும்</span>
            </div>
          </div>

          <!-- BACK SIDE CR-80 CARD -->
          <div id="dedicated-card-back" style="width: 540px; height: 340px; background: #ffffff; border: 4px solid #C00000; border-radius: 14px; overflow: hidden; position: relative; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
            
            <!-- Red Top Header -->
            <div style="background: linear-gradient(135deg, #C00000 0%, #990000 100%); padding: 6px 12px; text-align: center; color: #ffffff; border-bottom: 2px solid #facc15;">
              <div style="font-size: 12px; font-weight: 900;">சங்க விதிமுறைகள் & உறுப்பினர் உறுதிமொழி</div>
              <div style="font-size: 8px; font-weight: 700; color: #fef08a;">அரசு தொழிலாளர் நல வாரிய அங்கீகாரம் பெற்றது</div>
            </div>

            <!-- Back Body Content -->
            <div style="padding: 12px 16px; flex: 1; display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1; font-size: 9.5px; color: #1c1917; line-height: 1.5; padding-right: 12px;">
                <p style="margin: 0 0 4px 0;">1. இவ்வடையாள அட்டை சங்க உறுப்பினருக்கு மட்டுமே உரியது.</p>
                <p style="margin: 0 0 4px 0;">2. சங்கத்தின் நலத்திட்டங்கள் மற்றும் உதவிகளைப் பெற இவ்வட்டை அவசியம்.</p>
                <p style="margin: 0 0 4px 0;">3. அட்டை தொலைந்துபோனால் உடனடியாக தலைமை நிலையத்திற்கு தெரிவிக்கவும்.</p>
                <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #d6d3d1; font-weight: 800; color: #7f1d1d;">
                  தொடர்பு / உதவி எண்: 7010131915 / 9842189420
                </div>
              </div>

              <!-- Govt Seal / QR Area -->
              <div style="width: 95px; height: 95px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${safeSeal ? `<img src="${safeSeal}" style="width: 100%; height: 100%; object-fit: contain;" />` : `
                  <div style="width: 85px; height: 85px; border: 2px solid #047857; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4px;">
                    <div style="font-size: 7px; font-weight: 900; color: #047857;">தமிழ்நாடு அரசு</div>
                    <div style="font-size: 6px; font-weight: 800; color: #C00000; margin-top: 2px;">அனுமதி பெற்றது</div>
                  </div>
                `}
              </div>
            </div>

            <!-- Signature & Validation Footer -->
            <div style="background: #f8fafc; padding: 8px 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end;">
              <div style="text-align: left; font-size: 8px; color: #64748b; font-weight: 700;">
                <div>வழங்கப்பட்ட தேதி: ${new Date().toLocaleDateString('en-IN')}</div>
                <div style="color: #047857;">டிஜிட்டல் சரிபார்ப்பு: உறுதி செய்யப்பட்டது</div>
              </div>
              <div style="text-align: right; font-size: 9px; font-weight: 900; color: #1c1917;">
                <div style="border-bottom: 1px solid #1c1917; width: 110px; margin-bottom: 2px;"></div>
                <div>மாநில பொதுச்செயலாளர்</div>
              </div>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(container);
      frontEl = document.getElementById('dedicated-card-front');
      backEl = document.getElementById('dedicated-card-back');
    }

    if (onProgress) onProgress('முன்பக்க அட்டையைத் தொகுக்கிறது (Capturing Front Side @ 300 DPI)...');
    const restoreF = frontEl ? await prepareElementImages(frontEl) : null;
    const restoreB = backEl ? await prepareElementImages(backEl) : null;
    restoreImages = () => {
      if (restoreF) restoreF();
      if (restoreB) restoreB();
    };

    const canvasOptions = {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (element: Element): boolean => {
        return Boolean(
          element.classList.contains('no-print') ||
          element.getAttribute('data-no-print') === 'true' ||
          element.tagName === 'BUTTON' ||
          element.closest('.no-print') ||
          element.closest('[data-no-print="true"]')
        );
      },
      onclone: (clonedDoc: Document) => {
        const toHide = clonedDoc.querySelectorAll('button, .no-print, [data-no-print="true"], .edit-overlay');
        toHide.forEach(item => {
          (item as HTMLElement).style.display = 'none';
        });
      }
    };

    let frontCanvas: HTMLCanvasElement | null = null;
    if (frontEl) {
      try {
        frontCanvas = await html2canvas(frontEl, canvasOptions);
      } catch (fErr) {
        console.warn('Front canvas capture notice:', fErr);
      }
    }

    if (onProgress) onProgress('பின்பக்க அட்டையைத் தொகுக்கிறது (Capturing Back Side @ 300 DPI)...');
    let backCanvas: HTMLCanvasElement | null = null;
    if (backEl) {
      try {
        backCanvas = await html2canvas(backEl, canvasOptions);
      } catch (bErr) {
        console.warn('Back canvas capture notice:', bErr);
      }
    }

    if (onProgress) onProgress('PDF கோப்பை உருவாக்குகிறது (Compiling High-Resolution PDF)...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    if (includeHeaderBanner) {
      // Primary Association Header
      pdf.setFillColor(192, 0, 0);
      pdf.rect(0, 0, 210, 24, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13.5);
      pdf.text('TAMIL NADU PAINTERS AND ARTISTS WELFARE ASSOCIATION', 105, 11, { align: 'center' });
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Reg No: TNMDUJCLMDUTU-50-26-00044  |  Official Identification Card (CR-80 PVC)', 105, 18, { align: 'center' });
    }

    const cardWidthMm = 92;
    const cardHeightMm = 58;
    let currentY = 36;

    // Draw Front Side
    if (frontCanvas) {
      pdf.setTextColor(30, 30, 30);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.text('1. FRONT SIDE (CR-80 PVC Standard - 85.60 mm x 53.98 mm)', 105, currentY - 3, { align: 'center' });

      pdf.setDrawColor(210, 210, 210);
      pdf.setLineWidth(0.3);
      pdf.rect((210 - cardWidthMm) / 2 - 0.5, currentY - 0.5, cardWidthMm + 1, cardHeightMm + 1);

      const frontData = safeCanvasToDataURL(frontCanvas);
      pdf.addImage(frontData, 'PNG', (210 - cardWidthMm) / 2, currentY, cardWidthMm, cardHeightMm);
      currentY += cardHeightMm + 15;
    } else {
      // Direct Crisp Vector Front Card
      pdf.setTextColor(30, 30, 30);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.text('1. FRONT SIDE (Official Digital Card)', 105, currentY - 3, { align: 'center' });

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(192, 0, 0);
      pdf.setLineWidth(0.8);
      pdf.roundedRect((210 - cardWidthMm) / 2, currentY, cardWidthMm, cardHeightMm, 2.5, 2.5, 'FD');

      pdf.setFillColor(192, 0, 0);
      pdf.roundedRect((210 - cardWidthMm) / 2, currentY, cardWidthMm, 13, 2.5, 2.5, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text('TAMIL NADU PAINTERS & ARTISTS ASSOCIATION', 105, currentY + 5.5, { align: 'center' });
      pdf.setFontSize(5.5);
      pdf.text('Reg No: TNMDUJCLMDUTU-50-26-00044', 105, currentY + 10, { align: 'center' });

      pdf.setTextColor(192, 0, 0);
      pdf.setFontSize(7.5);
      pdf.text(`REG NO: ${memberId}`, (210 - cardWidthMm) / 2 + 5, currentY + 20);
      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(8.5);
      pdf.text(`NAME: ${memberName}`, (210 - cardWidthMm) / 2 + 5, currentY + 28);
      pdf.setFontSize(7);
      pdf.text(`DISTRICT: ${district}`, (210 - cardWidthMm) / 2 + 5, currentY + 36);
      pdf.text(`OCCUPATION: ${occupation}`, (210 - cardWidthMm) / 2 + 5, currentY + 44);

      currentY += cardHeightMm + 15;
    }

    // Draw Back Side
    if (backCanvas) {
      pdf.setTextColor(30, 30, 30);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.text('2. BACK SIDE (CR-80 PVC Standard - 85.60 mm x 53.98 mm)', 105, currentY - 3, { align: 'center' });

      pdf.setDrawColor(210, 210, 210);
      pdf.setLineWidth(0.3);
      pdf.rect((210 - cardWidthMm) / 2 - 0.5, currentY - 0.5, cardWidthMm + 1, cardHeightMm + 1);

      const backData = safeCanvasToDataURL(backCanvas);
      pdf.addImage(backData, 'PNG', (210 - cardWidthMm) / 2, currentY, cardWidthMm, cardHeightMm);
      currentY += cardHeightMm + 14;
    } else {
      // Direct Crisp Vector Back Card
      pdf.setTextColor(30, 30, 30);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.text('2. BACK SIDE (Official Digital Card)', 105, currentY - 3, { align: 'center' });

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(192, 0, 0);
      pdf.setLineWidth(0.8);
      pdf.roundedRect((210 - cardWidthMm) / 2, currentY, cardWidthMm, cardHeightMm, 2.5, 2.5, 'FD');

      pdf.setFillColor(192, 0, 0);
      pdf.roundedRect((210 - cardWidthMm) / 2, currentY, cardWidthMm, 13, 2.5, 2.5, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text('RULES & VERIFICATION / விதிமுறைகள்', 105, currentY + 5.5, { align: 'center' });
      pdf.setFontSize(5.5);
      pdf.text('Govt. Approved Welfare Association', 105, currentY + 10, { align: 'center' });

      pdf.setTextColor(40, 40, 40);
      pdf.setFontSize(7);
      pdf.text(`Member Name: ${memberName}`, (210 - cardWidthMm) / 2 + 5, currentY + 20);
      pdf.text(`District: ${district}`, (210 - cardWidthMm) / 2 + 5, currentY + 28);
      pdf.text('Help / Contact: 7010131915 / 9842189420', (210 - cardWidthMm) / 2 + 5, currentY + 36);
      pdf.text('Valid Across All Districts in Tamil Nadu', (210 - cardWidthMm) / 2 + 5, currentY + 44);

      currentY += cardHeightMm + 14;
    }

    // Verification Metadata Box
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(20, currentY, 170, 30, 3, 3, 'FD');

    pdf.setTextColor(51, 65, 85);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text(`Member Name: ${memberName}`, 26, currentY + 8);
    pdf.text(`Registration No: ${memberId}`, 26, currentY + 15);
    pdf.text(`District: ${district}`, 26, currentY + 22);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`Export Date: ${new Date().toLocaleDateString('en-IN')}`, 120, currentY + 8);
    pdf.text('Status: OFFICIAL & APPROVED', 120, currentY + 15);
    pdf.text('Security: Barcode & Digital Verification', 120, currentY + 22);

    // Footer Guidelines
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(7.5);
    pdf.text(
      'Print Instructions: Print at 100% scale (No fit-to-page) on A4 photo card stock, cut along borders, and laminate.',
      105,
      284,
      { align: 'center' }
    );

    const fileName = createSafeFileName('TNPA_Member_ID_Card', memberName, memberId, 'pdf');

    // Prepare PNG assets
    const frontPngUrl = frontCanvas ? safeCanvasToDataURL(frontCanvas) : undefined;
    const frontPngFileName = createSafeFileName('TNPA_Card_Front', memberName, memberId, 'png');
    const backPngUrl = backCanvas ? safeCanvasToDataURL(backCanvas) : undefined;
    const backPngFileName = createSafeFileName('TNPA_Card_Back', memberName, memberId, 'png');

    let combPngUrl: string | undefined = undefined;
    let combPngFileName: string | undefined = undefined;

    if (frontCanvas && backCanvas) {
      try {
        const gap = 30;
        const pad = 30;
        const totalW = Math.max(frontCanvas.width, backCanvas.width) + pad * 2;
        const totalH = frontCanvas.height + backCanvas.height + gap + pad * 2;
        const combCanvas = document.createElement('canvas');
        combCanvas.width = totalW;
        combCanvas.height = totalH;
        const ctx = combCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, totalW, totalH);
          ctx.drawImage(frontCanvas, pad, pad);
          ctx.drawImage(backCanvas, pad, pad + frontCanvas.height + gap);
          combPngUrl = safeCanvasToDataURL(combCanvas);
          combPngFileName = createSafeFileName('TNPA_Card_Full_2in1', memberName, memberId, 'png');
        }
      } catch (e) {
        console.warn('Combined canvas creation notice:', e);
      }
    }

    // Trigger Multi-layer Download
    try {
      pdf.save(fileName);
    } catch (e) {
      console.warn('pdf.save notice:', e);
    }

    const blob = pdf.output('blob');
    const blobUrl = triggerBlobDownload(blob, fileName);
    let dataUrl = '';

    try {
      dataUrl = pdf.output('datauristring');
      directDownloadDataUrl(dataUrl, fileName);
    } catch {}

    const fullResult: IdCardExportResult = {
      success: true,
      blob,
      blobUrl,
      dataUrl,
      fileName,
      frontPngUrl,
      frontPngFileName,
      backPngUrl,
      backPngFileName,
      combPngUrl,
      combPngFileName
    };

    if (onSuccess) {
      onSuccess(fullResult);
    }

    if (onProgress) onProgress('✅ உயர் தர அடையாள அட்டை PDF வெற்றிகரமாக பதிவிறக்கப்பட்டது!');

    return fullResult;
  } catch (err: any) {
    console.error('generateMemberIdCardPDF Error:', err);
    if (onProgress) onProgress('❌ PDF உருவாக்கத்தில் பிழை ஏற்பட்டது.');
    return { success: false, error: err?.message || 'PDF Export Failed' };
  } finally {
    if (restoreImages) restoreImages();
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
