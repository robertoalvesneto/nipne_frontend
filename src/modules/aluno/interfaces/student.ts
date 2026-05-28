import type { AcademicUnit } from "./academic-unit";
import type { InstitutionalPerson } from "./institutional-person";

export type StatusMatriculaCurso =
  | "ATIVA"
  | "CONCLUIDA"
  | "ENCERRADA"
  | "TRANCADA";

export interface StudentCurrentCourse {
  id: string;
  nome: string;
  sigla: string;
  matricula: string;
  status: StatusMatriculaCurso;
  quantidadeMaterias: number;
  periodoLetivoAtual: StudentCurrentAcademicPeriod | null;
}

export interface StudentCurrentAcademicPeriod {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
}

export interface StudentListItem {
  id: string;
  ativo: boolean;
  dataNascimento?: string | null;
  createdAt: string;
  updatedAt: string;
  pessoaInstitucional: InstitutionalPerson;
  unidadeAcademica: AcademicUnit;
  cursoAtual: StudentCurrentCourse | null;
}

export interface PhoneContact {
  id: string;
  telefone: string;
  descricao?: string | null;
  formaPreferencialContato: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailContact {
  id: string;
  email: string;
  formaPreferencialContato: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupportContact {
  id: string;
  nome: string;
  telefone: string;
  relacao: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  dataNascimento?: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  pessoaInstitucional: InstitutionalPerson;
  unidadeAcademica: AcademicUnit;
  contatosTelefonicos: PhoneContact[];
  contatosEmails: EmailContact[];
  contatosApoio: SupportContact[];
}
