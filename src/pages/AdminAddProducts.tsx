import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicImageUrl } from "@/lib/gallery";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { createGallerySignedUploadUrl, delay, moveGalleryObject, removeGalleryObjects } from "@/lib/storage";
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_PRODUCT_IMAGES,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@/lib/gallery";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "" as ProductCategory | "",
};

const DRAFT_TTL_MS = 30 * 60 * 1000;

type UploadProgress = {
  filePercent: number;
  bytesPercent: number;
  fileIndex: number;
  totalFiles: number;
  uploadedBytes: number;
  totalBytes: number;
};

type UploadedImage = {
  storage_path: string;
  sort_order: number | null;
};

export default function AdminAddProducts() {
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const createFileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadedImagesRef = useRef<UploadedImage[]>([]);
  const previewUrlsRef = useRef<string[]>([]);
  const draftTimeoutRef = useRef<number | null>(null);
  const totalBytes = createFiles.reduce((sum, file) => sum + (file.size || 0), 0);
  const selectedCount = createFiles.length + uploadedImages.length;
  const remainingSlots = MAX_PRODUCT_IMAGES - selectedCount;
  const hasPendingUpload = createFiles.length > 0 && uploadedImages.length === 0;

  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    const cleanupDrafts = () => {
      const paths = uploadedImagesRef.current.map((image) => image.storage_path);
      if (!paths.length) return;
      void (async () => {
        try {
          await removeGalleryObjects(paths);
        } catch {
          // Ignore cleanup errors on unload.
        }
      })();
    };

    const handlePageHide = () => {
      cleanupDrafts();
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      cleanupDrafts();
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (draftTimeoutRef.current) {
      window.clearTimeout(draftTimeoutRef.current);
    }
    if (!uploadedImages.length) {
      draftTimeoutRef.current = null;
      return;
    }
    draftTimeoutRef.current = window.setTimeout(() => {
      const paths = uploadedImagesRef.current.map((image) => image.storage_path);
      if (!paths.length) return;
      void (async () => {
        try {
          await removeGalleryObjects(paths);
        } catch {
          // Ignore cleanup failures on timeout.
        }
        setUploadedImages([]);
        setUploadProgress(null);
        if (createFileInputRef.current) {
          createFileInputRef.current.value = "";
        }
        toast({
          title: "Draft expired",
          description: "Uploaded images were cleared after inactivity.",
        });
      })();
    }, DRAFT_TTL_MS);

    return () => {
      if (draftTimeoutRef.current) {
        window.clearTimeout(draftTimeoutRef.current);
      }
    };
  }, [toast, uploadedImages]);

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
  const maxImageSizeLabel = formatBytes(MAX_IMAGE_SIZE_BYTES);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    if (selected.length > MAX_PRODUCT_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can upload up to ${MAX_PRODUCT_IMAGES} images per product.`,
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }
    if (uploadedImages.length) {
      try {
        await removeGalleryObjects(uploadedImages.map((image) => image.storage_path));
      } catch (error) {
        toast({
          title: "Cleanup failed",
          description: error instanceof Error ? error.message : "Unable to remove previous uploads.",
          variant: "destructive",
        });
      }
    }
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setUploadedImages([]);
    setCreateFiles(selected);
    setPreviewUrls(selected.map((file) => URL.createObjectURL(file)));
  };

  const handleCreate = async () => {
    if (isCreating) return;
    if (hasPendingUpload) {
      toast({
        title: "Upload images first",
        description: "Click Upload to finish adding selected images.",
        variant: "destructive",
      });
      return;
    }
    const name = form.name.trim();
    const description = form.description.trim();
    const priceValue = Number.parseFloat(form.price);
    if (!name || !description || !form.category) {
      toast({
        title: "Missing details",
        description: "Provide a product name, description, price, and category.",
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

    // Check for existing product name
    const { data: existingProducts, error: checkError } = await supabase
      .from("products")
      .select("id")
      .eq("name", name)
      .limit(1);

    if (checkError) {
      toast({
        title: "Error checking name",
        description: checkError.message,
        variant: "destructive",
      });
      return;
    }

    if (existingProducts && existingProducts.length > 0) {
      toast({
        title: "Name exists",
        description: "A product with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedImages.length) {
      toast({
        title: "Images required",
        description: "Upload at least one image before creating the product.",
        variant: "destructive",
      });
      return;
    }
    if (createFiles.length > MAX_PRODUCT_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can upload up to ${MAX_PRODUCT_IMAGES} images per product.`,
        variant: "destructive",
      });
      return;
    }
    setIsCreating(true);
    const { data: createdProduct, error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price: priceValue,
        category: form.category,
      })
      .select("id")
      .single();
    if (error || !createdProduct) {
      toast({
        title: "Unable to create product",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
      setIsCreating(false);
      return;
    }

    let finalImages: UploadedImage[] = [];
    if (uploadedImages.length) {
      const draftPaths = uploadedImages.map((image) => image.storage_path);
      const movedPaths: string[] = [];
      try {
        finalImages = [];
        for (let index = 0; index < uploadedImages.length; index += 1) {
          const image = uploadedImages[index];
          const fileName = image.storage_path.split("/").pop();
          if (!fileName) {
            throw new Error("Unable to determine the uploaded image name.");
          }
          const nextPath = `products/${createdProduct.id}/${fileName}`;
          if (image.storage_path !== nextPath) {
            await moveGalleryObject(image.storage_path, nextPath);
          }
          movedPaths.push(nextPath);
          finalImages.push({ storage_path: nextPath, sort_order: index });
        }
      } catch (error) {
        try {
          await removeGalleryObjects([...movedPaths, ...draftPaths]);
        } catch {
          // Ignore cleanup failures after a move error.
        }
        await supabase.from("products").delete().eq("id", createdProduct.id);
        toast({
          title: "Image move failed",
          description: error instanceof Error ? error.message : "Unable to move uploaded images.",
          variant: "destructive",
        });
        setUploadedImages([]);
        setCreateFiles([]);
        setPreviewUrls([]);
        if (createFileInputRef.current) {
          createFileInputRef.current.value = "";
        }
        setIsCreating(false);
        return;
      }

      const { error: insertError } = await supabase.from("product_images").insert(
        finalImages.map((image) => ({
          product_id: createdProduct.id,
          storage_path: image.storage_path,
          sort_order: image.sort_order ?? 0,
        })),
      );
      if (insertError) {
        try {
          await removeGalleryObjects(movedPaths);
        } catch {
          // Ignore cleanup failures after insert errors.
        }
        await supabase.from("products").delete().eq("id", createdProduct.id);
        toast({
          title: "Image save failed",
          description: insertError.message,
          variant: "destructive",
        });
        setUploadedImages([]);
        setCreateFiles([]);
        setPreviewUrls([]);
        if (createFileInputRef.current) {
          createFileInputRef.current.value = "";
        }
        setIsCreating(false);
        return;
      }
    }
    toast({
      title: "Product created",
      description: uploadedImages.length
        ? "Product and images added to the gallery."
        : "Product created without images.",
    });
    setForm(emptyForm);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setCreateFiles([]);
    setUploadedImages([]);
    if (createFileInputRef.current) {
      createFileInputRef.current.value = "";
    }
    setUploadProgress(null);
    setIsCreating(false);
  };

  const handleUploadImages = async () => {
    if (!createFiles.length || isUploading) return;
    const totalFiles = createFiles.length;
    let uploadedBytes = 0;
    setIsUploading(true);
    setUploadProgress({
      filePercent: 0,
      bytesPercent: 0,
      fileIndex: 0,
      totalFiles,
      uploadedBytes: 0,
      totalBytes,
    });
    const draftId = crypto.randomUUID();
    const uploaded: UploadedImage[] = [];
    const uploadedPaths: string[] = [];
    const cleanupUploads = async (paths: string[]) => {
      try {
        await removeGalleryObjects(paths);
      } catch {
        // Ignore cleanup failures after upload errors.
      }
    };

    for (let index = 0; index < createFiles.length; index += 1) {
      const file = createFiles[index];
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast({
          title: "Image too large",
          description: `Each image must be ${maxImageSizeLabel} or smaller.`,
          variant: "destructive",
        });
        await cleanupUploads(uploadedPaths);
        setIsUploading(false);
        setUploadProgress(null);
        return;
      }
      const path = `products/drafts/${draftId}/${crypto.randomUUID()}-${file.name}`;
      let uploadError: unknown = null;
      const maxAttempts = 3;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          const { data } = await createGallerySignedUploadUrl(path);
          if (!data?.signedUrl) {
            throw new Error("Unable to create upload link.");
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
                ? Math.round(((index + loaded / file.size) / totalFiles) * 100)
                : Math.round(((index + 1) / totalFiles) * 100);
              setUploadProgress({
                filePercent,
                bytesPercent,
                fileIndex: index + 1,
                totalFiles,
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
          uploadError = null;
          break;
        } catch (error) {
          uploadError = error;
          if (attempt < maxAttempts - 1) {
            await delay(400 * 2 ** attempt);
          }
        }
      }
      if (uploadError) {
        toast({
          title: "Upload failed",
          description: uploadError instanceof Error ? uploadError.message : "Unable to upload image.",
          variant: "destructive",
        });
        await cleanupUploads([...uploadedPaths, path]);
        setIsUploading(false);
        setUploadProgress(null);
        return;
      }
      uploadedPaths.push(path);
      uploadedBytes += file.size || 0;
      setUploadProgress({
        filePercent: Math.round(((index + 1) / totalFiles) * 100),
        bytesPercent: totalBytes ? Math.round((uploadedBytes / totalBytes) * 100) : 100,
        fileIndex: index + 1,
        totalFiles,
        uploadedBytes,
        totalBytes,
      });
      uploaded.push({ storage_path: path, sort_order: index });
    }

    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setUploadedImages(uploaded);
    setCreateFiles([]);
    setIsUploading(false);
    setUploadProgress(null);
    toast({
      title: "Images uploaded",
      description: "Click Create product to finish.",
    });
  };

  const handleDiscardSelection = async () => {
    if (isDiscarding) return;
    setIsDiscarding(true);
    if (uploadedImages.length) {
      const paths = uploadedImages.map((image) => image.storage_path);
      try {
        await removeGalleryObjects(paths);
      } catch (error) {
        toast({
          title: "Discard failed",
          description: error instanceof Error ? error.message : "Unable to remove uploaded images.",
          variant: "destructive",
        });
        setIsDiscarding(false);
        return;
      }
      toast({ title: "Images discarded" });
    }
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setCreateFiles([]);
    setUploadedImages([]);
    setUploadProgress(null);
    if (createFileInputRef.current) {
      createFileInputRef.current.value = "";
    }
    setIsDiscarding(false);
  };

  const handleRemoveSelectedImage = (index: number) => {
    setCreateFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    setPreviewUrls((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed);
      }
      return next;
    });
  };

  const handleRemoveUploadedImage = async (image: UploadedImage) => {
    if (removingImage || isUploading || isDiscarding) return;
    setRemovingImage(image.storage_path);
    try {
      await removeGalleryObjects([image.storage_path]);
    } catch (error) {
      toast({
        title: "Remove failed",
        description: error instanceof Error ? error.message : "Unable to remove image.",
        variant: "destructive",
      });
      setRemovingImage(null);
      return;
    }
    setUploadedImages((prev) => prev.filter((item) => item.storage_path !== image.storage_path));
    setRemovingImage(null);
  };

  return (
    <Layout>
      <section className="bg-cream py-10 md:py-12">
        <div className="container mx-auto space-y-6 px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col gap-3">
            <Badge className="w-fit rounded-full border border-charcoal/20 bg-white/70 px-4 py-1 text-[10px] uppercase tracking-[0.35em] text-charcoal/80">
              Admin dashboard
            </Badge>
            <h1 className="font-serif text-3xl text-charcoal sm:text-4xl md:text-5xl">Add</h1>
            <p className="max-w-2xl text-base text-charcoal/80 md:text-lg font-sans leading-relaxed text-pretty">
              Add new items to the gallery. Each product supports up to {MAX_PRODUCT_IMAGES} images.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/admin/products/manage">Manage</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-12">
        <div className="container mx-auto space-y-8 px-4 sm:px-6 lg:px-12">
          <Card className="border-charcoal/10">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-charcoal sm:text-2xl">Add product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-name">
                    Product name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="product-name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                    placeholder="Enter price"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Category <span className="text-red-500">*</span>
                  </Label>
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product-description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="product-description"
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Describe the product"
                    rows={3}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product-images">
                    Images <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => createFileInputRef.current?.click()}
                      disabled={isCreating || isUploading || remainingSlots <= 0 || uploadedImages.length > 0}
                      className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-charcoal/20 bg-cream/40 text-xs font-medium text-charcoal/80 transition hover:border-charcoal/40 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/20 bg-white/80 text-charcoal">
                        <Plus className="h-4 w-4" />
                      </span>
                      Browse images
                    </button>
                  </div>
                  <input
                    ref={createFileInputRef}
                    id="product-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={isCreating || isUploading || remainingSlots <= 0 || uploadedImages.length > 0}
                    className="hidden"
                  />
                  <div className="flex flex-col gap-2 text-xs text-charcoal/80">
                    <span>Selected files: {selectedCount}</span>
                    <span>Remaining slots: {remainingSlots}</span>
                    <span>Max size per image: {maxImageSizeLabel}</span>
                  </div>
                  {createFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading || uploadedImages.length > 0}
                        onClick={handleUploadImages}
                      >
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isUploading || isDiscarding}
                        onClick={() => {
                          void handleDiscardSelection();
                        }}
                      >
                        {isDiscarding ? "Discarding..." : "Discard"}
                      </Button>
                    </div>
                  )}
                  {uploadProgress && (
                    <div className="space-y-3 rounded-2xl border border-charcoal/10 bg-cream/40 px-4 py-3">
                      <div className="flex items-center justify-between text-xs text-charcoal/80">
                        <span>Files</span>
                        <span>
                          {Math.max(uploadProgress.fileIndex, 0)} / {uploadProgress.totalFiles}
                        </span>
                      </div>
                      <Progress
                        value={Math.max(uploadProgress.filePercent, isUploading ? 5 : 0)}
                        className="h-2 w-full bg-cream/60"
                      />
                      <div className="flex items-center justify-between text-xs text-charcoal/80">
                        <span>Bytes</span>
                        <span>
                          {formatBytes(uploadProgress.uploadedBytes)} /{" "}
                          {formatBytes(uploadProgress.totalBytes)}
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
                  {(previewUrls.length > 0 || uploadedImages.length > 0) && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {uploadedImages.length > 0
                        ? uploadedImages.map((image) => (
                            <div key={image.storage_path} className="group relative">
                              <div className="aspect-square overflow-hidden rounded-lg bg-cream">
                                <img
                                  src={getPublicImageUrl(image.storage_path)}
                                  alt="Uploaded product"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition hover:bg-white"
                                onClick={() => {
                                  void handleRemoveUploadedImage(image);
                                }}
                                disabled={!!removingImage || isUploading || isDiscarding}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        : previewUrls.map((url, index) => (
                            <div key={`${url}-${index}`} className="group relative">
                              <div className="aspect-square overflow-hidden rounded-lg bg-cream">
                                <img
                                  src={url}
                                  alt={`Selected product ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition hover:bg-white"
                                onClick={() => handleRemoveSelectedImage(index)}
                                disabled={isUploading || isDiscarding}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                    </div>
                  )}
                  {uploadedImages.length > 0 && (
                    <p className="text-xs text-charcoal/80">
                      Images uploaded. Click Create product to finish.
                    </p>
                  )}
                </div>
                {!hasPendingUpload && (
                  <div className="flex items-end md:col-span-2">
                    <Button onClick={handleCreate} disabled={isCreating || isUploading || isDiscarding}>
                      {isCreating ? "Creating..." : "Create product"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
