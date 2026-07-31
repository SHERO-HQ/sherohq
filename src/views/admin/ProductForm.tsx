"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/utils/error";
import {
  fetchProduct,
  fetchCategories,
  type ProductInput,
} from "@/services/api";
import type { Product } from "@/types/product";
import { v4 as uuidv4 } from "uuid";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import {
  useUpdateProduct,
  useCreateProduct,
} from "@/hooks/queries/useProducts";
import { useFormDraft } from "@/hooks/useFormDraft";
import { useImageUpload } from "@/hooks/useImageUpload";

// Import modular form components
import ProductIdentityCard from "@/components/admin/product/ProductIdentityCard";
import ProductMediaCard from "@/components/admin/product/ProductMediaCard";
import ProductSpecsCard, { type SpecRow } from "@/components/admin/product/ProductSpecsCard";
import ProductFeaturesCard from "@/components/admin/product/ProductFeaturesCard";
import ProductSEOCard from "@/components/admin/product/ProductSEOCard";
import ProductSidebarMeta from "@/components/admin/product/ProductSidebarMeta";

interface Category {
  id: string;
  name: string;
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
  costPrice: undefined,
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

  return Boolean(
    productData.name?.trim() ||
    productData.category?.trim() ||
    (productData.price ?? 0) > 0 ||
    (productData.originalPrice ?? 0) > 0 ||
    productData.image?.trim() ||
    (productData.images?.length ?? 0) > 0 ||
    (productData.features?.length ?? 0) > 0 ||
    Object.keys(productData.specifications || {}).length > 0 ||
    productData.description?.trim() ||
    productData.badge?.trim() ||
    productData.stockQuantity !== undefined ||
    productData.isSpotlight ||
    productData.isFeatured ||
    specsList.some((row) => row.key.trim() || row.value.trim()) ||
    newFeature.trim()
  );
};

const serializeDraft = (draft: ProductFormDraft) => {
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

const reconcileSpecs = (
  productData: Partial<Product>,
  specsList: SpecRow[]
): SpecRow[] => {
  if (
    specsList.length === 0 &&
    Object.keys(productData.specifications || {}).length > 0
  ) {
    return Object.entries(productData.specifications || {}).map(
      ([key, value]) => ({
        id: uuidv4(),
        key,
        value,
      })
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const [productData, setProductData] = useState<Partial<Product>>(() =>
    defaultProductData()
  );

  const [specsList, setSpecsList] = useState<SpecRow[]>([]);
  const [newFeature, setNewFeature] = useState("");

  const currentDraft = useMemo<ProductFormDraft>(
    () => ({
      productData,
      specsList,
      newFeature,
    }),
    [productData, specsList, newFeature]
  );

  const { hasDraft, draftSavedAt, persistDraft, clearDraft } = useFormDraft<ProductFormDraft>({
    storageKey: draftKey,
    currentData: currentDraft,
    isMeaningful: isDraftMeaningful,
    serialize: serializeDraft,
    deserialize: (text) => JSON.parse(text),
    isLoading,
    onRestore: (parsed) => {
      const restoredProductData = {
        ...defaultProductData(),
        ...parsed.productData,
      };
      restoredProductData.images = parsed.productData?.images || [];
      restoredProductData.features = parsed.productData?.features || [];
      restoredProductData.specifications = parsed.productData?.specifications || {};
      setProductData(restoredProductData);
      setSpecsList(reconcileSpecs(restoredProductData, parsed.specsList || []));
      setNewFeature(parsed.newFeature || "");
    },
  });

  const { isUploading, uploadFiles, handleFileChangeEvent: handleImageUpload } = useImageUpload({
    maxImages: 5,
    currentImagesCount: productData.images?.length || 0,
    onSuccess: (uploadedUrls) => {
      setProductData((prev: Partial<Product>) => {
        const currentImages = prev.images || [];
        const newImages = [...currentImages, ...uploadedUrls];
        return {
          ...prev,
          image: prev.image || uploadedUrls[0],
          images: newImages,
        };
      });
    },
  });

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
            const label = product.name || id;
            setLabel(`/admin/products/${id}`, label);

            if (product.specifications) {
              setSpecsList(
                Object.entries(product.specifications).map(([key, value]) => ({
                  id: uuidv4(),
                  key,
                  value,
                }))
              );
            }
          }
        }
      } catch (err) {
        addNotification(
          "Error",
          getErrorMessage(err, "Failed to load product data"),
          "error"
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    return () => {
      if (id) {
        clearLabel(`/admin/products/${id}`);
      }
    };
  }, [id, isEdit, addNotification, setLabel, clearLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!productData.name?.trim()) {
      newErrors.name = "Product name is required";
    }
    if ((productData.price ?? 0) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (productData.costPrice === undefined || productData.costPrice === null) {
      newErrors.costPrice = "Cost Price is required";
    } else if (productData.costPrice < 0) {
      newErrors.costPrice = "Cost Price cannot be negative";
    }
    if (!productData.category) {
      newErrors.category = "Please select a category";
    }
    if (!productData.description?.trim()) {
      newErrors.description = "Product description is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addNotification(
        "Validation Error",
        "Please check the highlighted fields on the form",
        "error"
      );

      // Smoothly scroll to the first element with an error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Delay focusing to allow the scroll to center smoothly
        setTimeout(() => element.focus(), 400);
      }
      return;
    }

    try {
      setIsSaving(true);

      const specifications = specsList.reduce(
        (acc, { key, value }) => {
          if (key.trim()) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        },
        {} as Record<string, string>
      );

      const finalData = {
        ...productData,
        specifications,
        images: productData.images || [],
        features: productData.features || [],
      };

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
      "success"
    );
  };

  const removeImage = (url: string) => {
    setProductData((prev: Partial<Product>) => {
      const newImages = (prev.images || []).filter((img) => img !== url);
      return {
        ...prev,
        images: newImages,
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
    newValue: string
  ) => {
    setSpecsList((prev) => {
      return prev.map((s) => (s.id === id ? { ...s, [field]: newValue } : s));
    });
  };

  const updateProductData = (updates: Partial<Product>) => {
    setProductData((prev) => ({ ...prev, ...updates }));
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
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      {/* Sticky Header Action Bar */}
      <div className="sticky top-20 bg-slate-950/80 backdrop-blur-md z-20 py-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
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
              {isEdit ? "Update your product listing details" : "Fill in the details to create a product listing"}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="text-slate-400 hover:text-white"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button
            type="button"
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
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
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Sticky Table of Contents (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-2 sticky top-36 space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">Sections</p>
          <a href="#general" className="block px-3 py-2 text-sm text-slate-400 hover:text-brand-secondary-400 hover:bg-white/5 rounded-md transition-colors">General Info</a>
          <a href="#media" className="block px-3 py-2 text-sm text-slate-400 hover:text-brand-secondary-400 hover:bg-white/5 rounded-md transition-colors">Media & Images</a>
          <a href="#features" className="block px-3 py-2 text-sm text-slate-400 hover:text-brand-secondary-400 hover:bg-white/5 rounded-md transition-colors">Features List</a>
          <a href="#specs" className="block px-3 py-2 text-sm text-slate-400 hover:text-brand-secondary-400 hover:bg-white/5 rounded-md transition-colors">Specifications</a>
          <a href="#seo" className="block px-3 py-2 text-sm text-slate-400 hover:text-brand-secondary-400 hover:bg-white/5 rounded-md transition-colors">Search Engine</a>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-7 space-y-8">
          <div id="general" className="scroll-mt-36">
          <ProductIdentityCard
            productData={productData}
            onUpdateProductData={updateProductData}
            errors={errors}
          />
          </div>

          <div id="media" className="scroll-mt-36">
          <ProductMediaCard
            images={productData.images || []}
            primaryImage={productData.image || ""}
            isUploading={isUploading}
            onUpload={handleImageUpload}
            onUploadFiles={uploadFiles}
            onRemove={removeImage}
            onSetPrimary={setMainImage}
            onReorder={(newImages) => updateProductData({ images: newImages })}
          />
          </div>

          <div id="features" className="scroll-mt-36">
          <ProductFeaturesCard
            features={productData.features || []}
            newFeature={newFeature}
            onNewFeatureChange={setNewFeature}
            onAddFeature={addFeature}
            onRemoveFeature={removeFeature}
          />
          </div>

          <div id="specs" className="scroll-mt-36">
          <ProductSpecsCard
            specsList={specsList}
            onAddSpecRow={addSpecRow}
            onRemoveSpecRow={removeSpecRow}
            onUpdateSpecRow={updateSpecRow}
          />
          </div>



          <div id="seo" className="scroll-mt-36">
            <ProductSEOCard
              productData={productData}
              onUpdateProductData={updateProductData}
            />
          </div>

          {/* Desktop Secondary Action Bar */}
          <div className="hidden md:flex items-center gap-3 pt-6 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => router.push("/admin/products")}
            >
              Cancel
            </Button>
            <Button
              type="button"
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

        {/* Sidebar Area */}
        <div className="lg:col-span-3">
          <ProductSidebarMeta
            productData={productData}
            categories={categories}
            onUpdateProductData={updateProductData}
            errors={errors}
            onCategoryAdded={(cat) => setCategories((prev) => [...prev, cat])}
          />
        </div>
      </form>

      {/* Mobile Sticky Bottom Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-white/10 p-4 flex items-center justify-between gap-4 md:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        <Button
          type="button"
          variant="ghost"
          className="text-slate-400 hover:text-white w-1/3"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white w-2/3"
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
  );
}
