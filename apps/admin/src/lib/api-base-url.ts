export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://localhost:3001";
}
