"use client";

import Form from "next/form";
import { buttonClass } from "@/components/ui/Button";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { shopUrl } from "@/lib/site";
import { cn } from "@/lib/cn";

const FORM_ID = "shop-filters";

type Current = {
  categories: string[];
  newBattery: boolean;
  price: string | null;
  sort: string;
};

const priceBands = [
  { value: "", label: "Any price" },
  { value: "under-3000", label: "Under GHS 3,000" },
  { value: "3000-5000", label: "GHS 3,000 – 5,000" },
  { value: "over-5000", label: "Over GHS 5,000" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price", label: "Price, low to high" },
  { value: "battery", label: "Battery health" },
];

function submit() {
  (document.getElementById(FORM_ID) as HTMLFormElement | null)?.requestSubmit();
}

const groupClass = "border-t border-border py-5";
const legendClass = "mb-1 font-mono text-meta font-medium text-ink-secondary";
const optionClass = "flex min-h-6 cursor-pointer items-center gap-2.5 text-body text-ink";
const controlClass = "size-4 shrink-0 accent-primary";

/**
 * Filters apply as soon as they change, and still work as a plain GET form
 * without JavaScript. On phones they fold away behind a Filters button.
 */
export function ShopFilters({
  categories,
  minBattery,
  current,
}: {
  categories: string[];
  minBattery: number;
  current: Current;
}) {
  const [open, setOpen] = useState(false);
  const active = current.categories.length + (current.newBattery ? 1 : 0) + (current.price ? 1 : 0);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={FORM_ID}
        onClick={() => setOpen(!open)}
        className={buttonClass({ variant: "outline", className: "lg:hidden" })}
      >
        {open ? (
          <X aria-hidden="true" size={18} strokeWidth={1.5} />
        ) : (
          <SlidersHorizontal aria-hidden="true" size={18} strokeWidth={1.5} />
        )}
        Filters{active > 0 && <span className="font-mono text-meta text-ink-secondary">({active})</span>}
      </button>

      <Form
        id={FORM_ID}
        action={shopUrl.home}
        replace
        scroll={false}
        onChange={(event) => {
          // The sort select lives outside this element; it submits itself.
          if ((event.target as HTMLElement).closest("form")?.id === FORM_ID) submit();
        }}
        aria-label="Filter devices"
        className={cn("mt-4 lg:mt-0 lg:block", open ? "block" : "hidden")}
      >
        <div className={groupClass}>
<fieldset className="flex flex-col gap-3">
          <legend className={legendClass}>category</legend>
          {categories.map((category) => (
            <label key={category} className={optionClass}>
              <input
                type="checkbox"
                name="category"
                value={category.toLowerCase()}
                defaultChecked={current.categories.includes(category.toLowerCase())}
                className={controlClass}
              />
              {category}
            </label>
          ))}
        </fieldset>
</div>

        <div className={groupClass}>
<fieldset className="flex flex-col gap-3">
          <legend className={legendClass}>battery</legend>
          <label className={optionClass}>
            <input type="checkbox" name="battery" value="new" defaultChecked={current.newBattery} className={controlClass} />
            New battery (100%)
          </label>
          <p className="text-body-sm text-ink-muted">Every device with a battery is at {minBattery}% or more.</p>
        </fieldset>
</div>

        <div className={groupClass}>
<fieldset className="flex flex-col gap-3">
          <legend className={legendClass}>price</legend>
          {priceBands.map((band) => (
            <label key={band.value} className={optionClass}>
              <input
                type="radio"
                name="price"
                value={band.value}
                defaultChecked={(current.price ?? "") === band.value}
                className={controlClass}
              />
              {band.label}
            </label>
          ))}
        </fieldset>
</div>

        <div className="flex gap-3 border-t border-border py-5">
          {/* Needed without JavaScript; with it, filters apply on change. */}
          <button
            type="submit"
            className={buttonClass({ className: "lg:sr-only lg:focus:not-sr-only" })}
          >
            Show results
          </button>
          {active > 0 && (
            <a href={shopUrl.home} className="flex h-9 items-center text-body font-medium text-primary underline underline-offset-3">
              Clear filters
            </a>
          )}
        </div>
      </Form>
    </div>
  );
}

export function SortSelect({ value }: { value: string }) {
  return (
    <label className="flex items-center gap-2.5 text-body-sm text-ink-secondary">
      Sort
      <select
        name="sort"
        form={FORM_ID}
        defaultValue={value}
        onChange={submit}
        className="h-9 rounded-sm border border-border-strong bg-surface-raised px-2.5 text-body-sm text-ink"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
