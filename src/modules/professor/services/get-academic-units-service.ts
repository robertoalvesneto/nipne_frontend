import { api } from "@/shared/services/api";
import type { PaginatedResponse } from "@/shared/types/paginated-response-type";
import type { AcademicUnit, CategoriaUnidadeAcademica } from "../interfaces/academic-unit";

export interface AcademicUnitsListQueryApiDto {
  page?: number;
  pageSize?: number;
  nome?: string;
  sigla?: string;
  categoria?: CategoriaUnidadeAcademica;
  ativo?: boolean;
  sortBy?: "nome" | "sigla" | "categoria" | "createdAt";
  sortDirection?: "asc" | "desc";
}

export type AcademicUnitsListResponseApiDto = PaginatedResponse<AcademicUnit>;

export const getAcademicUnitsApi = async (
  query: AcademicUnitsListQueryApiDto = {},
) => {
  const response = await api.get<AcademicUnitsListResponseApiDto>(
    "/api/v1/academic-units",
    {
      params: {
        page: 1,
        pageSize: 100,
        ativo: true,
        sortBy: "nome",
        sortDirection: "asc",
        ...query,
      },
    },
  );

  return response.data;
};
