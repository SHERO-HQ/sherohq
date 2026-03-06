"use client";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchProduct,
  fetchCategories,
  uploadImages,
  type ProductInput,
} from "@/services/api";
import type { Product } from "@/types/product";
import {
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Package,
  List,
  Tag,
  Info,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useUpdateProduct,
  useCreateProduct,
} from "@/hooks/queries/useProducts";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { cn } from "@/lib/utils";
import ProductImage from "@/components/common/ProductImage";

interface Category {
  id: string;
  name: string;
}

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { setLabel, clearLabel } = useBreadcrumb();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const [productData, setProductData] = useState<Partial<Product>>({
    name: "",
    category: "",
    price: 0,
    originalPrice: undefined,
    image: "",
    inStock: true,
    description: "",
    features: [],
    specifications: {},
    badge: "",
    images: [],
    stockQuantity: 100,
  });

  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>(
    [],
  );
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const cats = await fetchCategories();
        setCategories(cats);

        if (isEdit && id) {
          const product = await fetchProduct(id);
          if (product) {
            setProductData({
              ...product,
              category: product.categoryId || product.category || "",
            });
            // Set breadcrumb label to SKU or product name
            const label = product.name || id;
            setLabel(`/admin/products/${id}`, label);

            // Init specs list
            if (product.specifications) {
              setSpecsList(
                Object.entries(product.specifications).map(([key, value]) => ({
                  key,
                  value,
                })),
              );
            }
          }
        }
      } catch (err) {
        addNotification("Error", "Failed to load product data", "error");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Cleanup: clear label on unmount
    return () => {
      if (id) {
        clearLabel(`/admin/products/${id}`);
      }
    };
  }, [id, isEdit, addNotification, setLabel, clearLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      // Convert specs list back to object
      const specifications = specsList.reduce(
        (acc, { key, value }) => {
          if (key.trim()) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      const finalData = { ...productData, specifications };

      if (isEdit && id) {
        await updateProductMutation.mutateAsync({ id, data: finalData });
        addNotification("Success", "Product updated successfully", "success");
      } else {
        await createProductMutation.mutateAsync(finalData as ProductInput);
        addNotification("Success", "Product created successfully", "success");
      }
      navigate("/admin/products");
    } catch (err) {
      addNotification("Error", "Failed to save product", "error");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check limit
    const currentImages = productData.images || [];
    if (currentImages.length + files.length > 5) {
      addNotification("Error", "You can only upload up to 5 images", "error");
      return;
    }

    try {
      setIsUploading(true);
      const { imageUrls } = await uploadImages(files);

      setProductData((prev) => ({
        ...prev,
        // Set first image as main if not already set
        image: prev.image || imageUrls[0],
        images: [...(prev.images || []), ...imageUrls],
      }));

      addNotification("Success", `${files.length} images uploaded`, "success");
    } catch (err) {
      addNotification("Error", "Failed to upload images", "error");
      console.error(err);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeImage = (url: string) => {
    setProductData((prev) => {
      const newImages = (prev.images || []).filter((img) => img !== url);
      return {
        ...prev,
        images: newImages,
        // If we removed the main image, pick the next one or clear it
        image: prev.image === url ? newImages[0] || "" : prev.image,
      };
    });
  };

  const setMainImage = (url: string) => {
    setProductData((prev) => ({ ...prev, image: url }));
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setProductData((prev) => ({
      ...prev,
      features: [...(prev.features || []), newFeature.trim()],
    }));
    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index),
    }));
  };

  const addSpecRow = () => {
    setSpecsList((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecsList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpecRow = (
    index: number,
    field: "key" | "value",
    newValue: string,
  ) => {
    setSpecsList((prev) => {
      const newList = [...prev];
      newList[index] = { ...newList[index], [field]: newValue };
      return newList;
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="flex  flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
              onClick={() => navigate("/admin/products")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white font-sora">
                {isEdit ? "Edit Product" : "New Product"}
              </h1>
              <p className="text-slate-400 text-sm">
                Fill in the details to {isEdit ? "update" : "create"} a product
                listing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Product
                </>
              )}
            </Button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Media */}
            <Card className="bg-slate-900 border-white/5 p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white font-sora">
                    Product Media
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {productData.images?.length || 0} / 5 Images
                </span>
              </div>

              <div className="space-y-6">
                {/* Image Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {(productData.images || []).map((url) => (
                    <div
                      key={url}
                      className={cn(
                        "relative aspect-square w-full rounded bg-slate-800 border-2 overflow-hidden shadow-lg",
                        productData.image === url
                          ? "border-emerald-500 shadow-emerald-500/10"
                          : "border-white/5",
                      )}
                    >
                      <ProductImage
                        src={url}
                        alt="Product"
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover"
                      />

                      {/* Permanent Positioned Actions */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="p-2 bg-rose-500 text-white rounded shadow-lg hover:bg-rose-600 transition-colors"
                          title="Remove Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="absolute bottom-0 inset-x-0 p-3 bg-linear-to-t from-black/80 via-black/40 to-transparent">
                        <button
                          type="button"
                          onClick={() => setMainImage(url)}
                          className={cn(
                            "w-full py-2 px-3 rounded text-xs font-bold uppercase tracking-wider transition-all shadow-md",
                            productData.image === url
                              ? "bg-emerald-500 text-white cursor-default"
                              : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md",
                          )}
                          disabled={productData.image === url}
                        >
                          {productData.image === url
                            ? "Current Main"
                            : "Set as Main"}
                        </button>
                      </div>

                      {productData.image === url && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-[10px] font-bold text-white rounded shadow-lg uppercase tracking-tight">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Upload Placeholder */}
                  {(!productData.images || productData.images.length < 5) && (
                    <label
                      className={cn(
                        "aspect-square rounded w-full border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                        isUploading
                          ? "bg-slate-800/50 border-emerald-500/20 pointer-events-none"
                          : "border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5",
                      )}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-6 h-6 text-slate-500" />
                          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                            Upload
                          </span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                <div className="p-4 rounded bg-slate-800/30 border border-white/5">
                  <p className="text-xs text-slate-500 flex items-center gap-2 italic">
                    <Info className="w-3.5 h-3.5" /> First uploaded image
                    becomes the primary display image. Max 5 images allowed.
                  </p>
                </div>
              </div>
            </Card>

            {/* Features & Specifications */}
            <Card className="bg-slate-900 border-white/5 p-6 md:p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <List className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white font-sora">
                    Features
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a product feature..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                      className="bg-slate-800/50 border-white/5 text-white"
                    />
                    <Button
                      type="button"
                      onClick={addFeature}
                      className="bg-slate-800 text-white hover:bg-slate-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {productData.features?.map((feature, index) => (
                      <Badge
                        key={feature}
                        className="bg-slate-800 text-slate-200 border-white/5 py-1.5 px-3 group"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="ml-2 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {(!productData.features ||
                      productData.features.length === 0) && (
                      <p className="text-xs text-slate-500 italic">
                        No features added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white font-sora">
                      Specifications
                    </h3>
                  </div>
                  <Button
                    type="button"
                    onClick={addSpecRow}
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white hover:bg-white/5 hover:text-emerald-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Spec
                  </Button>
                </div>

                <div className="space-y-3">
                  {specsList.map((spec, index) => (
                    <div
                      key={`spec-${index}-${spec.key}`}
                      className="flex gap-3 items-start p-3 rounded bg-slate-800/30 border border-white/5 animate-in fade-in slide-in-from-top-1 duration-200"
                    >
                      <div className="flex-1 space-y-1">
                        <Input
                          placeholder="Key (e.g. RAM)"
                          value={spec.key}
                          onChange={(e) =>
                            updateSpecRow(index, "key", e.target.value)
                          }
                          className="bg-slate-800/50 border-white/5 text-white h-9 text-sm"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Input
                          placeholder="Value (e.g. 16GB)"
                          value={spec.value}
                          onChange={(e) =>
                            updateSpecRow(index, "value", e.target.value)
                          }
                          className="bg-slate-800/50 border-white/5 text-white h-9 text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeSpecRow(index)}
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {specsList.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-white/5 rounded">
                      <p className="text-slate-500 text-sm italic mb-2">
                        No technical specifications added.
                      </p>
                      <Button
                        type="button"
                        onClick={addSpecRow}
                        variant="link"
                        className="text-emerald-400"
                      >
                        Add your first specification
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* General Info */}
            <Card className="bg-slate-900 border-white/5 p-6 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Info className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white font-sora">
                  General Information
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-slate-400"
                    >
                      Product Name
                    </label>
                    <Input
                      id="name"
                      placeholder="e.g. MacBook Pro M3"
                      value={productData.name}
                      onChange={(e) =>
                        setProductData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="bg-slate-800/50 border-white/5 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="sku"
                      className="text-sm font-medium text-slate-400"
                    >
                      SKU (Optional)
                    </label>
                    <Input
                      id="sku"
                      placeholder="e.g. LAP-MAC-16M3"
                      value={productData.sku || ""}
                      onChange={(e) =>
                        setProductData((prev) => ({
                          ...prev,
                          sku: e.target.value,
                        }))
                      }
                      className="bg-slate-800/50 border-white/5 text-white"
                    />
                    <p className="text-[10px] text-slate-500 italic">
                      Leave blank to auto-generate based on Product ID.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="slug"
                      className="text-sm font-medium text-slate-400"
                    >
                      URL Slug
                    </label>
                    <Input
                      id="slug"
                      placeholder="e.g. macbook-pro-m3"
                      value={productData.slug || ""}
                      onChange={(e) =>
                        setProductData((prev) => ({
                          ...prev,
                          slug: e.target.value
                            .toLowerCase()
                            .replaceAll(/[^a-z0-9]+/g, "-")
                            .replaceAll(/(^-|-$)/g, ""),
                        }))
                      }
                      className="bg-slate-800/50 border-white/5 text-white"
                    />
                    <p className="text-[10px] text-slate-500 italic">
                      The friendly URL for this product (e.g.,
                      /products/your-product-name).
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-slate-400"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    placeholder="Provide a detailed product description..."
                    value={productData.description}
                    onChange={(e) =>
                      setProductData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full min-h-[150px] bg-slate-800/50 border border-white/5 rounded p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-y"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Status & Category */}
            <Card className="bg-slate-900 border-white/5 p-6 space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="price"
                  className="text-sm font-medium text-slate-400"
                >
                  Pricing (GH₵)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="price"
                      className="text-[10px] text-slate-600 uppercase font-bold"
                    >
                      Price
                    </label>
                    <Input
                      id="price"
                      type="number"
                      value={productData.price}
                      onChange={(e) =>
                        setProductData((prev) => ({
                          ...prev,
                          price: Number.parseFloat(e.target.value),
                        }))
                      }
                      className="bg-slate-800/50 border-white/5 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="originalPrice"
                      className="text-[10px] text-slate-600 uppercase font-bold"
                    >
                      Discount Price
                    </label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={productData.originalPrice || ""}
                      onChange={(e) =>
                        setProductData((prev) => ({
                          ...prev,
                          originalPrice: e.target.value
                            ? Number.parseFloat(e.target.value)
                            : undefined,
                        }))
                      }
                      className="bg-slate-800/50 border-white/5 text-white"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-slate-400"
                >
                  Category
                </label>
                <select
                  id="category"
                  className="w-full bg-slate-800 border-white/5 text-white rounded px-4 py-2 outline-none focus:ring-1 focus:ring-emerald-500/50"
                  value={productData.category}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="condition"
                  className="text-sm font-medium text-slate-400"
                >
                  Condition
                </label>
                <select
                  id="condition"
                  className="w-full bg-slate-800 border-white/5 text-white rounded px-4 py-2 outline-none focus:ring-1 focus:ring-emerald-500/50"
                  value={productData.condition || "New"}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      condition: e.target.value as Product["condition"],
                    }))
                  }
                >
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 rounded bg-slate-800/30 border border-white/5">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-white font-medium">
                    In Stock Status
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setProductData((prev) => ({
                      ...prev,
                      inStock: !prev.inStock,
                    }))
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    productData.inStock ? "bg-emerald-600" : "bg-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      productData.inStock ? "translate-x-6" : "translate-x-1",
                    )}
                  />
                </button>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

// Sub-components used
function Card({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded border", className)} {...props}>
      {children}
    </div>
  );
}
