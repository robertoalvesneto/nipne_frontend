import { api } from "@/shared/services/api";
import type { PaginatedResponse } from "@/shared/types/paginated-response-type";
import type { Escuta, StatusEscuta } from "../interfaces/escuta";

export interface EscutasListQueryApiDto {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: StatusEscuta;
  estudanteId?: string;
  unidadeAcademicaId?: string;
  nome?: string;
}

export type EscutasListResponseApiDto = PaginatedResponse<Escuta>;

export const getEscutasApi = async (query: EscutasListQueryApiDto = {}) => {
  const response = await api.get<EscutasListResponseApiDto>("/api/v1/escutas", {
    params: {
      page: 1,
      pageSize: 10,
      ...query,
    },
  });

  return response.data;
};
