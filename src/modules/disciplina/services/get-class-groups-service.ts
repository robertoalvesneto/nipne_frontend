import { api } from "@/shared/services/api";
import type { PaginatedResponse } from "@/shared/types/paginated-response-type";
import type { DisciplinaOferta } from "../interfaces/disciplina-oferta";

export interface ClassGroupsListQueryApiDto {
  page?: number;
  pageSize?: number;
  disciplinaId?: string;
  cursoId?: string;
  periodoLetivoId?: string;
  professorId?: string;
  nome?: string;
  sigla?: string;
  ativo?: boolean;
  sortBy?: "nome" | "sigla" | "disciplina" | "periodoLetivo" | "createdAt";
  sortDirection?: "asc" | "desc";
}

export type ClassGroupsListResponseApiDto =
  PaginatedResponse<DisciplinaOferta>;

export const getClassGroupsApi = async (
  query: ClassGroupsListQueryApiDto = {},
) => {
  const response = await api.get<ClassGroupsListResponseApiDto>(
    "/api/v1/class-groups",
    {
      params: {
        page: 1,
        pageSize: 10,
        sortBy: "createdAt",
        sortDirection: "desc",
        ...query,
      },
    },
  );

  return response.data;
};
