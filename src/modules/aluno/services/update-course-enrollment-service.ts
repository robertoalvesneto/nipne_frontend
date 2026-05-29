import { api } from "@/shared/services/api";
import type { CourseEnrollment } from "../interfaces/course-enrollment";
import type { StatusMatriculaCurso } from "../interfaces/student";

export interface UpdateCourseEnrollmentBodyApiDto {
  cursoId?: string;
  matricula?: string;
  matriculadoEm?: string;
  status?: StatusMatriculaCurso;
}

export type UpdateCourseEnrollmentResponseApiDto = CourseEnrollment;

export const updateCourseEnrollmentApi = async (
  id: string,
  data: UpdateCourseEnrollmentBodyApiDto,
) => {
  const response = await api.patch<UpdateCourseEnrollmentResponseApiDto>(
    `/api/v1/course-enrollments/${id}`,
    data,
  );

  return response.data;
};
