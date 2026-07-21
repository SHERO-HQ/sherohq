export function getRetryOrderId(
  searchParams: { get: (key: string) => string | null } | null | undefined,
) {
  if (!searchParams) return null;

  const retryValue = searchParams.get("retry")?.trim();
  return retryValue ? retryValue : null;
}
