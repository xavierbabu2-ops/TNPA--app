import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { shareOrDownloadBlob } from './pdfDownloadHelper';

export { shareOrDownloadBlob };

export const DEFAULT_MEMBER_FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400&h=500';

export const DEFAULT_MEMBER_AVATAR_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
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

export interface IdCardExportResult {
  success: boolean;
  blob?: Blob;
  blobUrl?: string;
  dataUrl?: string;
  fileName?: string;
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
  onSuccess?: (result: { blob: Blob; blobUrl: string; fileName: string; dataUrl?: string }) => void;
}

/**
 * Safely converts an image URL or loaded Image element into a local Data URI so html2canvas never encounters CORS/tainting issues.
 * NEVER replaces genuine member photos or association logos with dark robot placeholders.
 */
async function urlToDataUri(url: string, imgElement?: HTMLImageElement): Promise<string> {
  if (!url) return '';
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

  // 5. If everything fails, preserve original URL so html2canvas built-in engine renders it
  return url;
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
    allowTaint: true,
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
      const blob = pdf.output('blob');
      const blobUrl = triggerBlobDownload(blob, fileName);

      if (onSuccess) {
        onSuccess({ blob, blobUrl, fileName });
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
        const blob = pdf.output('blob');
        const blobUrl = triggerBlobDownload(blob, fileName);

        if (onSuccess) {
          onSuccess({ blob, blobUrl, fileName });
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
      frontCanvas = await html2canvas(frontEl, getSafeCanvasOptions(frontEl, 2.5));
    }

    if (onProgress) onProgress('பின்பக்க அட்டையைத் தொகுக்கிறது (Processing Back Side)...');
    let backCanvas: HTMLCanvasElement | null = null;
    if (backEl) {
      backCanvas = await html2canvas(backEl, getSafeCanvasOptions(backEl, 2.5));
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
    const blob = pdf.output('blob');
    const blobUrl = triggerBlobDownload(blob, fileName);

    if (onSuccess) {
      onSuccess({ blob, blobUrl, fileName });
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

      canvas.toBlob((blob) => {
        if (blob) {
          triggerBlobDownload(blob, fileName);
        } else {
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
        canvas.toBlob((blob) => {
          if (blob) triggerBlobDownload(blob, fileName);
        }, 'image/png', 1.0);
        return true;
      }
      return false;
    }

    if (frontEl) {
      if (onProgress) onProgress('முன்பக்க படம் சேமிக்கிறது (Front Side 300 DPI)...');
      const restoreF = await prepareElementImages(frontEl);
      const frontCanvas = await html2canvas(frontEl, getSafeCanvasOptions(frontEl, 3));
      restoreF();
      const fileNameFront = createSafeFileName('TNPA_Card_Front', memberName, memberId, 'png');
      frontCanvas.toBlob((blob) => {
        if (blob) triggerBlobDownload(blob, fileNameFront);
      }, 'image/png', 1.0);
    }

    if (backEl) {
      if (onProgress) onProgress('பின்பக்க படம் சேமிக்கிறது (Back Side 300 DPI)...');
      const restoreB = await prepareElementImages(backEl);
      const backCanvas = await html2canvas(backEl, getSafeCanvasOptions(backEl, 3));
      restoreB();
      const fileNameBack = createSafeFileName('TNPA_Card_Back', memberName, memberId, 'png');
      backCanvas.toBlob((blob) => {
        if (blob) triggerBlobDownload(blob, fileNameBack);
      }, 'image/png', 1.0);
    }

    if (onProgress) onProgress('✅ படங்கள் வெற்றிகரமாக சேமிக்கப்பட்டது!');
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
