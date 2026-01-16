import { supabase } from "@/lib/supabaseClient";
import { GALLERY_BUCKET } from "@/lib/gallery";

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const withRetry = async <T>(
  operation: () => Promise<T>,
  attempts = 3,
  baseDelayMs = 300,
): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await delay(baseDelayMs * 2 ** attempt);
      }
    }
  }
  throw lastError;
};

export const createGallerySignedUploadUrl = async (path: string) =>
  withRetry(async () => {
    const result = await supabase.storage.from(GALLERY_BUCKET).createSignedUploadUrl(path);
    if (result.error) {
      throw result.error;
    }
    return result;
  });

export const removeGalleryObjects = async (paths: string[]) => {
  const uniquePaths = Array.from(new Set(paths)).filter(Boolean);
  if (!uniquePaths.length) {
    return null;
  }
  return withRetry(async () => {
    const result = await supabase.storage.from(GALLERY_BUCKET).remove(uniquePaths);
    if (result.error) {
      throw result.error;
    }
    return result;
  });
};

export const moveGalleryObject = async (fromPath: string, toPath: string) =>
  withRetry(async () => {
    const result = await supabase.storage.from(GALLERY_BUCKET).move(fromPath, toPath);
    if (result.error) {
      throw result.error;
    }
    return result;
  });
