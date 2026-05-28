import type { InstitutionalPerson } from "@/modules/professor/interfaces/institutional-person";
import type { AcademicPeriod } from "./academic-period";
import type { Disciplina } from "./disciplina";

export interface DisciplinaOfertaProfessor {
  id: string;
  vinculoId: string;
  ativo: boolean;
  pessoaInstitucional: InstitutionalPerson;
}

export interface DisciplinaOferta {
  id: string;
  nome: string;
  sigla: string;
  ativo: boolean;
  matriculados: number;
  createdAt: string;
  updatedAt: string;
  disciplina: Disciplina;
  periodoLetivo: AcademicPeriod;
  professores: DisciplinaOfertaProfessor[];
}
