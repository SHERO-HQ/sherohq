"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Plus, Loader2, Info, RotateCcw, Link2 } from "lucide-react";
import AppImage from "@/components/common/AppImage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GuideMediaCardProps {
  coverImage: string;
  onCoverImageChange: (val: string) => void;
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadFiles?: (files: File[]) => void;
  onRemove: () => void;
}

export default function GuideMediaCard({
  coverImage,
  onCoverImageChange,
  isUploading,
  onUpload,
  onUploadFiles,
  onRemove,
}: GuideMediaCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0 && onUploadFiles) {
      onUploadFiles(files);
    }
  };

  const initiateDelete = () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setSecondsLeft(3);

    const tick = (timeLeft: number) => {
      if (timeLeft === 0) {
        onRemove();
        cancelDelete();
      } else {
        setSecondsLeft(timeLeft);
        timerRef.current = setTimeout(() => tick(timeLeft - 1), 1000);
      }
    };

    timerRef.current = setTimeout(() => tick(2), 1000);
  };

  const cancelDelete = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsDeleting(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
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
        <div className="absolute inset-0 bg-brand-secondary-950/20 backdrop-blur-xs flex flex-col items-center justify-center z-35 pointer-events-none rounded animate-in fade-in duration-200">
          <ImageIcon className="w-12 h-12 text-brand-secondary-400 animate-bounce mb-2" />
          <p className="text-sm font-bold text-brand-secondary-300">
            Drop your banner image here
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Releasing files will automatically compress and queue upload
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-brand-secondary-400" />
          <h3 className="font-bold text-white">Cover Banner Image</h3>
        </div>
      </div>

      <div className="space-y-6">
        {coverImage ? (
          <div
            className={cn(
              "relative aspect-video w-full rounded bg-slate-800 border-2 overflow-hidden shadow transition-all duration-300",
              isDeleting ? "opacity-90 grayscale-[30%] scale-95 border-rose-500/40" : "border-white/5"
            )}
          >
            <AppImage
              src={coverImage}
              alt="Guide Cover Banner"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />

            {/* Soft Delete Countdown Overlay */}
            {isDeleting ? (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-2 text-center animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-widest animate-pulse">
                  Deleting in {secondsLeft}s
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancelDelete}
                  className="mt-2 h-7 px-3 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Undo
                </Button>
              </div>
            ) : (
              /* Trash Bin Trigger button */
              <div className="absolute top-2 right-2 z-10">
                <button
                  type="button"
                  onClick={initiateDelete}
                  className="p-1.5 bg-rose-500/90 text-white rounded shadow hover:bg-rose-600 transition-colors"
                  title="Remove Banner"
                >
                  <svg className="w-4 h-4 stroke-2 stroke-current fill-none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : isUploading ? (
          <div className="aspect-video w-full rounded bg-slate-800/40 border border-brand-secondary-500/20 overflow-hidden relative shadow animate-pulse flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-brand-secondary-400 animate-spin" />
            <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">
              COMPRESSING & UPLOADING...
            </span>
          </div>
        ) : (
          <label
            className={cn(
              "aspect-video rounded w-full border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300",
              "border-white/10 hover:border-brand-secondary-500/50 hover:bg-brand-secondary-500/5 hover:scale-[0.98]"
            )}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUpload}
            />
            <Plus className="w-6 h-6 text-slate-500 transition-colors" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Upload Banner Image
            </span>
            <span className="text-[10px] text-slate-600 tracking-wider">
              or drag & drop here
            </span>
          </label>
        )}

        {/* Parity: Paste an external URL */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <label
            htmlFor="coverImageUrl"
            className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5 text-slate-500" />
            Or provide a direct image URL
          </label>
          <Input
            id="coverImageUrl"
            type="url"
            value={coverImage}
            onChange={(e) => onCoverImageChange(e.target.value)}
            placeholder="https://example.com/banner-image.jpg"
            className="bg-slate-800/50 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-brand-secondary-500 text-xs h-9"
          />
        </div>

        <div className="p-4 rounded bg-slate-800/30 border border-white/5">
          <p className="text-xs text-slate-500 flex items-center gap-2 italic">
            <Info className="w-3.5 h-3.5 shrink-0 text-brand-secondary-400" />
            Provides a beautiful, high-quality banner for guide headers. Drag images to upload, or paste a URL.
          </p>
        </div>
      </div>
    </Card>
  );
}
