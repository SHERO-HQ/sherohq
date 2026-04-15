type TrustpilotReview = {
  externalId: string;
  quote: string;
  author: string;
  image: string | null;
  rating: number | null;
  reviewUrl: string | null;
  publishedAt: string | null;
};

function normalizeTrustpilotBaseUrl(value: string | undefined): string {
  const raw = (value || "https://api.trustpilot.com").trim();
  return raw.replace(/\/$/, "");
}

function clampLimit(value: unknown): number {
  const parsed = Number.parseInt(String(value ?? "20"), 10);
  if (!Number.isFinite(parsed)) return 20;
  return Math.max(1, Math.min(parsed, 100));
}

function coerceString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function coerceNumber(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function extractReviews(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object") return [];

  const obj = payload as Record<string, unknown>;
  const candidates = [
    obj.reviews,
    obj.data,
    (obj.businessUnit as Record<string, unknown> | undefined)?.reviews,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === "object",
      );
    }
  }

  return [];
}

function mapReview(item: Record<string, unknown>): TrustpilotReview | null {
  const consumer =
    (item.consumer as Record<string, unknown> | undefined) || undefined;
  const links =
    (item.links as Record<string, unknown> | undefined) || undefined;
  const dates =
    (item.dates as Record<string, unknown> | undefined) || undefined;

  const externalId =
    coerceString(item.id) ||
    coerceString(item.reviewId) ||
    coerceString(item.uuid);
  const quote =
    coerceString(item.text) ||
    coerceString(item.content) ||
    coerceString(item.title) ||
    "";

  if (!externalId || !quote) {
    return null;
  }

  const author =
    coerceString(consumer?.displayName) ||
    coerceString(consumer?.name) ||
    "Trustpilot Reviewer";

  const rating =
    coerceNumber(item.stars) ||
    coerceNumber(item.rating) ||
    coerceNumber(item.score);

  return {
    externalId,
    quote,
    author,
    image:
      coerceString(consumer?.imageUrl) ||
      coerceString(consumer?.avatarUrl) ||
      null,
    rating,
    reviewUrl:
      coerceString(links?.review) ||
      coerceString(item.url) ||
      coerceString(item.link),
    publishedAt:
      coerceString(item.createdAt) ||
      coerceString(item.created_at) ||
      coerceString(dates?.publishedAt),
  };
}

export async function fetchTrustpilotReviews(
  limitInput: unknown,
): Promise<TrustpilotReview[]> {
  const apiKey = process.env.TRUSTPILOT_API_KEY;
  const businessUnitId = process.env.TRUSTPILOT_BUSINESS_UNIT_ID;

  if (!apiKey || !businessUnitId) {
    throw new Error(
      "Missing TRUSTPILOT_API_KEY or TRUSTPILOT_BUSINESS_UNIT_ID environment variables",
    );
  }

  const limit = clampLimit(limitInput);
  const baseUrl = normalizeTrustpilotBaseUrl(process.env.TRUSTPILOT_API_BASE);
  const endpoint = `${baseUrl}/v1/business-units/${businessUnitId}/reviews?perPage=${limit}`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Trustpilot API request failed (${response.status}): ${body.substring(0, 300)}`,
    );
  }

  const payload = (await response.json()) as unknown;
  const rawReviews = extractReviews(payload);

  return rawReviews
    .map(mapReview)
    .filter((review): review is TrustpilotReview => review !== null);
}
