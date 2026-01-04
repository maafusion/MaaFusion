import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export const PRODUCT_CATEGORIES = ["Murti", "Pendant", "Rings"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const GALLERY_BUCKET = "gallery";
export const MAX_PRODUCT_IMAGES = 4;

export const isAdminUser = (user: User | null) =>
  (user?.app_metadata?.role as string | undefined) === "admin";

export const getPublicImageUrl = (path: string) =>
  supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path).data.publicUrl;
