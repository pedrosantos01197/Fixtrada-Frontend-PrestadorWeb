// Reads API base URL from Vite env; falls back to proxy path to avoid CORS during dev.
const envBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
export const API_BASE_URL = envBaseUrl?.trim() ? envBaseUrl.trim() : '/api';
