2026-08-02 17:22:02.606 [warn] 🐢 [DB Slow Query] 1009ms (Attempt 1): INSERT INTO activity_logs (id, "adminId", action, type, details) VALUES ($1, $2, $3, $4, $5)...
2026-08-02 17:22:06.612 [error] Redis rate limit error, falling back to memory: [TypeError: fetch failed] {
  [cause]: Error: getaddrinfo ENOTFOUND adjusted-liger-93489.upstash.io
      at ignore-listed frames {
    errno: -3008,
    code: 'ENOTFOUND',
    syscall: 'getaddrinfo',
    hostname: 'adjusted-liger-93489.upstash.io'
  }
}
2026-08-02 17:22:06.688 [info] [payment:initialize] {
  provider: 'hubtel',
  orderId: '3c85cf57-f586-4479-905b-48eca9d6e020',
  callbackUrl: 'https://shop.sherohq.com/api/payments/webhook',
  returnUrl: 'https://shop.sherohq.com/shop/checkout/success?orderId=3C85CF57',
  amount: 15
}

2026-08-02 17:23:44.592 [info] [Proxy] Detected subdomain: "shop" for host: "shop.sherohq.com" (path: "/track/3C85CF57")
2026-08-02 17:23:44.592 [info] [Proxy] Rewriting shop subdomain path to: /shop/track/3C85CF57

2026-08-02 17:22:52.684 [info] [payment:webhook] {
  event: 'order_confirmed',
  provider: 'hubtel',
  orderId: '3c85cf57-f586-4479-905b-48eca9d6e020',
  newStatus: 'processing'
}
2026-08-02 17:22:51.743 [info] [payment:webhook] incoming { contentLength: 442, contentType: 'application/json' }
2026-08-02 17:22:51.743 [info] [payment:webhook] {
  provider: 'hubtel',
  clientReference: '3C85CF57',
  rawStatus: 'Success',
  normalizedStatus: 'Success',
  checkoutId: '043be6ec14234bdf93587aac358af6ce',
  salesInvoiceId: '7fb08a5136fe462aba812a2b2fb49486',
  amount: 15.5,
  customerPhone: '233548711582',
  paymentType: 'mobilemoney',
  channel: 'mtn-gh',
  topLevelResponseCode: '0000'
}
2026-08-02 17:22:51.961 [warn] Hubtel status check failed: HTTP 403 for ref 3C85CF57. This may indicate missing API permissions for api-txnstatus.hubtel.com. Relying on webhook tokens.