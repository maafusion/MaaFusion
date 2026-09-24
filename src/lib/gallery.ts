import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export const PRODUCT_CATEGORIES = [
  "Assorted Designs",
  "Artistic Figures",
  "Divine Art",
  "Ring Designs",
  "Pendant Designs",
  "Earring Designs",
  "Nakashi Rings",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const GALLERY_BUCKET = "gallery";
export const MAX_PRODUCT_IMAGES = 4;
// Largest file an admin may pick; it is resized/re-encoded before upload.
export const MAX_SOURCE_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
// Largest file that may be stored (matches the gallery bucket's file_size_limit).
export const MAX_IMAGE_SIZE_BYTES = 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const isAllowedImage = (file: File) => ALLOWED_IMAGE_TYPES.includes(file.type);

export const PRICE_ON_REQUEST_LABEL = "Price on request";

// Blank input means the product has no price (null); undefined means the input is invalid.
export const parsePriceInput = (value: string): number | null | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const COMPRESS_MAX_DIMENSION = 1600;
const COMPRESS_TARGET_BYTES = 400 * 1024;
const COMPRESS_QUALITIES = [0.85, 0.75, 0.65, 0.55];

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read "${file.name}".`));
    };
    img.src = url;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

// Downscale and re-encode a photo so large camera images fit the storage limit.
// Returns the original file when it can't be improved on.
export const compressImage = async (file: File): Promise<File> => {
  // Re-encoding through a canvas would drop GIF animation, so GIFs pass through untouched.
  if (file.type === "image/gif") return file;

  const img = await loadImage(file);
  const scale = Math.min(1, COMPRESS_MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(img, 0, 0, canvas.width, canvas.height);

  let outputType = "image/webp";
  let best: Blob | null = null;
  try {
    for (const quality of COMPRESS_QUALITIES) {
      let blob = await canvasToBlob(canvas, outputType, quality);
      // Browsers without WebP encoding silently return PNG; switch to JPEG on a
      // white background so transparent areas don't turn black.
      if (blob && blob.type !== outputType) {
        outputType = "image/jpeg";
        context.globalCompositeOperation = "destination-over";
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        blob = await canvasToBlob(canvas, outputType, quality);
      }
      if (!blob) break;
      best = blob;
      if (blob.size <= COMPRESS_TARGET_BYTES) break;
    }
  } finally {
    // Release the canvas backing store promptly (matters on iOS Safari).
    canvas.width = 0;
    canvas.height = 0;
  }

  if (!best || best.size >= file.size) return file;
  const extension = outputType === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([best], `${baseName}.${extension}`, {
    type: outputType,
    lastModified: file.lastModified,
  });
};

// Sanitize a user-supplied filename before it goes into a storage object path:
// a "/" or other odd chars would create unexpected nested keys and break move logic.
export const safeStorageName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+/, "")
    .slice(-100) || "file";

export const isAdminUser = (user: User | null) =>
  (user?.app_metadata?.role as string | undefined) === "admin";

export const getPublicImageUrl = (path: string) =>
  supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path).data.publicUrl;
