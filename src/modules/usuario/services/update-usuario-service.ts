import { api } from "@/shared/services/api";
import type { PerfilUsuario } from "../types/perfil-usuario";
import type { Usuario } from "../interfaces/usuario";

export interface UpdateUsuarioBodyApiDto {
  name?: string;
  email?: string;
  password?: string;
  profile?: PerfilUsuario;
  ativo?: boolean;
}

export type UpdateUsuarioResponseApiDto = Usuario;

export const updateUsuarioApi = async (
  id: string,
  data: UpdateUsuarioBodyApiDto,
) => {
  const response = await api.patch<UpdateUsuarioResponseApiDto>(
    `/api/v1/users/${id}`,
    data,
  );

  return response.data;
};
