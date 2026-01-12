import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageHoverCarousel } from "@/components/ui/image-hover-carousel";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  GALLERY_BUCKET,
  MAX_IMAGE_SIZE_BYTES,
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
  description: string;
  price: number;
  category: ProductCategory;
  created_at: string;
  product_images?: ProductImageRow[];
};

type UploadProgress = {
  filePercent: number;
  bytesPercent: number;
  fileIndex: number;
  totalFiles: number;
  uploadedBytes: number;
  totalBytes: number;
};

const formatBytes = (value: number) => {
  if (!Number.isFinite(value)) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = Math.max(0, value);
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export default function AdminManageProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, description, price, category, created_at, product_images (id, storage_path, sort_order)",
      )
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
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = categoryFilter === "all" ? true : product.category === categoryFilter;
      if (!normalizedQuery) return matchesCategory;
      const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
      return matchesCategory && haystack.includes(normalizedQuery);
    });
  }, [categoryFilter, normalizedQuery, products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleUpdate = async (
    productId: string,
    name: string,
    description: string,
    price: number,
    category: ProductCategory,
  ) => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName || !trimmedDescription) {
      toast({
        title: "Name required",
        description: "Product name and description cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast({
        title: "Invalid price",
        description: "Enter a valid price.",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase
      .from("products")
      .update({ name: trimmedName, description: trimmedDescription, price, category })
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
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, name: trimmedName, description: trimmedDescription, price, category }
          : product,
      ),
    );
  };

  const handleDelete = async (product: ProductRow) => {
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
    setProducts((prev) => prev.filter((item) => item.id !== product.id));
  };

  const handleUpload = async (
    product: ProductRow,
    files: File[],
    onProgress?: (value: UploadProgress) => void,
  ): Promise<ProductImageRow[] | null> => {
    if (!files.length) return null;
    const oversized = files.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized.length) {
      toast({
        title: "Images too large",
        description: `Each image must be ${formatBytes(MAX_IMAGE_SIZE_BYTES)} or smaller.`,
        variant: "destructive",
      });
      return null;
    }
    const existingCount = product.product_images?.length ?? 0;
    if (existingCount + files.length > MAX_PRODUCT_IMAGES) {
      toast({
        title: "Image limit reached",
        description: `You can upload up to ${MAX_PRODUCT_IMAGES} images per product.`,
        variant: "destructive",
      });
      return null;
    }

    const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
    let uploadedBytes = 0;
    const insertedImages: ProductImageRow[] = [];

    const uploadFileWithProgress = async (file: File, path: string, index: number) => {
      const { data, error } = await supabase
        .storage
        .from(GALLERY_BUCKET)
        .createSignedUploadUrl(path, 60);
      if (error || !data?.signedUrl) {
        throw new Error(error?.message ?? "Unable to create upload link.");
      }
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", data.signedUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const loaded = Math.min(event.loaded, file.size);
          const currentBytes = uploadedBytes + loaded;
          const bytesPercent = totalBytes ? Math.round((currentBytes / totalBytes) * 100) : 0;
          const filePercent = file.size
            ? Math.round(((index + loaded / file.size) / files.length) * 100)
            : Math.round(((index + 1) / files.length) * 100);
          onProgress?.({
            filePercent,
            bytesPercent,
            fileIndex: index + 1,
            totalFiles: files.length,
            uploadedBytes: currentBytes,
            totalBytes,
          });
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
            return;
          }
          reject(new Error("Upload failed."));
        };
        xhr.onerror = () => reject(new Error("Upload failed."));
        xhr.send(file);
      });
      uploadedBytes += file.size || 0;
      onProgress?.({
        filePercent: Math.round(((index + 1) / files.length) * 100),
        bytesPercent: totalBytes ? Math.round((uploadedBytes / totalBytes) * 100) : 100,
        fileIndex: index + 1,
        totalFiles: files.length,
        uploadedBytes,
        totalBytes,
      });
    };

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const path = `products/${product.id}/${crypto.randomUUID()}-${file.name}`;
      try {
        await uploadFileWithProgress(file, path, index);
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Unable to upload image.",
          variant: "destructive",
        });
        return null;
      }
      const { data: insertedImage, error: insertError } = await supabase
        .from("product_images")
        .insert({
          product_id: product.id,
          storage_path: path,
          sort_order: existingCount + index,
        })
        .select("id, storage_path, sort_order")
        .single();
      if (insertError) {
        await supabase.storage.from(GALLERY_BUCKET).remove([path]);
        toast({
          title: "Image save failed",
          description: insertError.message,
          variant: "destructive",
        });
        return null;
      }
      if (insertedImage) {
        insertedImages.push(insertedImage as ProductImageRow);
      }
    }
    toast({
      title: "Images uploaded",
    });
    if (insertedImages.length) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                product_images: [...(item.product_images ?? []), ...insertedImages].sort(
                  (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
                ),
              }
            : item,
        ),
      );
    }
    return insertedImages;
  };

  const handleDeleteImage = async (product: ProductRow, image: ProductImageRow) => {
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
    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              product_images: (item.product_images ?? []).filter((img) => img.id !== image.id),
            }
          : item,
      ),
    );
  };

  const handleDiscardUpload = async (productId: string, images: ProductImageRow[]) => {
    if (!images.length) return true;
    const paths = images.map((image) => image.storage_path);
    const { error: storageError } = await supabase.storage.from(GALLERY_BUCKET).remove(paths);
    if (storageError) {
      toast({
        title: "Storage delete failed",
        description: storageError.message,
        variant: "destructive",
      });
    }
    const { error: deleteError } = await supabase
      .from("product_images")
      .delete()
      .in(
        "id",
        images.map((image) => image.id),
      );
    if (deleteError) {
      toast({
        title: "Discard failed",
        description: deleteError.message,
        variant: "destructive",
      });
      return false;
    }
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              product_images: (item.product_images ?? []).filter(
                (img) => !images.some((removed) => removed.id === img.id),
              ),
            }
          : item,
      ),
    );
    return true;
  };
  return (
    <Layout>
      <section className="bg-cream py-10 md:py-12">
        <div className="container mx-auto space-y-6 px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col gap-3">
            <Badge className="w-fit rounded-full border border-charcoal/20 bg-white/70 px-4 py-1 text-[10px] uppercase tracking-[0.35em] text-charcoal/70">
              Admin dashboard
            </Badge>
            <h1 className="font-serif text-3xl text-charcoal sm:text-4xl md:text-5xl">Manage</h1>
            <p className="max-w-2xl text-base text-charcoal/60 md:text-lg">
              Edit details, upload images, or remove products from the gallery.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-12">
        <div className="container mx-auto space-y-8 px-4 sm:px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-serif text-xl text-charcoal sm:text-2xl">Products</h2>
            <span className="text-sm text-charcoal/60">
              Showing {filteredProducts.length} of {totalProducts}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_220px_1fr]">
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
                  {PRODUCT_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-search">Search</Label>
              <Input
                id="product-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name or description"
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-charcoal/10 bg-cream/50 p-8 text-center text-sm text-charcoal/60">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-charcoal/10 bg-cream/50 p-8 text-center text-sm text-charcoal/60">
              No products match your filters.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((product) => (
                <AdminProductCard
                  key={product.id}
                  product={product}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onUpload={handleUpload}
                  onDiscardUpload={handleDiscardUpload}
                  onDeleteImage={handleDeleteImage}
                />
              ))}
            </div>
          )}
          {filteredProducts.length > pageSize && (
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
      </section>
    </Layout>
  );
}

type AdminProductCardProps = {
  product: ProductRow;
  onUpdate: (
    productId: string,
    name: string,
    description: string,
    price: number,
    category: ProductCategory,
  ) => Promise<void> | void;
  onDelete: (product: ProductRow) => Promise<void> | void;
  onUpload: (
    product: ProductRow,
    files: File[],
    onProgress?: (value: UploadProgress) => void,
  ) => Promise<ProductImageRow[] | null> | ProductImageRow[] | null;
  onDiscardUpload: (productId: string, images: ProductImageRow[]) => Promise<boolean> | boolean;
  onDeleteImage: (product: ProductRow, image: ProductImageRow) => Promise<void> | void;
};

type ConfirmState = {
  open: boolean;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTone?: "default" | "destructive";
  intent?: "upload";
  onConfirm?: () => void | Promise<void>;
};

function AdminProductCard({
  product,
  onUpdate,
  onDelete,
  onUpload,
  onDiscardUpload,
  onDeleteImage,
}: AdminProductCardProps) {
  const { toast } = useToast();
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }),
    [],
  );
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(product.price.toString());
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const blockDialogCloseRef = useRef(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: "",
  });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadReview, setUploadReview] = useState<ProductImageRow[] | null>(null);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const isBusy = isSaving || isUploading;
  const isUploadDialog = confirmState.intent === "upload";
  const shouldBlockDialogClose = blockDialogCloseRef.current || (isUploadDialog && !!uploadReview);
  const maxImageSizeLabel = formatBytes(MAX_IMAGE_SIZE_BYTES);

  useEffect(() => {
    setName(product.name);
    setDescription(product.description ?? "");
    setPrice(product.price.toString());
    setCategory(product.category);
  }, [product.category, product.description, product.name, product.price]);

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
    const oversized = selected.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized.length) {
      toast({
        title: "Images too large",
        description: `Each image must be ${maxImageSizeLabel} or smaller.`,
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }
    if (selected.length > remainingSlots) {
      toast({
        title: "Too many images",
        description: `You can add ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"}.`,
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }
    if (!selected.length) return;
    setPendingFiles(selected);
    setUploadReview(null);
    setConfirmState({
      open: true,
      title: "Upload images",
      description: `Upload ${selected.length} image${selected.length === 1 ? "" : "s"} to "${
        product.name
      }"?`,
      actionLabel: "Upload",
      intent: "upload",
      onConfirm: async () => {
        blockDialogCloseRef.current = true;
        setIsUploading(true);
        setUploadProgress({
          filePercent: 0,
          bytesPercent: 0,
          fileIndex: 0,
          totalFiles: selected.length,
          uploadedBytes: 0,
          totalBytes: selected.reduce((sum, file) => sum + (file.size || 0), 0),
        });
        const uploadedImages = await onUpload(product, selected, setUploadProgress);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setPendingFiles([]);
        setIsUploading(false);
        setUploadProgress(null);
        blockDialogCloseRef.current = false;
        if (uploadedImages && uploadedImages.length) {
          setUploadReview(uploadedImages);
          setConfirmState((prev) => ({
            ...prev,
            title: "Upload complete",
            description: "Save these images or discard the upload.",
            actionLabel: "Save",
          }));
        } else {
          setConfirmState((prev) => ({ ...prev, open: false, onConfirm: undefined }));
        }
      },
    });
  };

  const handleUpdateClick = async () => {
    const priceValue = Number.parseFloat(price);
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName || !trimmedDescription || !category) {
      toast({
        title: "Missing details",
        description: "Provide a product name, description, and category.",
        variant: "destructive",
      });
      return;
    }
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      toast({
        title: "Invalid price",
        description: "Enter a valid price.",
        variant: "destructive",
      });
      return;
    }
    if (!product.product_images?.length) {
      toast({
        title: "Images required",
        description: "Upload at least one image before saving changes.",
        variant: "destructive",
      });
      return;
    }
    setConfirmState({
      open: true,
      title: "Save changes",
      description: `Save updates for "${product.name}"?`,
      actionLabel: "Save",
      onConfirm: async () => {
        setIsSaving(true);
        await onUpdate(product.id, trimmedName, trimmedDescription, priceValue, category);
        setIsSaving(false);
      },
    });
  };

  const handleDeleteProduct = () => {
    setConfirmState({
      open: true,
      title: "Delete product",
      description: `Delete "${product.name}" and all of its images? This cannot be undone.`,
      actionLabel: "Delete",
      actionTone: "destructive",
      onConfirm: async () => {
        setIsSaving(true);
        await onDelete(product);
        setIsSaving(false);
      },
    });
  };

  const handleDeleteProductImage = (image: ProductImageRow) => {
    setConfirmState({
      open: true,
      title: "Remove image",
      description: "Delete this image from the product gallery?",
      actionLabel: "Remove",
      actionTone: "destructive",
      onConfirm: async () => {
        setIsSaving(true);
        await onDeleteImage(product, image);
        setIsSaving(false);
      },
    });
  };

  return (
    <Card className="border-charcoal/10">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="font-serif text-xl text-charcoal">{product.name}</CardTitle>
            <p className="text-xs uppercase tracking-[0.3em] text-charcoal/50">{product.category}</p>
            <p className="mt-2 text-sm text-charcoal/70">
              Price: {currencyFormatter.format(product.price)}
            </p>
          </div>
          <Button variant="outline" onClick={handleDeleteProduct} disabled={isBusy}>
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Product name <span className="text-red-500">*</span>
            </Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>
              Category <span className="text-red-500">*</span>
            </Label>
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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Price <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleUpdateClick} disabled={isBusy}>
            Save changes
          </Button>
          <Button variant="outline" onClick={() => setIsImageDialogOpen(true)} disabled={isBusy}>
            View images
          </Button>
        </div>
      </CardContent>
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Images for {product.name}</DialogTitle>
            <DialogDescription>
              Manage uploads and remove images from this product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-lg text-charcoal">Images</h4>
              <span className="text-xs text-charcoal/50">
                {product.product_images?.length ?? 0} of {MAX_PRODUCT_IMAGES}
              </span>
            </div>

            {imageUrls.length ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {imageUrls.map((image) => (
                  <div key={image.id} className="relative overflow-hidden rounded-lg bg-cream">
                    <div className="aspect-square">
                      <ImageHoverCarousel
                        images={[image.url]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 text-charcoal hover:bg-white"
                      onClick={() => handleDeleteProductImage(image)}
                      disabled={isBusy}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-charcoal/20 bg-cream/40 p-6 text-center text-sm text-charcoal/60">
                No images uploaded yet.
              </div>
            )}

            <div className="space-y-3">
              <Label>
                Add images <span className="text-red-500">*</span>
              </Label>
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={remainingSlots <= 0 || isBusy}
                  className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-charcoal/20 bg-cream/40 text-xs font-medium text-charcoal/60 transition hover:border-charcoal/40 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/20 bg-white/80 text-charcoal">
                    <Plus className="h-4 w-4" />
                  </span>
                  Add images
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={remainingSlots <= 0 || isBusy}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col gap-2 text-xs text-charcoal/60">
                <span>Remaining slots: {remainingSlots}</span>
                <span>Max size per image: {maxImageSizeLabel}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={confirmState.open}
        onOpenChange={(open) => {
          if (!open && shouldBlockDialogClose) {
            return;
          }
          if (!open) {
            if (pendingFiles.length && fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            setPendingFiles([]);
            setUploadProgress(null);
            setUploadReview(null);
            setIsDiscarding(false);
          }
          setConfirmState((prev) => ({
            ...prev,
            open,
            onConfirm: open ? prev.onConfirm : undefined,
          }));
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmState.title}</AlertDialogTitle>
            {confirmState.description && (
              <AlertDialogDescription>{confirmState.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          {isUploadDialog && uploadProgress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-charcoal/60">
                <span>Files</span>
                <span>
                  {Math.max(uploadProgress.fileIndex, 0)} / {uploadProgress.totalFiles}
                </span>
              </div>
              <Progress
                value={Math.max(uploadProgress.filePercent, isUploading ? 5 : 0)}
                className="h-2 w-full bg-cream/60"
              />
              <div className="flex items-center justify-between text-xs text-charcoal/60">
                <span>Bytes</span>
                <span>
                  {formatBytes(uploadProgress.uploadedBytes)} / {formatBytes(uploadProgress.totalBytes)}
                </span>
              </div>
              <Progress
                value={Math.max(uploadProgress.bytesPercent, isUploading ? 5 : 0)}
                className="h-2 w-full bg-cream/60"
              />
              {isUploading && uploadProgress.fileIndex === 0 && (
                <p className="text-xs text-charcoal/50">Preparing upload...</p>
              )}
            </div>
          )}
          <AlertDialogFooter>
            {isUploadDialog && uploadReview ? (
              <Button
                type="button"
                variant="outline"
                disabled={isUploading || isDiscarding}
                onClick={async () => {
                  setIsDiscarding(true);
                  const success = await onDiscardUpload(product.id, uploadReview);
                  setIsDiscarding(false);
                  if (success) {
                    setUploadReview(null);
                    setConfirmState((prev) => ({ ...prev, open: false, onConfirm: undefined }));
                  }
                }}
              >
                {isDiscarding ? "Discarding..." : "Discard"}
              </Button>
            ) : (
              <AlertDialogCancel
                onClick={() => {
                  if (pendingFiles.length && fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  setPendingFiles([]);
                  setUploadProgress(null);
                }}
                disabled={isUploading || isDiscarding}
              >
                Cancel
              </AlertDialogCancel>
            )}
            {isUploadDialog ? (
              <Button
                type="button"
                disabled={isUploading || isDiscarding}
                onClick={async () => {
                  if (uploadReview) {
                    setUploadReview(null);
                    setConfirmState((prev) => ({ ...prev, open: false, onConfirm: undefined }));
                    return;
                  }
                  await confirmState.onConfirm?.();
                }}
              >
                {isUploading ? "Uploading..." : uploadReview ? "Save" : "Upload"}
              </Button>
            ) : (
              <AlertDialogAction
                className={
                  confirmState.actionTone === "destructive"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : undefined
                }
                disabled={isUploading || isDiscarding}
                onClick={async () => {
                  await confirmState.onConfirm?.();
                  if (!isUploadDialog) {
                    setConfirmState((prev) => ({ ...prev, open: false, onConfirm: undefined }));
                  }
                }}
              >
                {confirmState.actionLabel ?? "Confirm"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
