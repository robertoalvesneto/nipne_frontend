import type { AcademicUnit } from "@/modules/aluno/interfaces/academic-unit";
import type { InstitutionalPerson } from "@/modules/aluno/interfaces/institutional-person";
import type {
  RespostasQuestionarioCadastro,
  RespostasQuestionarioEscuta,
} from "./questionario-cadastro";

export type StatusEscuta = "SOLICITADA" | "AGENDADA" | "REALIZADA" | "CANCELADA";

export interface EscutaCursoAtual {
  id: string;
  nome: string;
  sigla: string;
  matricula: string;
}

export interface EscutaEstudante {
  id: string;
  ativo: boolean;
  pessoaInstitucional: InstitutionalPerson;
  unidadeAcademica: AcademicUnit;
  cursoAtual: EscutaCursoAtual | null;
}

export interface Escuta {
  id: string;
  status: StatusEscuta;
  telefoneWhatsapp: string | null;
  emailPessoal: string | null;
  outroContato: string | null;
  formaPreferencialContato: string | null;
  modalidadeCurso: string | null;
  ofertaCurso: string | null;
  consentimento: boolean;
  questionarioCadastroId: string | null;
  questionarioCadastroVersao: string | null;
  respostasQuestionarioCadastro: RespostasQuestionarioCadastro | null;
  questionarioEscutaId: string | null;
  questionarioEscutaVersao: string | null;
  respostasQuestionarioEscuta: RespostasQuestionarioEscuta | null;
  agendadaPara: string | null;
  agendadaEm: string | null;
  realizadaEm: string | null;
  canceladaEm: string | null;
  temTutor: boolean | null;
  nomeTutor: string | null;
  telefoneTutor: string | null;
  resumoCaso: string | null;
  classificacaoApoio: string | null;
  necessitaPaai: string | null;
  encaminhamentos: string[];
  outrosEncaminhamentos: string | null;
  createdAt: string;
  updatedAt: string;
  estudante: EscutaEstudante;
}
