import { api } from "@/shared/services/api";
import type { PaginatedResponse } from "@/shared/types/paginated-response-type";
import type { StudentListItem } from "../interfaces/student";

export interface StudentsListQueryApiDto {
  page?: number;
  pageSize?: number;
  search?: string;
  nome?: string;
  nomeSocial?: string;
  emailInstitucional?: string;
  matricula?: string;
  ativo?: boolean;
  unidadeAcademicaId?: string;
  cursoId?: string;
  sortBy?: "nome" | "nomeSocial" | "emailInstitucional" | "matricula" | "createdAt";
  sortDirection?: "asc" | "desc";
}

export type StudentsListResponseApiDto = PaginatedResponse<StudentListItem>;

export const getStudentsApi = async (
  query: StudentsListQueryApiDto = {},
) => {
  const response = await api.get<StudentsListResponseApiDto>(
    "/api/v1/students",
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
