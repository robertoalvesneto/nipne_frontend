import { api } from "@/shared/services/api";
import type { JwtPayload } from "../interfaces/jwt-payload";

export interface LoginRequestApiDto {
  email: string;
  password: string;
}

export interface LoginResponseApiDto {
  accessToken: string;
  refreshToken: string;
  payload: JwtPayload;
}

export const loginApi = async (data: LoginRequestApiDto) => {
  const response = await api.post<LoginResponseApiDto>("/api/v1/auth/login", data);
  return response.data;
};
