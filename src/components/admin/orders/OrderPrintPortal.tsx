import { createPortal } from "react-dom";
import { type Order } from "@/services/api";
import { cn } from "@/lib/utils";
import { toReadableOrderId } from "@/utils/orderId";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { COMPANY_EMAILS } from "@/constants/emails";

interface OrderPrintPortalProps {
  order: Order;
  printMode: "invoice" | "receipt80" | "receipt58" | null;
  receiptQrUrl: string;
}

export function OrderPrintPortal({
  order,
  printMode,
  receiptQrUrl,
}: OrderPrintPortalProps) {
  if (!printMode || !order) return null;

  const printOrderId = toReadableOrderId(order.id);

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
              max-width: 21cm;
              margin: 0 auto;
              padding: 2cm;
              font-family: sans-serif;
            }
            
            /* Hide UI elements that shouldn't print */
            button, .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      
      {printMode.startsWith("receipt") ? (
        <div
          className={cn(
            "thermal-print mx-auto",
            printMode === "receipt58" ? "size-58" : "w-[80mm]",
          )}
        >
          <div className="thermal-header">
            <div className="thermal-logo text-brand-secondary-600">SHERO</div>
            <div>Technologies</div>
            <div>{COMPANY_CONTACTS.HQ_LOCATION}</div>
            <div>{COMPANY_CONTACTS.PHONE_DISPLAY}</div>
            <div className="thermal-divider" />
            <div className="text-xl font-bold uppercase my-2">RECEIPT</div>
            <div className="thermal-divider" />
            <div className="thermal-row">
              <span>Order No:</span>
              <span className="font-bold">#{printOrderId}</span>
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
              <span>Status:</span>
              <span className="uppercase font-bold">{order.status}</span>
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
        <div className="print-document">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-brand-secondary-600">
                SHERO
              </h1>
              <p className="text-muted-foreground text-sm">
                Technologies
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase">{printMode}</h2>
              <p className="font-mono text-sm">#{printOrderId}</p>
              <p className="text-muted-foreground text-xs">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100">
            <div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Billed To
              </h3>
              <p className="font-bold">
                {order.shippingInfo.firstName} {order.shippingInfo.lastName}
              </p>
              <p className="text-sm text-slate-600">
                {order.shippingInfo.email}
              </p>
              <p className="text-sm text-slate-600">
                {order.shippingInfo.phone}
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Shipping Address
              </h3>
              <p className="text-sm text-slate-600">
                {order.shippingInfo.address}
              </p>
              <p className="text-sm text-slate-600">
                {order.shippingInfo.city}, {order.shippingInfo.region}
              </p>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="text-left py-3 text-[10px] uppercase text-muted-foreground">
                  Description
                </th>
                <th className="text-center py-3 text-[10px] uppercase text-muted-foreground">
                  Qty
                </th>
                <th className="text-right py-3 text-[10px] uppercase text-muted-foreground">
                  Price
                </th>
                <th className="text-right py-3 text-[10px] uppercase text-muted-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {order.items.map((item) => (
                <tr key={item.id || item.name}>
                  <td className="py-4">
                    <p className="font-bold">{item.name}</p>
                    {item.sku && (
                      <p className="text-[10px] text-muted-foreground font-mono">
                        SKU: {item.sku}
                      </p>
                    )}
                  </td>
                  <td className="text-center py-4">{item.quantity}</td>
                  <td className="text-right py-4">
                    GH₵{item.price.toLocaleString()}
                  </td>
                  <td className="text-right py-4 font-bold">
                    GH₵{(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-8">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>GH₵{order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (0%)</span>
                <span>GH₵0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-100 pt-3 text-brand-secondary-600">
                <span>Total</span>
                <span>GH₵{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {receiptQrUrl && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <img
                src={receiptQrUrl}
                alt="Invoice verification QR"
                className="w-28 h-28 mx-auto"
              />
              <p className="text-[10px] text-muted-foreground mt-2">
                Scan to verify invoice details
              </p>
            </div>
          )}

          <div className="mt-20 pt-8 border-t border-slate-100 text-center">
            <p className="text-muted-foreground text-[10px] uppercase tracking-widest">
              Thank you for your business!
            </p>
            <p className="text-muted-foreground text-[9px] mt-1">
              SHERO Technologies | {COMPANY_CONTACTS.HQ_LOCATION} | {COMPANY_CONTACTS.WEBSITE_DISPLAY}
            </p>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
