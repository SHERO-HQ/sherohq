import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  createProduct,
  updateProduct,
  fetchProduct,
  fetchCategories,
  uploadImages,
  type ProductInput,
} from "@/services/api";
import { useTitle } from "@/hooks/useTitle";
import {
  Package,
  Loader2,
  ArrowLeft,
  Save,
  Upload,
  Trash2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  useTitle(isEditing ? "Edit Product" : "Add Product");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    category: "",
    price: 0,
    originalPrice: null,
    image: "",
    images: [],
    rating: 0,
    reviews: 0,
    badge: null,
    inStock: true,
    stockQuantity: 100,
    description: "",
    features: [],
    specifications: {},
  });

  const [featuresText, setFeaturesText] = useState("");
  const [specsText, setSpecsText] = useState("");

  useEffect(() => {
    loadCategories();
    if (isEditing && id) {
      loadProduct(id);
    }
  }, [id, isEditing]);

  async function loadCategories() {
    try {
      const data = await fetchCategories();
      setCategories(data.filter((c) => c.id !== "all"));
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }

  async function loadProduct(productId: string) {
    try {
      setIsLoading(true);
      const product = await fetchProduct(productId);

      const imagesList =
        product.images && product.images.length > 0
          ? product.images
          : product.image
            ? [product.image]
            : [];

      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice || null,
        image: product.image || "",
        images: imagesList,
        rating: product.rating,
        reviews: product.reviews,
        badge: product.badge || null,
        inStock: product.inStock,
        stockQuantity:
          (product as ProductInput & { stockQuantity?: number })
            .stockQuantity ?? 0,
        description: product.description || "",
        features: product.features || [],
        specifications: product.specifications || {},
      });

      const previews = imagesList.map((img) =>
        img.startsWith("/uploads") ? `http://localhost:5000${img}` : img,
      );
      setImagePreviews(previews);

      setFeaturesText((product.features || []).join("\n"));
      setSpecsText(
        Object.entries(product.specifications || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n"),
      );
    } catch (err) {
      setError("Failed to load product");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageUpload(files: FileList | File[]) {
    try {
      setIsUploading(true);
      setError("");

      const fileArray = Array.from(files);
      const currentImagesCount = (formData.images || []).length;

      if (currentImagesCount + fileArray.length > 5) {
        throw new Error("Maximum 5 images allowed per product");
      }

      const validFiles = fileArray.filter((file) =>
        file.type.startsWith("image/"),
      );

      if (validFiles.length === 0) {
        throw new Error("No valid image files selected");
      }

      // Temporary local previews
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);

      const result = await uploadImages(validFiles);

      const updatedImages = [...(formData.images || []), ...result.imageUrls];

      setFormData((prev) => ({
        ...prev,
        image: updatedImages[0] || "",
        images: updatedImages,
      }));

      // Update previews with server URLs
      const serverPreviews = result.imageUrls.map(
        (url) => `http://localhost:5000${url}`,
      );
      setImagePreviews((prev) => {
        const existingCount = prev.length - newPreviews.length;
        return [...prev.slice(0, existingCount), ...serverPreviews];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload images");
      // Ideally remove the temporary previews here if failed
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function removeImage(index: number) {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);

    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);

    setFormData({
      ...formData,
      image: newImages.length > 0 ? newImages[0] : "",
      images: newImages,
    });
    setImagePreviews(newPreviews);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const features = featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const specifications: Record<string, string> = {};
      specsText.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length) {
          specifications[key.trim()] = valueParts.join(":").trim();
        }
      });

      const data: ProductInput = {
        ...formData,
        features,
        specifications,
      };

      if (isEditing && id) {
        await updateProduct(id, data);
      } else {
        await createProduct(data);
      }

      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/admin/products"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded bg-gradient-to-br from-purple-500 to-blue-600">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEditing ? "Edit Product" : "Add Product"}
              </h1>
              <p className="text-slate-400">
                {isEditing ? "Update product details" : "Create a new product"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400">
              {error}
            </div>
          )}

          <div className="bg-slate-900/50 border border-slate-800 rounded p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Product Images (Max 5)
              </label>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {imagePreviews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded overflow-hidden border border-slate-700 group bg-slate-800"
                  >
                    <img
                      src={preview}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded shadow-sm">
                        Main
                      </div>
                    )}
                  </div>
                ))}

                {imagePreviews.length < 5 && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && fileInputRef.current?.click()
                    }
                    className={`relative aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isUploading
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-slate-700 hover:border-purple-500 hover:bg-slate-800/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-500 mb-2" />
                        <span className="text-xs text-slate-400">
                          Add Image
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Upload up to 5 images. The first image will be used as the main
                thumbnail. Supports Drag & Drop.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Price *
                </label>
                <input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label
                  htmlFor="originalPrice"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Original Price
                </label>
                <input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      originalPrice: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Stock Quantity
                </label>
                <input
                  id="stock"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockQuantity: Number(e.target.value),
                      inStock: Number(e.target.value) > 0,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="badge"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Badge
              </label>
              <input
                id="badge"
                type="text"
                value={formData.badge || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    badge: e.target.value || null,
                  })
                }
                placeholder="e.g., Best Seller, New"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div>
              <label
                htmlFor="features"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Features (one per line)
              </label>
              <textarea
                id="features"
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                rows={4}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="specs"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Specifications (Key: Value, one per line)
              </label>
              <textarea
                id="specs"
                value={specsText}
                onChange={(e) => setSpecsText(e.target.value)}
                rows={4}
                placeholder="Processor: Apple M3&#10;Memory: 16GB&#10;Storage: 512GB"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              to="/admin/products"
              className="px-6 py-3 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? "Update Product" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
