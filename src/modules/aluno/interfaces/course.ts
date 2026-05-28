import type { AcademicUnit } from "./academic-unit";

export interface Course {
  id: string;
  nome: string;
  sigla: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  unidadeAcademica: AcademicUnit;
}
