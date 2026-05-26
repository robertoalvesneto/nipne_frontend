import axios from "axios";
import { getAccessToken } from "../../modules/auth/services/auth-storage";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
