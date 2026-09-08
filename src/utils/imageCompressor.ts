/**
 * Image compression utility for PWA & Firestore
 * Automatically resizes and compresses user-uploaded photos (from mobile camera, WhatsApp, gallery, up to 15MB)
 * into a lightweight passport-sized JPEG Data URI (~20KB - 40KB, max 380x380).
 * Prevents Firestore 1MB document size limit exceeded errors and browser localStorage QuotaExceededError.
 */
export function compressImageFile(
  file: File,
  maxDim = 380,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    // If not an image, reject
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (!dataUrl) {
        reject(new Error("Empty image data"));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image data"));
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Scale maintaining aspect ratio
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

          // Fill clean background to avoid transparent artifacts when saving as JPEG
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw scaled image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Export compressed JPEG
          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        } catch (e) {
          console.warn("Canvas compression fallback, using original reader data:", e);
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
