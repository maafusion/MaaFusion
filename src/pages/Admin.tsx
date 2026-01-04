import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageHoverCarousel } from "@/components/ui/image-hover-carousel";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  GALLERY_BUCKET,
  MAX_PRODUCT_IMAGES,
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

const emptyForm = {
  name: "",
  category: "" as ProductCategory | "",
};

export default function Admin() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [isCreating, setIsCreating] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, created_at, product_images (id, storage_path, sort_order)")
      .order("created_at", { ascending: false })
      .order("sort_order", { ascending: true, foreignTable: "product_images" });

    if (error) {
      toast({
        title: "Failed to load products",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    setProducts((data ?? []) as ProductRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const totalProducts = useMemo(() => products.length, [products.length]);

  const handleCreate = async () => {
    if (isCreating) return;
    const name = form.name.trim();
    if (!name || !form.category) {
      toast({
        title: "Missing details",
        description: "Provide a product name and category.",
        variant: "destructive",
      });
      return;
    }
    setIsCreating(true);
    const { error } = await supabase.from("products").insert({
      name,
      category: form.category,
    });
    if (error) {
      toast({
        title: "Unable to create product",
        description: error.message,
        variant: "destructive",
      });
      setIsCreating(false);
      return;
    }
    toast({
      title: "Product created",
      description: "Add images to complete the gallery entry.",
    });
    setForm(emptyForm);
    setIsCreating(false);
    await loadProducts();
  };

  const handleUpdate = async (productId: string, name: string, category: ProductCategory) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: "Name required",
        description: "Product name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase
      .from("products")
      .update({ name: trimmedName, category })
      .eq("id", productId);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Product updated",
    });
    await loadProducts();
  };

  const handleDelete = async (product: ProductRow) => {
    const confirmed = window.confirm(`Delete "${product.name}" and all of its images?`);
    if (!confirmed) return;
    const paths = (product.product_images ?? []).map((image) => image.storage_path);
    if (paths.length) {
      await supabase.storage.from(GALLERY_BUCKET).remove(paths);
    }
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Product deleted" });
    await loadProducts();
  };

  const handleUpload = async (product: ProductRow, files: File[]) => {
    if (!files.length) return;
    const existingCount = product.product_images?.length ?? 0;
    if (existingCount + files.length > MAX_PRODUCT_IMAGES) {
      toast({
        title: "Image limit reached",
        description: `You can upload up to ${MAX_PRODUCT_IMAGES} images per product.`,
        variant: "destructive",
      });
      return;
    }

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const path = `products/${product.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(GALLERY_BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) {
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }
      const { error: insertError } = await supabase.from("product_images").insert({
        product_id: product.id,
        storage_path: path,
        sort_order: existingCount + index,
      });
      if (insertError) {
        await supabase.storage.from(GALLERY_BUCKET).remove([path]);
        toast({
          title: "Image save failed",
          description: insertError.message,
          variant: "destructive",
        });
        return;
      }
    }
    toast({
      title: "Images uploaded",
    });
    await loadProducts();
  };

  const handleDeleteImage = async (product: ProductRow, image: ProductImageRow) => {
    const confirmed = window.confirm("Delete this image?");
    if (!confirmed) return;
    const { error: storageError } = await supabase.storage.from(GALLERY_BUCKET).remove([image.storage_path]);
    if (storageError) {
      toast({
        title: "Storage delete failed",
        description: storageError.message,
        variant: "destructive",
      });
    }
    const { error } = await supabase.from("product_images").delete().eq("id", image.id);
    if (error) {
      toast({
        title: "Image delete failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Image removed" });
    await loadProducts();
  };

  return (
    <Layout>
      <section className="bg-cream py-12">
        <div className="container mx-auto space-y-6 px-6 lg:px-12">
          <div className="flex flex-col gap-3">
            <Badge className="w-fit rounded-full border border-charcoal/20 bg-white/70 px-4 py-1 text-[10px] uppercase tracking-[0.35em] text-charcoal/70">
              Admin dashboard
            </Badge>
            <h1 className="font-serif text-4xl text-charcoal md:text-6xl">Gallery Manager</h1>
            <p className="max-w-2xl text-base text-charcoal/60 md:text-lg">
              Create, update, and curate products for the client gallery. Each product supports up to{" "}
              {MAX_PRODUCT_IMAGES} images.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto space-y-8 px-6 lg:px-12">
          <Card className="border-charcoal/10">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-charcoal">New product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[1.5fr_1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product name</Label>
                  <Input
                    id="product-name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, category: value as ProductCategory }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create product"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-charcoal">Products</h2>
            <span className="text-sm text-charcoal/60">{totalProducts} total</span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-charcoal/10 bg-cream/50 p-8 text-center text-sm text-charcoal/60">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-charcoal/10 bg-cream/50 p-8 text-center text-sm text-charcoal/60">
              No products created yet.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {products.map((product) => (
                <AdminProductCard
                  key={product.id}
                  product={product}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onUpload={handleUpload}
                  onDeleteImage={handleDeleteImage}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

type AdminProductCardProps = {
  product: ProductRow;
  onUpdate: (productId: string, name: string, category: ProductCategory) => Promise<void> | void;
  onDelete: (product: ProductRow) => Promise<void> | void;
  onUpload: (product: ProductRow, files: File[]) => Promise<void> | void;
  onDeleteImage: (product: ProductRow, image: ProductImageRow) => Promise<void> | void;
};

function AdminProductCard({
  product,
  onUpdate,
  onDelete,
  onUpload,
  onDeleteImage,
}: AdminProductCardProps) {
  const { toast } = useToast();
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(product.name);
    setCategory(product.category);
  }, [product.category, product.name]);

  const imageUrls = useMemo(() => {
    const ordered = [...(product.product_images ?? [])].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
    return ordered.map((image) => ({
      ...image,
      url: getPublicImageUrl(image.storage_path),
    }));
  }, [product.product_images]);

  const remainingSlots = MAX_PRODUCT_IMAGES - (product.product_images?.length ?? 0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length > remainingSlots) {
      toast({
        title: "Too many images",
        description: `You can add ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"}.`,
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }
    setFiles(selected);
  };

  const handleUploadClick = async () => {
    if (!files.length) return;
    setIsSaving(true);
    await onUpload(product, files);
    setFiles([]);
    setIsSaving(false);
  };

  const handleUpdateClick = async () => {
    setIsSaving(true);
    await onUpdate(product.id, name, category);
    setIsSaving(false);
  };

  return (
    <Card className="border-charcoal/10">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="font-serif text-xl text-charcoal">{product.name}</CardTitle>
            <p className="text-xs uppercase tracking-[0.3em] text-charcoal/50">{product.category}</p>
          </div>
          <Button variant="outline" onClick={() => onDelete(product)}>
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Product name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ProductCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleUpdateClick} disabled={isSaving}>
          Save changes
        </Button>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-lg text-charcoal">Images</h4>
            <span className="text-xs text-charcoal/50">
              {product.product_images?.length ?? 0} of {MAX_PRODUCT_IMAGES}
            </span>
          </div>

          {imageUrls.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {imageUrls.map((image) => (
                <div key={image.id} className="space-y-2">
                  <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                    <ImageHoverCarousel
                      images={[image.url]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onDeleteImage(product, image)}
                  >
                    Remove image
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-charcoal/20 bg-cream/40 p-6 text-center text-sm text-charcoal/60">
              No images uploaded yet.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>Add images</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            disabled={remainingSlots <= 0}
            onChange={handleFileChange}
          />
          <div className="flex flex-col gap-2 text-xs text-charcoal/60">
            <span>Remaining slots: {remainingSlots}</span>
            <span>Selected files: {files.length}</span>
          </div>
          <Button onClick={handleUploadClick} disabled={!files.length || isSaving}>
            Upload images
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
