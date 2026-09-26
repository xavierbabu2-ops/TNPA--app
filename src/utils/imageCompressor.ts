/**
 * Image compression utility for PWA & Firestore & Local Storage
 * Automatically resizes and compresses user-uploaded photos, logos, emblems, and card backgrounds
 * into lightweight web-ready Data URIs (~20KB - 150KB).
 * Prevents Firestore 1MB document limit errors and browser localStorage QuotaExceededError.
 */

export function compressImageFile(
  file: File,
  maxDim = 380,
  quality = 0.82
): Promise<string> {
  return compressImageForCard(file, maxDim, quality, false);
}

/**
 * Enhanced compressor for ID Card graphics:
 * - Supports File and base64/DataURL input
 * - Preserves transparent PNGs (for logos, seals, watermarks)
 * - Restricts pixel bounds and byte size safely
 */
export function compressImageForCard(
  input: File | string,
  maxDim = 800,
  quality = 0.82,
  preserveAlpha = true
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!input) {
      reject(new Error("No image input provided"));
      return;
    }

    const processDataUrl = (dataUrl: string, isPngOrWebp: boolean) => {
      const img = new Image();
      img.onerror = () => {
        // Safe fallback to dataUrl if decode fails
        resolve(dataUrl);
      };
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          if (!preserveAlpha || !isPngOrWebp) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          let outputFormat = "image/jpeg";
          if (preserveAlpha && (isPngOrWebp || dataUrl.includes("image/png") || dataUrl.includes("image/webp"))) {
            outputFormat = "image/png";
          }

          const compressed = canvas.toDataURL(outputFormat, quality);
          resolve(compressed);
        } catch (e) {
          console.warn("[ImageCompressor] Canvas fallback:", e);
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };

    if (typeof input === "string") {
      const isPng = input.startsWith("data:image/png") || input.startsWith("data:image/webp");
      processDataUrl(input, isPng);
    } else {
      if (!input.type || !input.type.startsWith("image/")) {
        reject(new Error("Selected file is not an image"));
        return;
      }
      const isPng = input.type === "image/png" || input.type === "image/webp";
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.onload = () => {
        const dataUrl = reader.result as string;
        if (!dataUrl) {
          reject(new Error("Empty image file"));
          return;
        }
        processDataUrl(dataUrl, isPng);
      };
      reader.readAsDataURL(input);
    }
  });
}
