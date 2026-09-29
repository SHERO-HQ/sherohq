"use client";

import { useState } from "react";
import { ListingPhoto } from "@/components/shop/ListingPhoto";
import { cn } from "@/lib/cn";

// What the design asks the owner to photograph, in order, until photos exist.
const shotLabels = ["front", "keyboard", "side ports", "lid"];

export function Gallery({ photos, model }: { photos: string[]; model: string }) {
  const [current, setCurrent] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <ListingPhoto alt={model} label="Main photo of this exact device" className="h-70 w-full lg:h-130" />
        <div className="hidden grid-cols-4 gap-3 lg:grid">
          {shotLabels.map((label) => (
            <ListingPhoto key={label} alt="" label={label} className="h-27.5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ListingPhoto
        src={photos[current]}
        alt={`${model}, photo ${current + 1} of ${photos.length}`}
        priority
        className="h-70 w-full lg:h-130"
      />
      {photos.length > 1 && (
        <ul className="grid grid-cols-4 gap-3">
          {photos.map((photo, i) => (
            <li key={photo}>
              <button
                type="button"
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={i === current}
                onClick={() => setCurrent(i)}
                className={cn("block w-full rounded-md", i === current && "outline-2 outline-primary")}
              >
                <ListingPhoto src={photo} alt="" className="h-16 w-full lg:h-27.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
