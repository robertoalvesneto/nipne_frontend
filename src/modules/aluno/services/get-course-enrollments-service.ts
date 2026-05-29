import { api } from "@/shared/services/api";
import type { PaginatedResponse } from "@/shared/types/paginated-response-type";
import type { CourseEnrollment } from "../interfaces/course-enrollment";
import type { StatusMatriculaCurso } from "../interfaces/student";

export interface CourseEnrollmentsListQueryApiDto {
  page?: number;
  pageSize?: number;
  estudanteId?: string;
  cursoId?: string;
  matricula?: string;
  status?: StatusMatriculaCurso;
}

export type CourseEnrollmentsListResponseApiDto =
  PaginatedResponse<CourseEnrollment>;

export const getCourseEnrollmentsApi = async (
  query: CourseEnrollmentsListQueryApiDto = {},
) => {
  const response = await api.get<CourseEnrollmentsListResponseApiDto>(
    "/api/v1/course-enrollments",
    {
      params: {
        page: 1,
        pageSize: 10,
        ...query,
      },
    },
  );

  return response.data;
};
