import { api } from "@/shared/services/api";
import { PaginatedResponse } from "@/shared/types/paginated-response-type";
import { Usuario } from "../interfaces/usuario";
import type { PerfilUsuario } from "../types/perfil-usuario";

export interface UsuariosListQueryApiDto {
  page?: number;
  pageSize?: number;
  profile?: PerfilUsuario;
}

export type UsuariosListResponseApiDto = PaginatedResponse<Usuario>;

export const getUsuariosApi = async (query: UsuariosListQueryApiDto = {}) => {
  const response = await api.get<UsuariosListResponseApiDto>("/api/v1/users", {
    params: {
      page: 1,
      pageSize: 10,
      ...query,
    },
  });

  return response.data;
};
