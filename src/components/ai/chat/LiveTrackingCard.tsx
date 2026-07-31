import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Ticket } from "lucide-react";

interface TrackingData {
  id?: string;
  ticket_no?: string;
  status: string;
}

export const LiveTrackingCard = ({
  id,
  type,
}: {
  id: string;
  type: "order" | "ticket";
}) => {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url =
          type === "order"
            ? `/api/orders/track/${id}`
            : `/api/tickets/track/${id}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Tracking Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

  if (loading)
    return (
      <div className="mt-3 w-full p-3 bg-slate-50 border border-slate-200 rounded animate-pulse h-20" />
    );

  if (!data)
    return (
      <div className="mt-3 w-full p-3 bg-red-50 border border-red-100 rounded">
        <p className="text-[10px] font-bold text-red-600 uppercase">
          Tracking Failed
        </p>
        <p className="text-xs text-red-500">
          Could not find {type} #{id}
        </p>
      </div>
    );

  return (
    <div
      className={`mt-3 w-full p-3 ${type === "order" ? "bg-brand-secondary-50 border-brand-secondary-100" : "bg-blue-50 border-blue-100"} border rounded`}
    >
      <div className="flex items-center gap-3 mb-2">
        {type === "order" ? (
          <Package size={16} className="text-brand-secondary-600" />
        ) : (
          <Ticket size={16} className="text-blue-600" />
        )}
        <span
          className={`text-[10px] font-bold ${type === "order" ? "text-brand-secondary-600" : "text-blue-600"} uppercase`}
        >
          Live {type} Status
        </span>
      </div>
      <div
        className={`flex justify-between items-center bg-white p-2 rounded border ${type === "order" ? "border-brand-secondary-100" : "border-blue-100"}`}
      >
        <div>
          <p className="text-[10px] text-slate-500 uppercase">{type} ID</p>
          <p className="text-xs font-bold text-slate-800 tracking-tighter">
            #{data.ticket_no || data.id}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase">Status</p>
          <div
            className={`px-2 py-0.5 ${type === "order" ? "bg-brand-secondary-100 text-brand-secondary-700" : "bg-blue-100 text-blue-700"} rounded-full text-[9px] font-bold uppercase`}
          >
            {data.status}
          </div>
        </div>
      </div>
      {type === "order" && (
        <Link
          href={`/profile/orders`}
          className="mt-2 block text-center text-[10px] font-bold text-brand-secondary-600 hover:underline"
        >
          View Full Details
        </Link>
      )}
    </div>
  );
};
