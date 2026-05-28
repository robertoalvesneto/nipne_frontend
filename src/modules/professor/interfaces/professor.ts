import type { AcademicUnit } from "./academic-unit";
import type { InstitutionalPerson } from "./institutional-person";

export interface Professor {
  id: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  pessoaInstitucional: InstitutionalPerson;
  unidadesAcademicas: AcademicUnit[];
}
