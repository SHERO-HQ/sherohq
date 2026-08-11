"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/utils/error";
import {
  fetchProduct,
  fetchCategories,
  type ProductInput,
} from "@/services/api";
import { v4 as uuidv4 } from "uuid";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";

import {
  useUpdateProduct,
  useCreateProduct,
} from "@/hooks/queries/useProducts";
import { useFormDraft } from "@/hooks/useFormDraft";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormValues } from "@/lib/validations/product";

// Import modular form components
import ProductIdentityCard from "@/components/admin/product/ProductIdentityCard";
import ProductMediaCard from "@/components/admin/product/ProductMediaCard";
import ProductSpecsCard from "@/components/admin/product/ProductSpecsCard";
import ProductFeaturesCard from "@/components/admin/product/ProductFeaturesCard";
import ProductSEOCard from "@/components/admin/product/ProductSEOCard";
import ProductSidebarMeta from "@/components/admin/product/ProductSidebarMeta";

interface Category {
  id: string;
  name: string;
}

const PRODUCT_DRAFT_STORAGE_PREFIX = "sherotech:admin:product-form:v2"; // Bumping version for new structure

const getProductDraftKey = (productId: string | undefined) =>
  `${PRODUCT_DRAFT_STORAGE_PREFIX}:${productId || "new"}`;

const defaultValues: Partial<ProductFormValues> = {
  name: "",
  category: "",
  price: 0,
  originalPrice: undefined,
  costPrice: undefined,
  image: "",
  inStock: true,
  description: "",
  features: [],
  specsList: [],
  badge: "",
  images: [],
  stockQuantity: undefined,
  isSpotlight: false,
  isFeatured: false,
};

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const isEdit = Boolean(id);
  const draftKey = getProductDraftKey(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [categories, setCategories] = useState<Category[]>([]);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: defaultValues as ProductFormValues,
    mode: "onChange"
  });

  const { handleSubmit, reset, watch, formState: { isSubmitting, errors }, setValue } = methods;
  const currentDraft = watch();

  const isDraftMeaningful = (draft: Partial<ProductFormValues>) => {
    return Boolean(
      draft.name?.trim() ||
      draft.category?.trim() ||
      (draft.price ?? 0) > 0 ||
      (draft.originalPrice ?? 0) > 0 ||
      draft.image?.trim() ||
      (draft.images?.length ?? 0) > 0 ||
      (draft.features?.length ?? 0) > 0 ||
      (draft.specsList?.length ?? 0) > 0 ||
      draft.description?.trim() ||
      draft.badge?.trim() ||
      draft.stockQuantity !== undefined ||
      draft.isSpotlight ||
      draft.isFeatured
    );
  };

  const { hasDraft, draftSavedAt, persistDraft, clearDraft } = useFormDraft<Partial<ProductFormValues>>({
    storageKey: draftKey,
    currentData: currentDraft,
    isMeaningful: isDraftMeaningful,
    serialize: (data) => JSON.stringify(data),
    deserialize: (text) => JSON.parse(text),
    isLoading,
    onRestore: (parsed) => {
      reset({ ...defaultValues, ...parsed } as ProductFormValues);
    },
  });

  const currentImagesCount = watch("images")?.length || 0;

  const { isUploading, uploadFiles, handleFileChangeEvent: handleImageUpload } = useImageUpload({
    maxImages: 5,
    currentImagesCount,
    onSuccess: (uploadedUrls) => {
      const currentImages = methods.getValues("images") || [];
      const newImages = [...currentImages, ...uploadedUrls];
      setValue("images", newImages, { shouldValidate: true, shouldDirty: true });
      if (!methods.getValues("image")) {
        setValue("image", uploadedUrls[0], { shouldValidate: true, shouldDirty: true });
      }
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
            const specsList = product.specifications 
              ? Object.entries(product.specifications).map(([key, value]) => ({ id: uuidv4(), key, value }))
              : [];
            
            reset({
              ...product,
              category: product.categoryId || product.category || "",
              specsList,
            } as unknown as ProductFormValues);
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
  }, [id, isEdit, addNotification, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const specifications = data.specsList.reduce(
        (acc, { key, value }) => {
          if (key.trim()) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        },
        {} as Record<string, string>
      );

      const finalData = {
        ...data,
        sku: data.sku ?? undefined,
        slug: data.slug ?? undefined,
        image: data.image ?? undefined,
        badge: data.badge ?? undefined,
        metaTitle: data.metaTitle ?? undefined,
        metaDescription: data.metaDescription ?? undefined,
        originalPrice: data.originalPrice ?? undefined,
        stockQuantity: data.stockQuantity ?? undefined,
        specifications,
        images: data.images || [],
        features: data.features || [],
      };

      if (isEdit && id) {
        await updateProductMutation.mutateAsync({ id, data: finalData });
        addNotification("Success", "Product updated successfully", "success");
      } else {
        await createProductMutation.mutateAsync(finalData as unknown as ProductInput);
        addNotification("Success", "Product created successfully", "success");
      }
      clearDraft();
      router.push("/admin/products");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save product";
      addNotification("Error", message, "error");
      console.error(err);
    }
  };

  const onInvalid = () => {
    addNotification("Validation Error", "Please check the highlighted fields on the form", "error");
    // Scroll to first error
    const firstErrorField = Object.keys(errors)[0];
    const element = document.getElementById(firstErrorField);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => element.focus(), 400);
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
        {/* Sticky Header Action Bar */}
        <div className="sticky top-20 bg-card backdrop-blur-md z-20 py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/admin/products")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isEdit ? "Edit Product" : "New Product"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isEdit ? "Update your product listing details" : "Fill in the details to create a product listing"}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/admin/products")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit, onInvalid)}
              disabled={isSubmitting}
              className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground min-w-30"
            >
              {isSubmitting ? (
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
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20">
                  Local draft
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Draft autosave is enabled for this form.
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
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
                className="border-emerald-500/30 text-emerald-600 dark:text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-100"
              >
                Save draft now
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={clearDraft}
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Clear draft
              </Button>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Sticky Table of Contents (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-2 sticky top-36 space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-3">Sections</p>
            <a href="#general" className="block px-3 py-2 text-sm text-muted-foreground hover:text-brand-secondary-400 hover:bg-accent rounded transition-colors">General Info</a>
            <a href="#media" className="block px-3 py-2 text-sm text-muted-foreground hover:text-brand-secondary-400 hover:bg-accent rounded transition-colors">Media & Images</a>
            <a href="#features" className="block px-3 py-2 text-sm text-muted-foreground hover:text-brand-secondary-400 hover:bg-accent rounded transition-colors">Features List</a>
            <a href="#specs" className="block px-3 py-2 text-sm text-muted-foreground hover:text-brand-secondary-400 hover:bg-accent rounded transition-colors">Specifications</a>
            <a href="#seo" className="block px-3 py-2 text-sm text-muted-foreground hover:text-brand-secondary-400 hover:bg-accent rounded transition-colors">Search Engine</a>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-7 space-y-8">
            <div id="general" className="scroll-mt-36">
              <ProductIdentityCard />
            </div>

            <div id="media" className="scroll-mt-36">
              <ProductMediaCard
                isUploading={isUploading}
                onUpload={handleImageUpload}
                onUploadFiles={uploadFiles}
              />
            </div>

            <div id="features" className="scroll-mt-36">
              <ProductFeaturesCard />
            </div>

            <div id="specs" className="scroll-mt-36">
              <ProductSpecsCard />
            </div>

            <div id="seo" className="scroll-mt-36">
              <ProductSEOCard />
            </div>

            {/* Desktop Secondary Action Bar */}
            <div className="hidden md:flex items-center gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => router.push("/admin/products")}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit, onInvalid)}
                disabled={isSubmitting}
                className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground min-w-30"
              >
                {isSubmitting ? (
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
              categories={categories}
              onCategoryAdded={(cat) => setCategories((prev) => [...prev, cat])}
            />
          </div>
        </form>

        {/* Mobile Sticky Bottom Action Dock */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-card backdrop-blur-md border-t border-border p-4 flex items-center justify-between gap-4 md:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground w-1/3"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit, onInvalid)}
            disabled={isSubmitting}
            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground w-2/3"
          >
            {isSubmitting ? (
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
    </FormProvider>
  );
}
