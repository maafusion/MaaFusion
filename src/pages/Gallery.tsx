import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { ImageHoverCarousel } from "@/components/ui/image-hover-carousel";
import { supabase } from "@/lib/supabaseClient";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  getPublicImageUrl,
} from "@/lib/gallery";

type ProductImageRow = {
  id: string;
  storage_path: string;
  sort_order: number | null;
};

type ProductRow = {
  id: string;
  name: string;
  category: ProductCategory;
  created_at: string;
  product_images?: ProductImageRow[];
};

export default function Gallery() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      const { data, error: queryError } = await supabase
        .from("products")
        .select("id, name, category, created_at, product_images (id, storage_path, sort_order)")
        .order("created_at", { ascending: false })
        .order("sort_order", { ascending: true, foreignTable: "product_images" });

      if (!isMounted) return;
      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }
      setProducts((data ?? []) as ProductRow[]);
      setLoading(false);
    };

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const groupedProducts = useMemo(() => {
    const grouped: Record<ProductCategory, ProductRow[]> = {
      Murti: [],
      Pendant: [],
      Rings: [],
    };
    products.forEach((product) => {
      grouped[product.category]?.push(product);
    });
    return grouped;
  }, [products]);

  return (
    <Layout>
      <section className="bg-cream pt-12 pb-10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col gap-4">
            <Badge className="w-fit rounded-full border border-charcoal/20 bg-white/70 px-4 py-1 text-[10px] uppercase tracking-[0.4em] text-charcoal/70">
              Client gallery
            </Badge>
            <h1 className="font-serif text-4xl text-charcoal md:text-6xl">
              Gallery of Collections
            </h1>
            <p className="max-w-2xl text-base text-charcoal/60 md:text-lg">
              Browse the curated collections and the latest admin releases, organized by
              category.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-gold-dark">Admin uploads</p>
            <h2 className="mt-3 font-serif text-3xl text-charcoal md:text-4xl">
              Latest Additions
            </h2>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-charcoal/10 bg-white/80 p-8 text-center text-sm text-charcoal/60">
              Loading gallery updates...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-charcoal/10 bg-white/80 p-8 text-center text-sm text-charcoal/60">
              No admin uploads yet.
            </div>
          ) : (
            <div className="space-y-12">
              {PRODUCT_CATEGORIES.map((category) => {
                const items = groupedProducts[category];
                if (!items.length) return null;
                return (
                  <div key={category}>
                    <div className="mb-6 flex items-center gap-3">
                      <Badge className="rounded-full border border-charcoal/20 bg-white/70 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-charcoal/70">
                        {category}
                      </Badge>
                      <span className="text-sm text-charcoal/50">
                        {items.length} product{items.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {items.map((product) => {
                        const orderedImages = [...(product.product_images ?? [])].sort(
                          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
                        );
                        const imageUrls = orderedImages.map((image) =>
                          getPublicImageUrl(image.storage_path),
                        );
                        return (
                          <div key={product.id} className="space-y-4">
                            <div className="relative aspect-[3/4] overflow-hidden bg-white shadow-soft">
                              {imageUrls.length ? (
                                <ImageHoverCarousel
                                  images={imageUrls}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-white text-xs uppercase tracking-[0.3em] text-charcoal/40">
                                  No images
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-serif text-2xl text-charcoal">{product.name}</h3>
                              <p className="mt-2 text-sm text-charcoal/60">
                                {imageUrls.length} image{imageUrls.length === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
