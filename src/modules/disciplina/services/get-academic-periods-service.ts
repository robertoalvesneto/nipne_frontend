import { api } from "@/shared/services/api";
import type { PaginatedResponse } from "@/shared/types/paginated-response-type";
import type { AcademicPeriod } from "../interfaces/academic-period";

export interface AcademicPeriodsListQueryApiDto {
  page?: number;
  pageSize?: number;
  nome?: string;
  ativo?: boolean;
  sortBy?: "nome" | "dataInicio" | "dataFim" | "createdAt";
  sortDirection?: "asc" | "desc";
}

export type AcademicPeriodsListResponseApiDto =
  PaginatedResponse<AcademicPeriod>;

export const getAcademicPeriodsApi = async (
  query: AcademicPeriodsListQueryApiDto = {},
) => {
  const response = await api.get<AcademicPeriodsListResponseApiDto>(
    "/api/v1/academic-periods",
    {
      params: {
        page: 1,
        pageSize: 100,
        sortBy: "dataInicio",
        sortDirection: "desc",
        ...query,
      },
    },
  );

  return response.data;
};
