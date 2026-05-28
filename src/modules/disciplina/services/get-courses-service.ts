import { api } from "@/shared/services/api";
import type { PaginatedResponse } from "@/shared/types/paginated-response-type";
import type { Course } from "../interfaces/course";

export interface CoursesListQueryApiDto {
  page?: number;
  pageSize?: number;
  unidadeAcademicaId?: string;
  nome?: string;
  sigla?: string;
  ativo?: boolean;
  sortBy?: "nome" | "sigla" | "createdAt";
  sortDirection?: "asc" | "desc";
}

export type CoursesListResponseApiDto = PaginatedResponse<Course>;

export const getCoursesApi = async (query: CoursesListQueryApiDto = {}) => {
  const response = await api.get<CoursesListResponseApiDto>("/api/v1/courses", {
    params: {
      page: 1,
      pageSize: 100,
      ativo: true,
      sortBy: "nome",
      sortDirection: "asc",
      ...query,
    },
  });

  return response.data;
};
