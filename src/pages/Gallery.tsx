import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageHoverCarousel } from "@/components/ui/image-hover-carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
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
  description: string;
  price: number;
  category: ProductCategory;
  created_at: string;
  product_images?: ProductImageRow[];
};

const emptyInquiryForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  requirements: "",
};

export default function Gallery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }),
    [],
  );
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");
  const [sortOption, setSortOption] = useState<"name" | "price-asc" | "price-desc">("name");
  const [page, setPage] = useState(1);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState<ProductRow | null>(null);
  const [inquiryForm, setInquiryForm] = useState(emptyInquiryForm);
  const [isSending, setIsSending] = useState(false);
  const pageSize = 12;

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      const { data, error: queryError } = await supabase
        .from("products")
        .select(
          "id, name, description, price, category, created_at, product_images (id, storage_path, sort_order)",
        )
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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = categoryFilter === "all" ? true : product.category === categoryFilter;
      if (!normalizedQuery) return matchesCategory;
      const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
      return matchesCategory && haystack.includes(normalizedQuery);
    });
  }, [categoryFilter, normalizedQuery, products]);

  const sortedProducts = useMemo(() => {
    const next = [...filteredProducts];
    next.sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    return next;
  }, [filteredProducts, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, searchQuery, sortOption]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const detailsImages = useMemo(() => {
    if (!detailsProduct?.product_images?.length) return [];
    const orderedImages = [...detailsProduct.product_images].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
    return orderedImages.map((image) => getPublicImageUrl(image.storage_path));
  }, [detailsProduct]);

  const handleOpenDetails = (product: ProductRow) => {
    setDetailsProduct(product);
    setIsDetailsOpen(true);
  };

  useEffect(() => {
    if (!isEnquiryOpen || !selectedProduct) return;
    const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
    const firstName = typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
    const lastName = typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";
    const phone = typeof metadata.phone === "string" ? metadata.phone.trim() : "";
    setInquiryForm({
      firstName,
      lastName,
      email: user?.email ?? "",
      phone,
      requirements: "",
    });
  }, [isEnquiryOpen, selectedProduct, user]);

  const handleOpenInquiry = (product: ProductRow) => {
    setSelectedProduct(product);
    setIsEnquiryOpen(true);
  };

  const handleSendInquiry = async () => {
    if (!selectedProduct || isSending) return;
    const firstName = inquiryForm.firstName.trim();
    const lastName = inquiryForm.lastName.trim();
    const email = inquiryForm.email.trim();
    const phone = inquiryForm.phone.trim();
    const requirements = inquiryForm.requirements.trim();

    if (!email || !requirements) {
      toast({
        title: "Missing details",
        description: "Email and requirements are required to send an inquiry.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    const { error: insertError } = await supabase.from("product_inquiries").insert({
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      user_id: user?.id ?? null,
      first_name: firstName || null,
      last_name: lastName || null,
      email,
      phone: phone || null,
      requirements,
    });

    if (insertError) {
      toast({
        title: "Unable to send inquiry",
        description: insertError.message,
        variant: "destructive",
      });
      setIsSending(false);
      return;
    }

    toast({
      title: "Inquiry sent",
      description: "We'll review your request and get back to you shortly.",
    });
    setIsSending(false);
    setIsEnquiryOpen(false);
    setSelectedProduct(null);
    setInquiryForm(emptyInquiryForm);
  };

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
            <h2 className="mt-3 font-serif text-3xl text-charcoal md:text-4xl">
              Latest Additions
            </h2>
          </div>

          <div className="mb-10 grid gap-4 md:grid-cols-[220px_220px_1fr]">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as ProductCategory | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort by</Label>
              <Select
                value={sortOption}
                onValueChange={(value) =>
                  setSortOption(value as "name" | "price-asc" | "price-desc")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-search">Search</Label>
              <Input
                id="gallery-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name or description"
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-charcoal/10 bg-white/80 p-8 text-center text-sm text-charcoal/60">
              Loading gallery updates...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="rounded-3xl border border-charcoal/10 bg-white/80 p-8 text-center text-sm text-charcoal/60">
              No products match your filters.
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {paginatedProducts.map((product) => {
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
                        <p className="mt-3 text-lg font-semibold text-gold-dark">
                          {currencyFormatter.format(product.price)}
                        </p>
                        <p className="mt-2 text-sm text-charcoal/60">
                          {imageUrls.length} image{imageUrls.length === 1 ? "" : "s"}
                        </p>
                        <Button
                          variant="luxury"
                          className="mt-4 w-full"
                          onClick={() => handleOpenDetails(product)}
                        >
                          View more details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {sortedProducts.length > pageSize && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-charcoal/60">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={isEnquiryOpen}
        onOpenChange={(open) => {
          setIsEnquiryOpen(open);
          if (!open) {
            setSelectedProduct(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Enquire about {selectedProduct?.name ?? "this product"}</DialogTitle>
            <DialogDescription>
              Confirm your details and share the requirements for this piece.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              handleSendInquiry();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inquiry-first-name">First name</Label>
                <Input
                  id="inquiry-first-name"
                  value={inquiryForm.firstName}
                  onChange={(event) =>
                    setInquiryForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inquiry-last-name">Last name</Label>
                <Input
                  id="inquiry-last-name"
                  value={inquiryForm.lastName}
                  onChange={(event) =>
                    setInquiryForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-email">Email *</Label>
              <Input
                id="inquiry-email"
                type="email"
                value={inquiryForm.email}
                onChange={(event) =>
                  setInquiryForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-phone">Phone</Label>
              <Input
                id="inquiry-phone"
                value={inquiryForm.phone}
                onChange={(event) =>
                  setInquiryForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-requirements">Requirements *</Label>
              <Textarea
                id="inquiry-requirements"
                value={inquiryForm.requirements}
                onChange={(event) =>
                  setInquiryForm((prev) => ({ ...prev, requirements: event.target.value }))
                }
                placeholder="Share sizing, materials, timeline, or any personalization."
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" variant="luxury" disabled={isSending}>
                {isSending ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) {
            setDetailsProduct(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>{detailsProduct?.name ?? "Product details"}</DialogTitle>
            <DialogDescription>
              Review images, description, and pricing before inquiring.
            </DialogDescription>
          </DialogHeader>
          {detailsProduct && (
            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] overflow-hidden bg-white shadow-soft">
                  {detailsImages.length ? (
                    <ImageHoverCarousel
                      images={detailsImages}
                      alt={detailsProduct.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white text-xs uppercase tracking-[0.3em] text-charcoal/40">
                      No images
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-charcoal/50">Description</p>
                  <p className="mt-2 text-sm text-charcoal/80">
                    {detailsProduct.description}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-charcoal/50">Price</p>
                  <p className="mt-2 text-lg font-semibold text-charcoal">
                    {currencyFormatter.format(detailsProduct.price)}
                  </p>
                </div>
                <DialogFooter className="sm:justify-start">
                  <Button
                    variant="luxury"
                    onClick={() => {
                      handleOpenInquiry(detailsProduct);
                      setIsDetailsOpen(false);
                    }}
                  >
                    Enquire Now
                  </Button>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
