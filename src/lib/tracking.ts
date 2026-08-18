declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.fbq) {
    if (data) {
      window.fbq("track", eventName, data);
    } else {
      window.fbq("track", eventName);
    }
  }
};

export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  currency?: string;
}) => {
  trackEvent("AddToCart", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: product.currency || "GHS",
  });
};

export const trackInitiateCheckout = (cartTotal: number) => {
  trackEvent("InitiateCheckout", {
    value: cartTotal,
    currency: "GHS",
  });
};

export const trackPurchase = (order: {
  id: string;
  total: number;
  currency?: string;
}) => {
  trackEvent("Purchase", {
    content_ids: [order.id],
    value: order.total,
    currency: order.currency || "GHS",
  });
};
