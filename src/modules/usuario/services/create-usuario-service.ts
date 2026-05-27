import { api } from "@/shared/services/api";
import type { PerfilUsuario } from "../types/perfil-usuario";

export interface CreateUsuarioBodyApiDto {
  name: string;
  email: string;
  password: string;
  profile?: PerfilUsuario;
}

export interface CreateUsuarioResponseApiDto {
  id: string;
  name: string;
  email: string;
  password?: string;
  profile?: PerfilUsuario;
  createdAt: string;
  updatedAt: string;
}

export const createUsuarioApi = async (data: CreateUsuarioBodyApiDto) => {
  const response = await api.post<CreateUsuarioResponseApiDto>(
    "/api/v1/users",
    data,
  );

  return response.data;
};
