/**
 * Resolves the public API base URL for server and client components.
 */
export function getApiBaseUrl(): string {
  const serverOnly = process.env.API_URL;
  if (serverOnly) {
    return serverOnly.replace(/\/$/, "");
  }
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicUrl) {
    return publicUrl.replace(/\/$/, "");
  }
  return "http://localhost:3001";
}
