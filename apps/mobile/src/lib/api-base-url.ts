import Constants from "expo-constants";

export function getApiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  const fromExtra = extra?.apiUrl;
  if (fromExtra) {
    return fromExtra.replace(/\/$/, "");
  }
  return "http://localhost:3001";
}
