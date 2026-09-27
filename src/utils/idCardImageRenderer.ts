import html2canvas from 'html2canvas-pro';
import { saveFileToDevice, blobToDataUrl } from './pdfDownloadHelper';

export interface CardImageRenderOptions {
  memberName: string;
  memberId: string;
  district?: string;
  frontElementId?: string;
  backElementId?: string;
  singleElementId?: string;
  format?: 'image/jpeg' | 'image/png';
  quality?: number; // 0.8 to 1.0 (default 0.95 for JPEG)
  scale?: number; // Canvas scale (default 3 for ~300 DPI)
  onProgress?: (status: string) => void;
  autoDownload?: boolean; // Whether to automatically trigger save to gallery/device
}

export interface CardImageRenderResult {
  success: boolean;
  format: 'jpeg' | 'png';
  frontUrl?: string;
  frontBlob?: Blob;
  frontFileName?: string;
  backUrl?: string;
  backBlob?: Blob;
  backFileName?: string;
  combUrl?: string;
  combBlob?: Blob;
  combFileName?: string;
  error?: string;
}

/**
 * Creates a clean, safe filename for local gallery storage
 */
export function generateCardFileName(prefix: string, name: string, id: string, ext: 'jpg' | 'png'): string {
  const cleanName = (name || 'Member')
    .replace(/[^a-zA-Z0-9_\u0B80-\u0BFF]/g, '_')
    .slice(0, 20);
  const cleanId = (id || 'ID')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 15);
  return `${prefix}_${cleanId}_${cleanName}.${ext}`;
}

/**
 * Pre-processes all images in an element into local Data URIs to prevent canvas tainting (CORS)
 */
async function sanitizeElementImages(container: HTMLElement): Promise<() => void> {
  const images = Array.from(container.querySelectorAll('img'));
  const originalSources: Array<{ img: HTMLImageElement; src: string }> = [];

  for (const img of images) {
    originalSources.push({ img, src: img.src });

    if (!img.src || img.src.startsWith('data:')) {
      continue;
    }

    try {
      if (img.complete && img.naturalWidth > 0) {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          img.src = c.toDataURL('image/png');
        }
      } else {
        const res = await fetch(img.src, { mode: 'cors' });
        if (res.ok) {
          const blob = await res.blob();
          img.src = await blobToDataUrl(blob);
        }
      }
    } catch {
      // Fallback: keep original src
    }
  }

  return () => {
    for (const { img, src } of originalSources) {
      try { img.src = src; } catch {}
    }
  };
}

/**
 * Renders a target DOM element to a high-resolution canvas with clean anti-aliasing
 */
async function renderElementToCanvas(el: HTMLElement, scale = 3): Promise<HTMLCanvasElement> {
  return await html2canvas(el, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 10000,
    ignoreElements: (element) => {
      const cls = element.className || '';
      const strCls = typeof cls === 'string' ? cls : '';
      return (
        strCls.includes('no-print') ||
        strCls.includes('hide-on-export') ||
        element.hasAttribute('data-no-export') ||
        element.tagName === 'BUTTON'
      );
    }
  });
}

/**
 * Primary Render Function:
 * Renders the digital member ID card into clean JPEG and PNG images
 * suitable for offline sharing and direct local gallery storage.
 */
export async function renderDigitalMemberCardImage(
  options: CardImageRenderOptions
): Promise<CardImageRenderResult> {
  const {
    memberName,
    memberId,
    frontElementId = 'union-id-card-front',
    backElementId = 'union-id-card-back',
    singleElementId,
    format = 'image/jpeg',
    quality = 0.96,
    scale = 3,
    onProgress,
    autoDownload = true
  } = options;

  const isJpeg = format === 'image/jpeg';
  const fileExt: 'jpg' | 'png' = isJpeg ? 'jpg' : 'png';
  const mimeType = isJpeg ? 'image/jpeg' : 'image/png';

  try {
    if (onProgress) onProgress('அடையாள அட்டை படம் தயாராகிறது (300 DPI Rendering)...');

    // 1. Locate DOM elements
    let frontEl = frontElementId ? document.getElementById(frontElementId) : null;
    let backEl = backElementId ? document.getElementById(backElementId) : null;

    if (singleElementId && (!frontEl && !backEl)) {
      const singleEl = document.getElementById(singleElementId);
      if (singleEl) {
        frontEl = singleEl;
      }
    }

    if (!frontEl && !backEl) {
      frontEl = document.getElementById('printable-member-card') ||
        document.getElementById('union-id-card-print-container') ||
        document.getElementById('track-card-print-area');
    }

    if (!frontEl && !backEl) {
      throw new Error('ID Card element not found in DOM');
    }

    let frontCanvas: HTMLCanvasElement | null = null;
    let backCanvas: HTMLCanvasElement | null = null;

    // Render Front Side
    if (frontEl) {
      if (onProgress) onProgress('முன்பக்க படம் தயாராகிறது (Front Side)...');
      const restoreImages = await sanitizeElementImages(frontEl);
      frontCanvas = await renderElementToCanvas(frontEl, scale);
      restoreImages();
    }

    // Render Back Side
    if (backEl) {
      if (onProgress) onProgress('பின்பக்க படம் தயாராகிறது (Back Side)...');
      const restoreImages = await sanitizeElementImages(backEl);
      backCanvas = await renderElementToCanvas(backEl, scale);
      restoreImages();
    }

    // Generate Single / Combined Canvases
    let frontUrl: string | undefined;
    let frontBlob: Blob | undefined;
    let frontFileName: string | undefined;

    if (frontCanvas) {
      frontUrl = frontCanvas.toDataURL(mimeType, quality);
      frontFileName = generateCardFileName('TNPA_Card_Front', memberName, memberId, fileExt);
      await new Promise<void>((resolve) => {
        frontCanvas?.toBlob((b) => {
          if (b) frontBlob = b;
          resolve();
        }, mimeType, quality);
      });
    }

    let backUrl: string | undefined;
    let backBlob: Blob | undefined;
    let backFileName: string | undefined;

    if (backCanvas) {
      backUrl = backCanvas.toDataURL(mimeType, quality);
      backFileName = generateCardFileName('TNPA_Card_Back', memberName, memberId, fileExt);
      await new Promise<void>((resolve) => {
        backCanvas?.toBlob((b) => {
          if (b) backBlob = b;
          resolve();
        }, mimeType, quality);
      });
    }

    // Combined 2-in-1 layout (Both Front and Back in a single crisp sheet)
    let combUrl: string | undefined;
    let combBlob: Blob | undefined;
    let combFileName: string | undefined;

    if (frontCanvas && backCanvas) {
      if (onProgress) onProgress('2-in-1 முழு அட்டை படம் தயாராகிறது...');
      const pad = 24 * scale;
      const gap = 20 * scale;
      const totalW = Math.max(frontCanvas.width, backCanvas.width) + pad * 2;
      const totalH = frontCanvas.height + backCanvas.height + gap + pad * 2;

      const combCanvas = document.createElement('canvas');
      combCanvas.width = totalW;
      combCanvas.height = totalH;
      const ctx = combCanvas.getContext('2d');
      if (ctx) {
        // High quality background with border frame
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, totalW, totalH);

        // Draw Front
        ctx.drawImage(frontCanvas, pad, pad);

        // Draw Back
        ctx.drawImage(backCanvas, pad, pad + frontCanvas.height + gap);

        combUrl = combCanvas.toDataURL(mimeType, quality);
        combFileName = generateCardFileName('TNPA_Full_Card_2in1', memberName, memberId, fileExt);
        await new Promise<void>((resolve) => {
          combCanvas.toBlob((b) => {
            if (b) combBlob = b;
            resolve();
          }, mimeType, quality);
        });
      }
    }

    // Auto-save to gallery if requested
    if (autoDownload) {
      const primaryUrl = combUrl || frontUrl;
      const primaryBlob = combBlob || frontBlob;
      const primaryName = combFileName || frontFileName || `TNPA_Card_${memberId}.${fileExt}`;

      if (primaryUrl || primaryBlob) {
        await saveFileToDevice(
          { blob: primaryBlob, dataUrl: primaryUrl },
          primaryName,
          `TNPA Member Card - ${memberName}`,
          'auto'
        );
      }
    }

    if (onProgress) onProgress('✅ படம் வெற்றிகரமாக தயார் செய்யப்பட்டு சேமிக்கப்பட்டது!');

    return {
      success: true,
      format: isJpeg ? 'jpeg' : 'png',
      frontUrl,
      frontBlob,
      frontFileName,
      backUrl,
      backBlob,
      backFileName,
      combUrl,
      combBlob,
      combFileName
    };
  } catch (err: any) {
    console.error('Card image render failure:', err);
    if (onProgress) onProgress(`❌ பிழை: ${err.message || 'படம் உருவாக்குவதில் பிழை'}`);
    return {
      success: false,
      format: isJpeg ? 'jpeg' : 'png',
      error: err.message || 'Render failed'
    };
  }
}
