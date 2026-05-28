import { api } from "@/shared/services/api";
import type { Course } from "../interfaces/course";
import type { StatusMatriculaCurso } from "../interfaces/student";

export interface CreateCourseEnrollmentBodyApiDto {
  estudanteId: string;
  cursoId: string;
  matricula: string;
  matriculadoEm: string;
  status: StatusMatriculaCurso;
}

export interface CreateCourseEnrollmentResponseApiDto {
  id: string;
  matricula: string;
  matriculadoEm: string;
  status: StatusMatriculaCurso;
  createdAt: string;
  updatedAt: string;
  curso: Course;
}

export const createCourseEnrollmentApi = async (
  data: CreateCourseEnrollmentBodyApiDto,
) => {
  const response = await api.post<CreateCourseEnrollmentResponseApiDto>(
    "/api/v1/course-enrollments",
    data,
  );

  return response.data;
};
