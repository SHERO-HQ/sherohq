# POST /api/payments/webhook

Status: 200

## Request

Started: Aug 01 14:49:37.82 GMT-7

Request ID: t2nj8-1785620977821-e6e78f47cdb8

Path: /api/payments/webhook

Host: shop.sherohq.com

Received in Dublin, Ireland (dub1)

### Firewall

Allowed

### Middleware

200

Execution Duration / Maximum: 9ms / 5m

### External APIs

No outgoing requests

### Fluid

202 MB

Routed to Washington, D.C., USA (iad1)

### Function Invocation

Route: / api / payments / webhook

Execution Duration / Maximum: 1.36s / 5m

### External APIs

**External APIs**

| Method | Request |
| - | - |
| GET | Button: api-txnstatus.hubtel.com/transactions/2039425/status |

### Fluid

248 MB

Response finished in 2s

## Deployment Information

Deployment ID: dpl_J3hmXsQ2BenXs6KMFWbxYVjX3Uhy

Environment: production

Branch: main


2026-08-01 21:49:03.639 [error] Redis rate limit error, falling back to memory: [TypeError: fetch failed] {
  [cause]: Error: getaddrinfo ENOTFOUND adjusted-liger-93489.upstash.io
      at ignore-listed frames {
    errno: -3008,
    code: 'ENOTFOUND',
    syscall: 'getaddrinfo',
    hostname: 'adjusted-liger-93489.upstash.io'
  }
}
2026-08-01 21:49:04.135 [info] [payment:initialize] {
  provider: 'hubtel',
  orderId: 'd54e53bf-8692-4035-a388-761b7f6ad5a4',
  callbackUrl: 'https://shop.sherohq.com/api/payments/webhook',
  returnUrl: 'https://shop.sherohq.com/shop/checkout/success?orderId=#D54E53BF',
  amount: 15
}



# POST /api/payments/initialize

Status: 200

## Request

Started: Aug 01 14:48:58.97 GMT-7

Request ID: 6sgbk-1785620938974-0e62d5577069

Path: /api/payments/initialize

Host: shop.sherohq.com

User Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7.5 Mobile/15E148 Safari/604.1

Referer: https://shop.sherohq.com/shop/checkout

Received in Cape Town, South Africa (cpt1)

### Firewall

Allowed

### Middleware

200

Execution Duration / Maximum: 7ms / 5m

### External APIs

No outgoing requests

### Fluid

202 MB

Routed to Washington, D.C., USA (iad1)

### Function Invocation

Route: / api / payments / initialize

Execution Duration / Maximum: 5.51s / 5m

### External APIs

**External APIs**

| Method | Request |
| - | - |
| POST | Button: adjusted-liger-93489.upstash.io/pipeline |
| POST | Button: adjusted-liger-93489.upstash.io/pipeline |
| POST | Button: adjusted-liger-93489.upstash.io/pipeline |
| POST | Button: adjusted-liger-93489.upstash.io/pipeline |
| POST | Button: adjusted-liger-93489.upstash.io/pipeline |
| POST | Button: adjusted-liger-93489.upstash.io/pipeline |
| POST | Button: payproxyapi.hubtel.com/items/initiate |

### Fluid

214 MB

Response finished in 6s

## Deployment Information

Deployment ID: dpl_J3hmXsQ2BenXs6KMFWbxYVjX3Uhy

Environment: production

Branch: main


# GET /shop/checkout/success

Status: 200

## Request

Started: Aug 01 14:49:48.35 GMT-7

Request ID: 7sq27-1785620988357-9bc44c92e333

Path: /shop/checkout/success

Host: shop.sherohq.com

User Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7.5 Mobile/15E148 Safari/604.1

Search Params

- orderId
- checkoutid=53c3614b14404c4a8226c713e8dfc860

Received in Cape Town, South Africa (cpt1)

### Firewall

Allowed

### Middleware

200

Execution Duration / Maximum: 8ms / 5m

### External APIs

No outgoing requests

### Fluid

203 MB

Routed to Washington, D.C., USA (iad1)

### Function Invocation

Route: / shop / checkout / success

Execution Duration / Maximum: 163ms / 5m

### External APIs

No outgoing requests

### Fluid

240 MB

Response finished in 522ms

## Deployment Information

Deployment ID: dpl_J3hmXsQ2BenXs6KMFWbxYVjX3Uhy

Environment: production

Branch: main

[Proxy] Detected subdomain: "shop" for host: "shop.sherohq.com" (path: "/shop/checkout/success")


⚠️ [DB Retry] Attempt 1 failed: Connection terminated due to connection timeout. Retrying in 1000ms...