import type { Course } from "./course";
import type { StatusMatriculaCurso } from "./student";

export interface EnrolledStudentSummary {
  id: string;
  ativo: boolean;
  nome: string;
  nomeSocial?: string | null;
  emailInstitucional: string;
}

export interface CourseEnrollment {
  id: string;
  matricula: string;
  matriculadoEm: string;
  status: StatusMatriculaCurso;
  createdAt: string;
  updatedAt: string;
  estudante: EnrolledStudentSummary;
  curso: Course;
}
