"use client";
import { useState, useCallback } from "react";
import { uploadImages } from "@/services/api";
import { compressImage } from "@/utils/image-utils";
import { useNotifications } from "@/hooks/useNotifications";

export interface UseImageUploadOptions {
  maxImages?: number;
  currentImagesCount: number;
  onSuccess: (imageUrls: string[]) => void;
}

export function useImageUpload({
  maxImages = 1,
  currentImagesCount,
  onSuccess,
}: UseImageUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const { addNotification } = useNotifications();

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Check limit if multiple images are allowed
    if (maxImages > 1 && currentImagesCount + files.length > maxImages) {
      addNotification(
        "Error",
        `You can only upload up to ${maxImages} images`,
        "error"
      );
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
        "info"
      );

      // Compress files client-side before sending to api
      const optimizedFiles: File[] = [];
      for (const file of validFiles) {
        const compressed = await compressImage(file);
        optimizedFiles.push(compressed);
      }

      // Use the multiple uploads endpoint uploadImages
      const { imageUrls } = await uploadImages(optimizedFiles);
      if (imageUrls && imageUrls.length > 0) {
        onSuccess(imageUrls);
        addNotification("Success", "Images uploaded successfully", "success");
      }
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
    }
  }, [currentImagesCount, maxImages, onSuccess, addNotification]);

  const handleFileChangeEvent = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
    e.target.value = "";
  }, [uploadFiles]);

  return {
    isUploading,
    uploadFiles,
    handleFileChangeEvent,
  };
}
