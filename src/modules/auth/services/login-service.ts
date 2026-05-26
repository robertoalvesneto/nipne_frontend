import { api } from "@/shared/services/api";
import { LoginRequestAppDto, LoginResponseAppDto } from "../dtos/login-app-dto"

export type LoginRequestApiDto = LoginRequestAppDto;
export type LoginResponseApiDto = LoginResponseAppDto;

export const loginApi = async (data: LoginRequestApiDto) => {
  return new Promise<LoginResponseApiDto>((resolve) => {
    resolve({ 
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ODg3YjEwN2E4YjQzMDAxODg0ZDEiLCJlbWFpbCI6ImVtYWlsQGV4YW1wbGUuY29tIiwiaWF0IjoxNjkyODk5MDQyLCJleHAiOjE2OTI5ODU0NDJ9.7n8sHqLhXoK8mLh7l3a9eXG8vWlHqj8b1nPz5sK7A",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ODg3YjEwN2E4YjQzMDAxODg0ZDEiLCJlbWFpbCI6ImVtYWlsQGV4YW1wbGUuY29tIiwiaWF0IjoxNjkyODk5MDQyLCJleHAiOjE2OTM0ODkwNDJ9.7n8sHqLhXoK8mLh7l3a9eXG8vWlHqj8b1nPz5sK7A"
    });
  });
  
  const response = await api.post<LoginResponseApiDto>("/auth/login", data);
  return response.data;
};
