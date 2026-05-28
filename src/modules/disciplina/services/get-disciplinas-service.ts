import { api } from "@/shared/services/api";
import type { PaginatedResponse } from "@/shared/types/paginated-response-type";
import type { Disciplina } from "../interfaces/disciplina";

export interface DisciplinasListQueryApiDto {
  page?: number;
  pageSize?: number;
  cursoId?: string;
  nome?: string;
  cargaHoraria?: number;
  ativo?: boolean;
  sortBy?: "nome" | "cargaHoraria" | "createdAt";
  sortDirection?: "asc" | "desc";
}

export type DisciplinasListResponseApiDto = PaginatedResponse<Disciplina>;

export const getDisciplinasApi = async (
  query: DisciplinasListQueryApiDto = {},
) => {
  const response = await api.get<DisciplinasListResponseApiDto>(
    "/api/v1/disciplines",
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
