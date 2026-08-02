import { toReadableOrderId } from "@/utils/orderId";
import { createPortal } from "react-dom";
import { type Order } from "@/services/api";
import { cn } from "@/lib/utils";
import { displayOrderId } from "@/utils/orderId";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { COMPANY_EMAILS } from "@/constants/emails";

interface OrderPrintPortalProps {
  order: Order;
  printMode: "invoice" | "receipt" | "receipt58" | null;
  receiptQrUrl: string;
}

export function OrderPrintPortal({
  order,
  printMode,
  receiptQrUrl,
}: OrderPrintPortalProps) {
  if (!printMode || !order) return null;

  return createPortal(
    <div className="hidden print:block bg-white text-black p-0 m-0 print-area relative z-10">
      <style>
        {`
          @media print {
            @page { 
              margin: 0.5cm; 
              size: portrait; 
            }
            @page thermal {
              size: 80mm auto;
              margin: 0;
            }
            @page thermal58 {
              size: 58mm auto;
              margin: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              min-height: 0 !important;
              height: auto !important;
              overflow: visible !important;
            }
            body > *:not(.print-area) {
              display: none !important;
            }
            .print-area {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              color: black !important;
            }
            
            /* Thermal Printer Specific Overrides */
            .thermal-print {
              width: 100% !important;
              font-family: monospace !important;
              font-size: 11px !important;
              line-height: 1.2 !important;
            }
            .thermal-print.size-58 {
              width: 58mm !important;
              font-size: 10px !important;
            }
            .thermal-header {
              text-align: center;
              margin-bottom: 15px;
            }
            .thermal-logo {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .thermal-divider {
              border-top: 1px dashed black;
              margin: 10px 0;
            }
            .thermal-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .thermal-items th {
              border-bottom: 1px dashed black;
              padding-bottom: 3px;
              text-align: left;
            }
            .thermal-items td {
              padding: 3px 0;
            }
            .thermal-cut {
              text-align: center;
              margin-top: 20px;
              border-top: 1px dashed black;
              padding-top: 10px;
            }
            
            /* Standard A4 Print Overrides */
            .print-document {
              position: relative;
              max-width: 21cm;
              margin: 0 auto;
              padding: 1.5cm 2cm;
              box-sizing: border-box;
            }
            .print-watermark {
              position: fixed;
              top: 60%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 15cm;
              opacity: 0.05;
              pointer-events: none;
              z-index: 0;
            }
            .print-content {
              position: relative;
              z-index: 10;
              display: flex;
              flex-direction: column;
            }
            
            /* Hide UI elements that shouldn't print */
            button, .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      {printMode === "receipt58" ? (
        <div
          className={cn(
            "thermal-print mx-auto",
            printMode === "receipt58" ? "size-58" : "w-[80mm]",
          )}
        >
          <div className="thermal-header">
            <img src="/assets/logo/shero.png" alt="SHERO Logo" className="h-10 w-auto mx-auto mb-2 grayscale contrast-200 mix-blend-multiply" />
            <div className="font-bold mb-1">SHERO TECHNOLOGIES</div>
            <div>{COMPANY_CONTACTS.HQ_LOCATION}</div>
            <div>{COMPANY_CONTACTS.PHONE_DISPLAY}</div>
            <div className="thermal-divider" />
            <div className="text-xl font-bold uppercase my-2">RECEIPT</div>
            <div className="thermal-divider" />
            <div className="thermal-row">
              <span>Order No:</span>
              <span className="font-bold">{displayOrderId(order.id)}</span>
            </div>
            <div className="thermal-row">
              <span>Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="thermal-row">
              <span>Customer:</span>
              <span>
                {order.shippingInfo.firstName} {order.shippingInfo.lastName}
              </span>
            </div>
            <div className="thermal-row">
              <span>Payment:</span>
              <span className="uppercase font-bold">{order.paymentStatus === "failed" ? "FAILED" : (order.paymentStatus === "pending" ? "PENDING" : "PAID")}</span>
            </div>
          </div>

          <table className="w-full thermal-items mt-2">
            <thead>
              <tr>
                <th className="w-3/5">Item</th>
                <th className="w-1/5 text-center">Qty</th>
                <th className="w-1/5 text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id || item.name} className="align-top">
                  <td className="pr-2">
                    <div className="font-bold truncate max-w-[120px]">
                      {item.name}
                    </div>
                    {item.sku && <div className="text-[9px]">SKU:{item.sku}</div>}
                  </td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">
                    {(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="thermal-divider" />

          <div className="text-[9px] space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>GH₵{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>GH₵0.00</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-black/20">
              <span>TOTAL</span>
              <span>GH₵{order.total.toLocaleString()}</span>
            </div>
          </div>

          {receiptQrUrl && (
            <div className="mt-3 text-center">
              <img
                src={receiptQrUrl}
                alt="Receipt verification QR"
                className={cn(
                  "mx-auto",
                  printMode === "receipt58" ? "w-20 h-20" : "w-28 h-28",
                )}
              />
              <p className="text-[8px] mt-1">
                Scan to verify receipt details
              </p>
            </div>
          )}

          <div className="thermal-divider" />

          <div className="text-center text-[8px] leading-4">
            <p>THANK YOU FOR SHOPPING WITH SHERO</p>
            <p>{COMPANY_EMAILS.SUPPORT}</p>
            <p>{COMPANY_CONTACTS.PHONE_DISPLAY}</p>
            <p>{COMPANY_CONTACTS.WEBSITE_DISPLAY}</p>
          </div>

          <div className="thermal-cut">--- CUSTOMER COPY ---</div>
        </div>
      ) : (
        <div className="print-document bg-white">
          <img src="/assets/logo/shero.png" alt="" className="print-watermark" />
          <div className="print-content text-slate-900 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                <img src="/assets/logo/shero.png" alt="SHERO Logo" className="h-10 w-auto mb-4" />
                <p className="text-slate-800 font-bold text-sm tracking-tight">
                  SHERO TECHNOLOGIES
                </p>
                <p className="text-slate-500 text-xs">
                  {COMPANY_CONTACTS.HQ_LOCATION}
                </p>
                <p className="text-slate-500 text-xs">
                  {COMPANY_CONTACTS.PHONE_DISPLAY}
                </p>
                <p className="text-brand-secondary-600 text-xs">
                  {COMPANY_CONTACTS.WEBSITE_DISPLAY}
                </p>
              </div>
              <div className="text-right space-y-1">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-200 mb-2">
                  {printMode}
                </h2>
                <p className="font-mono text-sm text-slate-700 font-medium">Ref: {displayOrderId(order.id)}</p>
                <p className="text-slate-500 text-xs mb-3">
                  Date: {new Date().toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className={cn("inline-block px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest", order.paymentStatus === "failed" ? "bg-red-50 text-red-700 border border-red-100" : order.paymentStatus === "pending" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100")}>
                  {order.paymentStatus === "failed" ? "PAYMENT FAILED" : (order.paymentStatus === "pending" ? "PAYMENT PENDING" : "PAID")}
                </div>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-12 mb-10 p-6 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Billed To
                </h3>
                <p className="font-bold text-sm text-slate-800 mb-1">
                  {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                </p>
                <p className="text-xs text-slate-600 mb-0.5">
                  {order.shippingInfo.email}
                </p>
                <p className="text-xs text-slate-600">
                  {order.shippingInfo.phone}
                </p>
              </div>
              <div>
                <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Shipping Address
                </h3>
                <p className="text-xs text-slate-600 mb-0.5">
                  {order.shippingInfo.address}
                </p>
                <p className="text-xs text-slate-600">
                  {order.shippingInfo.city}, {order.shippingInfo.region}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </th>
                  <th className="text-center py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Qty
                  </th>
                  <th className="text-right py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Unit Price
                  </th>
                  <th className="text-right py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <tr key={item.id || item.name} className="group">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-sm text-slate-800">{item.name}</p>
                      {item.sku && (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          SKU: {item.sku}
                        </p>
                      )}
                    </td>
                    <td className="text-center py-4 text-sm text-slate-600">{item.quantity}</td>
                    <td className="text-right py-4 text-sm text-slate-600 font-mono">
                      GH₵{item.price.toLocaleString()}
                    </td>
                    <td className="text-right py-4 text-sm font-bold text-slate-800 font-mono">
                      GH₵{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Footer */}

            <div className="flex justify-between items-end border-t border-slate-200 pt-6 mt-8">
              {receiptQrUrl ? (
                <div className="text-left">
                  <img
                    src={receiptQrUrl}
                    alt="Invoice verification QR"
                    className="w-20 h-20 mb-2 opacity-80"
                  />
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                    Scan to verify
                  </p>
                </div>
              ) : (
                <div></div>
              )}

              <div className="w-72 space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono">GH₵{order.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tax (0%)</span>
                  <span className="font-mono">GH₵0.00</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t border-slate-200 pt-3 text-brand-secondary-600 mt-2">
                  <span className="uppercase tracking-tight text-sm">Grand Total</span>
                  <span className="text-xl">GH₵{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Legal Footers */}
            <div className="mt-12 pt-6 border-t border-slate-100 text-center space-y-2">
              <p className="text-slate-400 text-[9px] uppercase tracking-widest font-bold">
                Thank you for your business!
              </p>
              <p className="text-slate-400 text-[8px] max-w-xl mx-auto leading-relaxed">
                This document is a computer-generated invoice and requires no signature. Subject to our standard Terms & Conditions of Sale. Returns and exchanges are governed by our return policy available at {COMPANY_CONTACTS.WEBSITE_DISPLAY}/terms. 
              </p>
              <p className="text-slate-500 text-[9px] mt-2 font-medium">
                SHERO TECHNOLOGIES | {COMPANY_CONTACTS.HQ_LOCATION} | {COMPANY_EMAILS.SUPPORT}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
