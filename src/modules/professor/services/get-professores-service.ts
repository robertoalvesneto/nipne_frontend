import { api } from "@/shared/services/api";
import type { PaginatedResponse } from "@/shared/types/paginated-response-type";
import type { Professor } from "../interfaces/professor";

export interface ProfessoresListQueryApiDto {
  page?: number;
  pageSize?: number;
  search?: string;
  nome?: string;
  nomeSocial?: string;
  emailInstitucional?: string;
  matricula?: string;
  unidadeAcademicaId?: string;
  ativo?: boolean;
  sortBy?: "nome" | "nomeSocial" | "emailInstitucional" | "matricula" | "createdAt";
  sortDirection?: "asc" | "desc";
}

export type ProfessoresListResponseApiDto = PaginatedResponse<Professor>;

export const getProfessoresApi = async (
  query: ProfessoresListQueryApiDto = {},
) => {
  const response = await api.get<ProfessoresListResponseApiDto>(
    "/api/v1/professors",
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
