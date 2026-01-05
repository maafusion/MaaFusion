import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function AdminAddProducts() {
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [isCreating, setIsCreating] = useState(false);
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const createFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreate = async () => {
    if (isCreating) return;
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

    if (createFiles.length) {
      for (let index = 0; index < createFiles.length; index += 1) {
        const file = createFiles[index];
        const path = `products/${createdProduct.id}/${crypto.randomUUID()}-${file.name}`;
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
          setIsCreating(false);
          return;
        }
        const { error: insertError } = await supabase.from("product_images").insert({
          product_id: createdProduct.id,
          storage_path: path,
          sort_order: index,
        });
        if (insertError) {
          await supabase.storage.from(GALLERY_BUCKET).remove([path]);
          toast({
            title: "Image save failed",
            description: insertError.message,
            variant: "destructive",
          });
          setIsCreating(false);
          return;
        }
      }
    }
    toast({
      title: "Product created",
      description: createFiles.length
        ? "Product and images added to the gallery."
        : "Product created without images.",
    });
    setForm(emptyForm);
    setCreateFiles([]);
    if (createFileInputRef.current) {
      createFileInputRef.current.value = "";
    }
    setIsCreating(false);
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
                  <Input
                    ref={createFileInputRef}
                    id="product-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
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
                      setCreateFiles(selected);
                    }}
                  />
                  <p className="text-xs text-charcoal/60">Selected files: {createFiles.length}</p>
                </div>
                <div className="flex items-end md:col-span-2">
                  <Button onClick={handleCreate} disabled={isCreating}>
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
