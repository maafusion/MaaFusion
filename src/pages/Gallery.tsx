import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
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
    setTermsAccepted(false);
  }, [isEnquiryOpen, selectedProduct, user]);

  const handleOpenInquiry = (product: ProductRow) => {
    setSelectedProduct(product);
    setIsEnquiryOpen(true);
  };

  const handleSendInquiry = async () => {
    if (!selectedProduct || isSending) return;
    if (!termsAccepted) {
      toast({
        title: "Accept terms",
        description: "Please accept the terms and conditions before sending an inquiry.",
        variant: "destructive",
      });
      return;
    }
    const firstName = inquiryForm.firstName.trim();
    const lastName = inquiryForm.lastName.trim();
    const email = inquiryForm.email.trim();
    const phone = inquiryForm.phone.trim();
    const requirements = inquiryForm.requirements.trim();

    if (!firstName || !lastName || !email || !phone || !requirements) {
      toast({
        title: "Missing details",
        description: "All fields are required to send an inquiry.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    const { error: insertError } = await supabase.from("product_inquiries").insert({
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      product_price: selectedProduct.price,
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

    setIsSending(false);
    setIsEnquiryOpen(false);
    setIsSuccessOpen(true);
    setSelectedProduct(null);
    setInquiryForm(emptyInquiryForm);
    setTermsAccepted(false);
  };

  return (
    <Layout>
      <SEO 
        title="Gallery" 
        description="Explore our curated collections of digital sculptures and jewelry designs." 
      />
      <section className="bg-cream pb-6 pt-16 md:pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-3xl text-charcoal sm:text-4xl md:text-5xl text-balance">
              Gallery of Collections
            </h1>
            <p className="max-w-2xl text-base text-charcoal/80 md:text-lg text-pretty font-sans leading-relaxed sm:text-lg md:text-xl">
              Explore our curated collections where timeless heritage meets digital innovation.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream pb-12 pt-6 md:pb-16 md:pt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-10">
            <h2 className="mt-3 font-serif text-2xl text-charcoal sm:text-3xl md:text-4xl">
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
            <div className="rounded-3xl border border-charcoal/10 bg-white/80 p-8 text-center text-sm text-charcoal/80">
              Loading gallery updates...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="rounded-3xl border border-charcoal/10 bg-white/80 p-8 text-center text-sm text-charcoal/80">
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
                    <div key={product.id} className="group space-y-4">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white shadow-soft transition-all duration-700 hover:-translate-y-2 hover:shadow-gold/20 sm:aspect-[3/4]">
                        <div className="absolute inset-0">
                          <div className="w-full h-full relative overflow-hidden bg-gray-50">
                            {imageUrls.length ? (
                              <ImageHoverCarousel
                                images={imageUrls}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-white text-xs uppercase tracking-[0.3em] text-charcoal/80">
                                No images
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-serif text-xl text-charcoal transition-colors duration-300 group-hover:text-gold-dark sm:text-2xl">{product.name}</h3>
                        <p className="mt-3 text-lg font-semibold text-gold-dark">
                          {currencyFormatter.format(product.price)}
                        </p>
                        <p className="mt-2 text-sm text-charcoal/80">
                          {product.category}
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
                  <p className="text-xs text-charcoal/80">
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
        <DialogContent className="sm:max-w-[520px] p-4 sm:p-6">
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
                <Label htmlFor="inquiry-first-name">First name *</Label>
                <Input
                  id="inquiry-first-name"
                  value={inquiryForm.firstName}
                  onChange={(event) =>
                    setInquiryForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inquiry-last-name">Last name *</Label>
                <Input
                  id="inquiry-last-name"
                  value={inquiryForm.lastName}
                  onChange={(event) =>
                    setInquiryForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  placeholder="Last name"
                  required
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
              <Label htmlFor="inquiry-phone">Phone *</Label>
              <Input
                id="inquiry-phone"
                value={inquiryForm.phone}
                onChange={(event) =>
                  setInquiryForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                placeholder="Phone number"
                required
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-charcoal/80 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read the{" "}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="text-gold-dark hover:underline underline-offset-4"
                  >
                    terms and conditions
                  </Link>
                </label>
              </div>

              <DialogFooter>
                <Button type="submit" variant="luxury" disabled={isSending || !termsAccepted}>
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
        <DialogContent className="sm:max-w-[760px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{detailsProduct?.name ?? "Product details"}</DialogTitle>
            <DialogDescription className="text-base sm:text-lg">
              Review images, description, and pricing before inquiring.
            </DialogDescription>
          </DialogHeader>
          {detailsProduct && (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white shadow-soft sm:aspect-[3/4]">
                  {detailsImages.length ? (
                    <ImageHoverCarousel
                      images={detailsImages}
                      alt={detailsProduct.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white text-xs uppercase tracking-[0.3em] text-charcoal/80">
                      No images
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-charcoal/80">Description</p>
                  <p className="mt-2 text-xs text-charcoal/80 font-sans sm:text-sm">
                    {detailsProduct.description}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-charcoal/80">Price</p>
                  <p className="mt-2 text-xl font-semibold text-charcoal sm:text-2xl">
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

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-[420px] p-6">
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold-dark shadow-soft animate-pulse">
              <Check className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-charcoal sm:text-3xl md:text-4xl">
                Thank you!
              </h3>
              <p className="text-base text-charcoal/80 sm:text-lg md:text-xl">
                Thanks for trusting Maa Fusion. We'll be in touch soon.
              </p>
            </div>
            <Button variant="luxury" onClick={() => setIsSuccessOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
