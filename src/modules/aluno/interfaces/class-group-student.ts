import type { InstitutionalPerson } from "./institutional-person";
import type { DisciplinaOferta } from "@/modules/disciplina/interfaces/disciplina-oferta";

export interface ClassGroupStudentSummary {
  id: string;
  ativo: boolean;
  pessoaInstitucional: InstitutionalPerson;
}

export interface ClassGroupStudent {
  id: string;
  createdAt: string;
  estudante: ClassGroupStudentSummary;
  turma: DisciplinaOferta;
}
