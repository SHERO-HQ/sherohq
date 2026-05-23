"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/utils/error";
import {
  fetchProduct,
  fetchCategories,
  uploadImages,
  type ProductInput,
} from "@/services/api";
import type { Product } from "@/types/product";
import { Card } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";
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
import AppImage from "@/components/common/AppImage";
import { compressImage } from "@/utils/image-utils";

interface Category {
  id: string;
  name: string;
}

interface SpecRow {
  id: string;
  key: string;
  value: string;
}

interface ProductFormDraft {
  productData: Partial<Product>;
  specsList: SpecRow[];
  newFeature: string;
}

const PRODUCT_DRAFT_STORAGE_PREFIX = "sherotech:admin:product-form:v1";

const defaultProductData = (): Partial<Product> => ({
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
  stockQuantity: undefined,
  isSpotlight: false,
  isFeatured: false,
});

const getProductDraftKey = (productId: string | undefined) =>
  `${PRODUCT_DRAFT_STORAGE_PREFIX}:${productId || "new"}`;

const isDraftMeaningful = (draft: ProductFormDraft) => {
  const { productData, specsList, newFeature } = draft;

  // Check if draft has any meaningful data, including nested arrays/objects
  return Boolean(
    productData.name?.trim() ||
    productData.category?.trim() ||
    (productData.price ?? 0) > 0 ||
    (productData.originalPrice ?? 0) > 0 ||
    productData.image?.trim() ||
    (productData.images?.length ?? 0) > 0 || // Ensure images array is checked
    (productData.features?.length ?? 0) > 0 || // Ensure features array is checked
    Object.keys(productData.specifications || {}).length > 0 || // Ensure specs object is checked
    productData.description?.trim() ||
    productData.badge?.trim() ||
    productData.stockQuantity !== undefined ||
    productData.isSpotlight ||
    productData.isFeatured ||
    specsList.some((row) => row.key.trim() || row.value.trim()) ||
    newFeature.trim(),
  );
};

const serializeDraft = (draft: ProductFormDraft) => {
  // Ensure nested arrays/objects are properly serialized
  return JSON.stringify({
    productData: {
      ...draft.productData,
      images: Array.isArray(draft.productData.images)
        ? draft.productData.images
        : [],
      features: Array.isArray(draft.productData.features)
        ? draft.productData.features
        : [],
      specifications:
        typeof draft.productData.specifications === "object"
          ? draft.productData.specifications
          : {},
    },
    specsList: Array.isArray(draft.specsList) ? draft.specsList : [],
    newFeature: draft.newFeature || "",
  });
};

// Check if localStorage has available space
const checkStorageQuota = (): boolean => {
  if (typeof window === "undefined") return true;

  const test = "__sherotech_quota_test__";
  try {
    const testData = new Array(1024 * 1024).join("x"); // 1MB test
    localStorage.setItem(test, testData);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    // Out of space or quota exceeded
    console.error("LocalStorage quota exceeded:", error);
    return false;
  }
};

// Clean up oldest drafts when storage is full
const cleanupOldDrafts = (): void => {
  if (typeof window === "undefined") return;

  try {
    const drafts: Array<{
      key: string;
      timestamp: number;
    }> = [];

    // Find all draft keys and their timestamps
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(PRODUCT_DRAFT_STORAGE_PREFIX)) {
        const timestampKey = `${key}:savedAt`;
        const timestampStr = window.localStorage.getItem(timestampKey);
        const timestamp = timestampStr ? new Date(timestampStr).getTime() : 0;
        drafts.push({ key, timestamp });
      }
    }

    // Sort by timestamp (oldest first) and remove oldest half
    drafts.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(drafts.length / 2);

    for (let i = 0; i < toRemove; i++) {
      window.localStorage.removeItem(drafts[i].key);
      window.localStorage.removeItem(`${drafts[i].key}:savedAt`);
    }
  } catch (error) {
    console.error("Failed to cleanup drafts:", error);
  }
};

// Reconcile specsList with productData.specifications
const reconcileSpecs = (
  productData: Partial<Product>,
  specsList: SpecRow[],
): SpecRow[] => {
  // If specsList is empty but specs exist in productData, rebuild from specs
  if (
    specsList.length === 0 &&
    Object.keys(productData.specifications || {}).length > 0
  ) {
    return Object.entries(productData.specifications || {}).map(
      ([key, value]) => ({
        id: uuidv4(),
        key,
        value,
      }),
    );
  }
  return specsList;
};

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { setLabel, clearLabel } = useBreadcrumb();
  const isEdit = Boolean(id);
  const draftKey = getProductDraftKey(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const initialDraftSnapshotRef = useRef<string>("");

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const [productData, setProductData] = useState<Partial<Product>>(() =>
    defaultProductData(),
  );

  const [specsList, setSpecsList] = useState<SpecRow[]>([]);
  const [newFeature, setNewFeature] = useState("");

  const currentDraft = useMemo<ProductFormDraft>(
    () => ({
      productData,
      specsList,
      newFeature,
    }),
    [productData, specsList, newFeature],
  );

  const persistDraft = useCallback(
    (draft: ProductFormDraft) => {
      if (typeof window === "undefined") return;

      if (!isDraftMeaningful(draft)) {
        window.localStorage.removeItem(draftKey);
        window.localStorage.removeItem(`${draftKey}:savedAt`);
        setHasDraft(false);
        setDraftSavedAt(null);
        return;
      }

      window.localStorage.setItem(draftKey, serializeDraft(draft));
      const savedAt = new Date().toISOString();
      window.localStorage.setItem(`${draftKey}:savedAt`, savedAt);
      setHasDraft(true);
      setDraftSavedAt(savedAt);

      // Check storage quota and cleanup if needed
      if (!checkStorageQuota()) {
        cleanupOldDrafts();
      }
    },
    [draftKey],
  );

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem(draftKey);
    window.localStorage.removeItem(`${draftKey}:savedAt`);
    setHasDraft(false);
    setDraftSavedAt(null);
    initialDraftSnapshotRef.current = serializeDraft(currentDraft);
  }, [currentDraft, draftKey]);

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
                  id: uuidv4(),
                  key,
                  value,
                })),
              );
            }
          }
        }
      } catch (err) {
        addNotification(
          "Error",
          getErrorMessage(err, "Failed to load product data"),
          "error",
        );
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

  useEffect(() => {
    if (typeof window === "undefined" || isLoading || draftLoaded) return;

    try {
      const savedDraftText = window.localStorage.getItem(draftKey);
      if (savedDraftText) {
        const savedAt = window.localStorage.getItem(`${draftKey}:savedAt`);
        const parsed = JSON.parse(savedDraftText) as Partial<ProductFormDraft>;

        let restoredProductData: Partial<Product> = defaultProductData();

        if (parsed.productData) {
          // Explicitly preserve images, features, and specifications
          restoredProductData = {
            ...defaultProductData(),
            ...parsed.productData,
          };

          // Ensure critical nested arrays/objects are never lost
          restoredProductData.images = Array.isArray(parsed.productData.images)
            ? parsed.productData.images
            : restoredProductData.images || [];

          restoredProductData.features = Array.isArray(
            parsed.productData.features,
          )
            ? parsed.productData.features
            : restoredProductData.features || [];

          restoredProductData.specifications =
            typeof parsed.productData.specifications === "object"
              ? parsed.productData.specifications
              : restoredProductData.specifications || {};

          setProductData(restoredProductData);
        }

        // Restore specs list from draft (primary source of truth for editing)
        // Reconcile with productData.specifications if needed
        const restoredSpecsList = Array.isArray(parsed.specsList)
          ? parsed.specsList
          : [];
        const reconciled = reconcileSpecs(
          restoredProductData,
          restoredSpecsList,
        );
        setSpecsList(reconciled);

        setNewFeature(parsed.newFeature || "");
        setHasDraft(true);
        setDraftSavedAt(savedAt);

        addNotification(
          "Draft restored",
          "We restored your saved product draft in this browser.",
          "info",
        );
      }
    } catch (error) {
      console.error("Failed to restore draft:", error);
      clearDraft();
    } finally {
      setDraftLoaded(true);
    }
  }, [addNotification, clearDraft, draftKey, draftLoaded, isLoading]);

  useEffect(() => {
    if (!draftLoaded || initialDraftSnapshotRef.current) return;

    initialDraftSnapshotRef.current = serializeDraft(currentDraft);
  }, [currentDraft, draftLoaded]);

  useEffect(() => {
    if (!draftLoaded || isLoading) return;

    const draftSnapshot = serializeDraft(currentDraft);
    if (draftSnapshot === initialDraftSnapshotRef.current) return;

    const timeout = window.setTimeout(() => {
      persistDraft(currentDraft);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [currentDraft, draftLoaded, isLoading, persistDraft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!productData.name?.trim()) {
      addNotification("Validation Error", "Product name is required", "error");
      return;
    }
    if ((productData.price ?? 0) <= 0) {
      addNotification(
        "Validation Error",
        "Price must be greater than 0",
        "error",
      );
      return;
    }
    if (!productData.category) {
      addNotification("Validation Error", "Please select a category", "error");
      return;
    }

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

      const finalData = {
        ...productData,
        specifications,
        // Ensure images and features are included from current state
        images: productData.images || [],
        features: productData.features || [],
      };

      // Debug: Log what's being sent to ensure images/features are included
      console.log("Submitting product data:", {
        hasImages: finalData.images?.length ?? 0,
        images: finalData.images,
        hasFeatures: finalData.features?.length ?? 0,
        features: finalData.features,
        hasSpecs: Object.keys(finalData.specifications || {}).length ?? 0,
        specifications: finalData.specifications,
      });

      if (isEdit && id) {
        await updateProductMutation.mutateAsync({ id, data: finalData });
        addNotification("Success", "Product updated successfully", "success");
      } else {
        await createProductMutation.mutateAsync(finalData as ProductInput);
        addNotification("Success", "Product created successfully", "success");
      }
      clearDraft();
      router.push("/admin/products");
    } catch (err: unknown) {
      // Show explicit error message from API if available
      const message =
        err instanceof Error ? err.message : "Failed to save product";
      addNotification("Error", message, "error");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = () => {
    persistDraft(currentDraft);
    addNotification(
      "Draft saved",
      "Your changes were saved locally.",
      "success",
    );
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

    // Filter by type
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        addNotification("Skipped", `${file.name} is not an image`, "error");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setIsUploading(true);
      addNotification(
        "Processing",
        `Uploading ${validFiles.length} image(s)...`,
        "info",
      );

      // Optimize and upload each file
      const uploadedUrls: string[] = [];
      for (const file of validFiles) {
        const optimizedFile = await compressImage(file);
        const { imageUrls } = await uploadImages([optimizedFile]);
        if (imageUrls?.[0]) {
          uploadedUrls.push(imageUrls[0]);
        }
      }

      setProductData((prev: Partial<Product>) => ({
        ...prev,
        image: prev.image || uploadedUrls[0],
        images: [...(prev.images || []), ...uploadedUrls],
      }));

      addNotification("Success", "Images uploaded successfully", "success");
    } catch (err: unknown) {
      let message = "Failed to upload images";
      const error = err as { message?: string; status?: number };
      if (error.message?.includes("Failed to fetch") || !error.status) {
        message =
          "Server unreachable or connection dropped. Please try again or check the server status.";
      } else if (error.message) {
        message = error.message;
      }
      addNotification("Error", message, "error");
      console.error(error);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeImage = (url: string) => {
    setProductData((prev: Partial<Product>) => {
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
    setSpecsList((prev) => [...prev, { id: uuidv4(), key: "", value: "" }]);
  };

  const removeSpecRow = (id: string) => {
    setSpecsList((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSpecRow = (
    id: string,
    field: "key" | "value",
    newValue: string,
  ) => {
    setSpecsList((prev) => {
      return prev.map((s) => (s.id === id ? { ...s, [field]: newValue } : s));
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
            onClick={() => router.push("/admin/products")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
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
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white min-w-30"
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

      {(hasDraft || draftSavedAt) && (
        <div className="flex flex-col gap-3 rounded border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                Local draft
              </Badge>
              <span className="text-sm text-slate-200">
                Draft autosave is enabled for this form.
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {draftSavedAt
                ? `Last saved ${new Date(draftSavedAt).toLocaleString()}.`
                : "Your changes will be saved locally as you type."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-100"
            >
              Save draft now
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={clearDraft}
              className="text-slate-300 hover:text-white hover:bg-white/5"
            >
              Clear draft
            </Button>
          </div>
        </div>
      )}

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
                <ImageIcon className="w-5 h-5 text-brand-secondary-400" />
                <h3 className="font-bold text-white">Product Media</h3>
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
                      "relative aspect-square w-full rounded bg-slate-800 border-2 overflow-hidden shadow",
                      productData.image === url
                        ? "border-brand-secondary-500 shadow-brand-secondary-500/10"
                        : "border-white/5",
                    )}
                  >
                    <AppImage
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
                        className="p-1 bg-rose-500 text-white rounded shadow hover:bg-rose-600 transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-3 bg-linear-to-t from-black/80 via-black/40 to-transparent">
                      <button
                        type="button"
                        onClick={() => setMainImage(url)}
                        className={cn(
                          "w-full py-1 px-2 rounded text-[9px] font-medium tracking-wider transition shadow",
                          productData.image === url
                            ? "bg-brand-secondary-500 text-white cursor-default"
                            : "bg-white/20 hover:bg-white/30 text-white ",
                        )}
                        disabled={productData.image === url}
                      >
                        {productData.image === url ? "Primary" : "Set Primary"}
                      </button>
                    </div>

                    {/* {productData.image === url && (
                        <div className="absolute top-2 left-2 px-1 py-0.5 bg-brand-secondary-500 text-[10px] text-white rounded shadow uppercase tracking-tight">
                          Primary
                        </div>
                      )} */}
                  </div>
                ))}

                {/* Upload Placeholder */}
                {(!productData.images || productData.images.length < 5) && (
                  <label
                    className={cn(
                      "aspect-square rounded w-full border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition",
                      isUploading
                        ? "bg-slate-800/50 border-brand-secondary-500/20 pointer-events-none"
                        : "border-white/10 hover:border-brand-secondary-500/50 hover:bg-brand-secondary-500/5",
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
                      <Loader2 className="w-6 h-6 text-brand-secondary-500 animate-spin" />
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
                  <Info className="w-3.5 h-3.5" /> First uploaded image becomes
                  the primary display image. Max 5 images allowed.
                </p>
              </div>
            </div>
          </Card>

          {/* Features & Specifications */}
          <Card className="bg-slate-900 border-white/5 p-6 md:p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <List className="w-5 h-5 text-brand-secondary-400" />
                <h3 className="text-lg font-bold text-white">Features</h3>
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
                  <Tag className="w-5 h-5 text-brand-secondary-400" />
                  <h3 className="text-lg font-bold text-white">
                    Specifications
                  </h3>
                </div>
                <Button
                  type="button"
                  onClick={addSpecRow}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white hover:bg-white/5 hover:text-brand-secondary-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Spec
                </Button>
              </div>

              <div className="space-y-3">
                {specsList.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex gap-3 items-start p-3 rounded bg-slate-800/30 border border-white/5 animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Key (e.g. RAM)"
                        value={spec.key}
                        onChange={(e) =>
                          updateSpecRow(spec.id, "key", e.target.value)
                        }
                        className="bg-slate-800/50 border-white/5 text-white h-9 text-sm"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Value (e.g. 16GB)"
                        value={spec.value}
                        onChange={(e) =>
                          updateSpecRow(spec.id, "value", e.target.value)
                        }
                        className="bg-slate-800/50 border-white/5 text-white h-9 text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeSpecRow(spec.id)}
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
                      className="text-brand-secondary-400"
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
              <Info className="w-5 h-5 text-brand-secondary-400" />
              <h3 className="text-lg font-bold text-white">
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
                  className="w-full min-h-37.5 bg-slate-800/50 border border-white/5 rounded p-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-secondary-500/50 resize-y"
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
                className="w-full bg-slate-800 border-white/5 text-white rounded px-4 py-2 outline-none focus:ring-1 focus:ring-brand-secondary-500/50"
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
                className="w-full bg-slate-800 border-white/5 text-white rounded px-4 py-2 outline-none focus:ring-1 focus:ring-brand-secondary-500/50"
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

            <div className="space-y-2">
              <label
                htmlFor="stockQuantity"
                className="text-sm font-medium text-slate-400"
              >
                Stock Quantity
              </label>
              <Input
                id="stockQuantity"
                type="number"
                placeholder="Available stock (Optional)"
                value={productData.stockQuantity ?? ""}
                onChange={(e) =>
                  setProductData((prev) => ({
                    ...prev,
                    stockQuantity: e.target.value
                      ? Number.parseInt(e.target.value)
                      : undefined,
                    quantity: e.target.value
                      ? Number.parseInt(e.target.value)
                      : undefined,
                  }))
                }
                className="bg-slate-800/50 border-white/5 text-white"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded bg-slate-800/30 border border-white/5">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-secondary-400" />
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
                  productData.inStock
                    ? "bg-brand-secondary-600"
                    : "bg-slate-700",
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

          {/* Visibility & Promotion */}
          <Card className="bg-slate-900 border-white/5 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Tag className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-white">
                Promotion & Visibility
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-white/5 rounded transition-colors hover:bg-slate-800/50 group">
                <div>
                  <span className="block text-sm font-medium text-white">
                    Show in Spotlight
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                    Hero Spotlight carousel.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setProductData((prev) => ({
                      ...prev,
                      isSpotlight: !prev.isSpotlight,
                    }))
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    productData.isSpotlight
                      ? "bg-brand-secondary-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      : "bg-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      productData.isSpotlight
                        ? "translate-x-6"
                        : "translate-x-1",
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-white/5 rounded transition-colors hover:bg-slate-800/50 group">
                <div>
                  <span className="block text-sm font-medium text-white">
                    Featured Product
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                    Prioritize in recommendations.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setProductData((prev) => ({
                      ...prev,
                      isFeatured: !prev.isFeatured,
                    }))
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    productData.isFeatured
                      ? "bg-brand-secondary-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      : "bg-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      productData.isFeatured
                        ? "translate-x-6"
                        : "translate-x-1",
                    )}
                  />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
