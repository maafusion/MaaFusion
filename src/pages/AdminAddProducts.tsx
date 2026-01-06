import { useRef, useState } from "react";
import { Plus } from "lucide-react";
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
import {
  GALLERY_BUCKET,
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
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const createFileInputRef = useRef<HTMLInputElement | null>(null);
  const totalBytes = createFiles.reduce((sum, file) => sum + (file.size || 0), 0);
  const remainingSlots = MAX_PRODUCT_IMAGES - createFiles.length;
  const hasPendingUpload = createFiles.length > 0 && uploadedImages.length === 0;

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length > MAX_PRODUCT_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can upload up to ${MAX_PRODUCT_IMAGES} images per product.`,
        variant: "destructive",
      });
      event.target.value = "";
      return;
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

    if (uploadedImages.length) {
      const { error: insertError } = await supabase.from("product_images").insert(
        uploadedImages.map((image, index) => ({
          product_id: createdProduct.id,
          storage_path: image.storage_path,
          sort_order: index,
        })),
      );
      if (insertError) {
        toast({
          title: "Image save failed",
          description: insertError.message,
          variant: "destructive",
        });
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

    for (let index = 0; index < createFiles.length; index += 1) {
      const file = createFiles[index];
      const path = `products/drafts/${draftId}/${crypto.randomUUID()}-${file.name}`;
      const { data, error: uploadError } = await supabase
        .storage
        .from(GALLERY_BUCKET)
        .createSignedUploadUrl(path, 60);
      if (uploadError || !data?.signedUrl) {
        toast({
          title: "Upload failed",
          description: uploadError?.message ?? "Unable to create upload link.",
          variant: "destructive",
        });
        setIsUploading(false);
        setUploadProgress(null);
        return;
      }
      try {
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
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Unable to upload image.",
          variant: "destructive",
        });
        setIsUploading(false);
        setUploadProgress(null);
        return;
      }
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
      const { error: storageError } = await supabase.storage.from(GALLERY_BUCKET).remove(paths);
      if (storageError) {
        toast({
          title: "Discard failed",
          description: storageError.message,
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

  return (
    <Layout>
      <section className="bg-cream py-12">
        <div className="container mx-auto space-y-6 px-6 lg:px-12">
          <div className="flex flex-col gap-3">
            <Badge className="w-fit rounded-full border border-charcoal/20 bg-white/70 px-4 py-1 text-[10px] uppercase tracking-[0.35em] text-charcoal/70">
              Admin dashboard
            </Badge>
            <h1 className="font-serif text-4xl text-charcoal md:text-6xl">Add</h1>
            <p className="max-w-2xl text-base text-charcoal/60 md:text-lg">
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

      <section className="bg-white py-12">
        <div className="container mx-auto space-y-8 px-6 lg:px-12">
          <Card className="border-charcoal/10">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-charcoal">Add product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
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
                  <Label htmlFor="product-price">Price</Label>
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product-description">Description</Label>
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
                  <Label htmlFor="product-images">Images</Label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => createFileInputRef.current?.click()}
                      disabled={isCreating || isUploading || remainingSlots <= 0 || uploadedImages.length > 0}
                      className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-charcoal/20 bg-cream/40 text-xs font-medium text-charcoal/60 transition hover:border-charcoal/40 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-50"
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
                  <div className="flex flex-col gap-2 text-xs text-charcoal/60">
                    <span>Selected files: {createFiles.length}</span>
                    <span>Remaining slots: {remainingSlots}</span>
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
                            <div key={image.storage_path} className="overflow-hidden rounded-lg bg-cream">
                              <div className="aspect-square">
                                <img
                                  src={getPublicImageUrl(image.storage_path)}
                                  alt="Uploaded product"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </div>
                          ))
                        : previewUrls.map((url, index) => (
                            <div key={`${url}-${index}`} className="overflow-hidden rounded-lg bg-cream">
                              <div className="aspect-square">
                                <img
                                  src={url}
                                  alt={`Selected product ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                    </div>
                  )}
                  {uploadedImages.length > 0 && (
                    <p className="text-xs text-charcoal/60">
                      Images uploaded. Click Create product to finish.
                    </p>
                  )}
                </div>
                <div className="flex items-end md:col-span-2">
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating || isUploading || isDiscarding || hasPendingUpload}
                  >
                    {isCreating ? "Creating..." : "Create product"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
