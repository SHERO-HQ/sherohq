"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Plus, Loader2, Info, RotateCcw } from "lucide-react";
import AppImage from "@/components/common/AppImage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProductMediaCardProps {
  images: string[];
  primaryImage: string;
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadFiles?: (files: File[]) => void;
  onRemove: (url: string) => void;
  onSetPrimary: (url: string) => void;
  onReorder?: (newImages: string[]) => void;
}

export default function ProductMediaCard({
  images,
  primaryImage,
  isUploading,
  onUpload,
  onUploadFiles,
  onRemove,
  onSetPrimary,
  onReorder,
}: ProductMediaCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deletingUrls, setDeletingUrls] = useState<Record<string, number>>({});
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleItemDragStart = (index: number, e: React.DragEvent) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    if (onReorder) {
      const newImages = [...images];
      const draggedImage = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(index, 0, draggedImage);
      onReorder(newImages);
      setDraggedIndex(index);
    }
  };

  const handleItemDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0 && onUploadFiles) {
      onUploadFiles(files);
    }
  };

  const initiateDelete = (url: string) => {
    if (url in deletingUrls) return;

    // Initialize with 3-second countdown
    setDeletingUrls((prev) => ({ ...prev, [url]: 3 }));

    const tick = (secondsLeft: number) => {
      if (secondsLeft === 0) {
        onRemove(url);
        cancelDelete(url);
      } else {
        setDeletingUrls((prev) => ({ ...prev, [url]: secondsLeft }));
        timersRef.current[url] = setTimeout(() => tick(secondsLeft - 1), 1000);
      }
    };

    timersRef.current[url] = setTimeout(() => tick(2), 1000);
  };

  const cancelDelete = (url: string) => {
    if (timersRef.current[url]) {
      clearTimeout(timersRef.current[url]);
      delete timersRef.current[url];
    }
    setDeletingUrls((prev) => {
      const copy = { ...prev };
      delete copy[url];
      return copy;
    });
  };

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <Card
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "bg-slate-900 border p-6 md:p-8 space-y-6 transition-all duration-300 relative select-none",
        isDragging
          ? "border-brand-secondary-500 bg-brand-secondary-500/5 scale-[0.99] shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          : "border-white/5"
      )}
    >
      {/* Drag overlay guide */}
      {isDragging && (
        <div className="absolute inset-0 bg-brand-secondary-950/20 backdrop-blur-xs flex flex-col items-center justify-center z-30 pointer-events-none rounded animate-in fade-in duration-200">
          <ImageIcon className="w-12 h-12 text-brand-secondary-400 animate-bounce mb-2" />
          <p className="text-sm font-bold text-brand-secondary-300">
            Drop your product images here
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Releasing files will automatically compress and queue uploads
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-brand-secondary-400" />
          <h3 className="font-bold text-white">Product Media</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {images.length} / 5 Images
        </span>
      </div>

      <div className="space-y-6">
        {/* Image Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {images.map((url, index) => {
            const isDeleting = url in deletingUrls;
            const secondsLeft = deletingUrls[url];

            return (
              <div
                key={url}
                draggable={!isDeleting}
                onDragStart={(e) => handleItemDragStart(index, e)}
                onDragOver={(e) => handleItemDragOver(e, index)}
                onDrop={handleItemDrop}
                onDragEnd={() => setDraggedIndex(null)}
                className={cn(
                  "relative aspect-square w-full rounded bg-slate-800 border-2 overflow-hidden shadow transition-all duration-300",
                  draggedIndex !== null ? "cursor-grabbing" : "cursor-grab",
                  draggedIndex === index && "opacity-50 scale-95",
                  primaryImage === url
                    ? "border-brand-secondary-500 shadow-brand-secondary-500/10"
                    : "border-white/5",
                  isDeleting && "opacity-90 grayscale-30 scale-95 border-rose-500/40 pointer-events-none"
                )}
              >
                <AppImage
                  src={url}
                  alt="Product"
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />

                {/* Soft Delete Countdown Overlay */}
                {isDeleting ? (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-2 text-center animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-widest animate-pulse">
                      Deleting in {secondsLeft}s
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => cancelDelete(url)}
                      className="mt-2 h-7 px-3 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Undo
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Trash Bin Trigger button */}
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <button
                        type="button"
                        onClick={() => initiateDelete(url)}
                        className="p-1.5 bg-rose-500/90 text-white rounded shadow hover:bg-rose-600 transition-colors"
                        title="Remove Image"
                      >
                        <svg className="w-3.5 h-3.5 stroke-2 stroke-current fill-none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Primary/Thumbnail Selector */}
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-linear-to-t from-black/90 via-black/40 to-transparent z-10">
                      <button
                        type="button"
                        onClick={() => onSetPrimary(url)}
                        className={cn(
                          "w-full py-1.5 px-2 rounded text-[9px] font-semibold tracking-wider transition-all shadow",
                          primaryImage === url
                            ? "bg-brand-secondary-500 text-white cursor-default shadow-brand-secondary-500/25"
                            : "bg-white/20 hover:bg-white/30 text-white"
                        )}
                        disabled={primaryImage === url}
                      >
                        {primaryImage === url ? "PRIMARY DISPLAY" : "SET PRIMARY"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Pending Upload Skeletons */}
          {isUploading && (
            <div className="aspect-square w-full rounded bg-slate-800/40 border border-brand-secondary-500/20 overflow-hidden relative shadow animate-pulse flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-brand-secondary-400 animate-spin" />
              <span className="text-[9px] text-slate-500 font-semibold tracking-widest uppercase">
                COMPRESSING...
              </span>
            </div>
          )}

          {/* Upload Placeholder slot */}
          {images.length < 5 && !isUploading && (
            <label
              className={cn(
                "aspect-square rounded w-full border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300",
                "border-white/10 hover:border-brand-secondary-500/50 hover:bg-brand-secondary-500/5 hover:scale-[0.98]"
              )}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={onUpload}
              />
              <Plus className="w-6 h-6 text-slate-500 group-hover:text-brand-secondary-400 transition-colors" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Upload Image
              </span>
              <span className="text-[8px] text-slate-600 tracking-wider">
                or drag & drop here
              </span>
            </label>
          )}
        </div>

        <div className="p-4 rounded bg-slate-800/30 border border-white/5">
          <p className="text-xs text-slate-500 flex items-center gap-2 italic">
            <Info className="w-3.5 h-3.5 shrink-0 text-brand-secondary-400" />
            First uploaded asset becomes the primary display image. Drag files here to upload. Max 5 images.
          </p>
        </div>
      </div>
    </Card>
  );
}
