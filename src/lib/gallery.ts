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
export const MAX_IMAGE_SIZE_BYTES = 200 * 1024;

export const isAdminUser = (user: User | null) =>
  (user?.app_metadata?.role as string | undefined) === "admin";

export const getPublicImageUrl = (path: string) =>
  supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path).data.publicUrl;
