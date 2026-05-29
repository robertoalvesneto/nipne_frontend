import { api } from "@/shared/services/api";
import type { PaginatedResponse } from "@/shared/types/paginated-response-type";
import type { ClassGroupStudent } from "../interfaces/class-group-student";

export interface ClassGroupStudentsListQueryApiDto {
  page?: number;
  pageSize?: number;
  estudanteId?: string;
  turmaId?: string;
  cursoId?: string;
  periodoLetivoId?: string;
}

export type ClassGroupStudentsListResponseApiDto =
  PaginatedResponse<ClassGroupStudent>;

export const getClassGroupStudentsApi = async (
  query: ClassGroupStudentsListQueryApiDto = {},
) => {
  const response = await api.get<ClassGroupStudentsListResponseApiDto>(
    "/api/v1/class-group-students",
    {
      params: {
        page: 1,
        pageSize: 100,
        ...query,
      },
    },
  );

  return response.data;
};
