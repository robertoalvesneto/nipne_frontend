import { api } from "@/shared/services/api";
import type { RespostasQuestionarioCadastro } from "@/modules/escuta/interfaces/questionario-cadastro";
import type { Student } from "../interfaces/student";
import type {
  CreatePhoneContactBodyApiDto,
  CreateSupportContactBodyApiDto,
} from "./create-student-service";

export interface UpdateStudentBodyApiDto {
  nome?: string;
  nomeSocial?: string;
  emailInstitucional?: string;
  matricula?: string;
  dataNascimento?: string;
  telefoneWhatsapp?: string;
  emailPessoal?: string;
  outroContato?: string;
  formaPreferencialContato?: string;
  modalidadeCurso?: string;
  ofertaCurso?: string;
  questionarioCadastroId?: string;
  questionarioCadastroVersao?: string;
  respostasQuestionarioCadastro?: RespostasQuestionarioCadastro;
  finalizarCadastroInicial?: boolean;
  unidadeAcademicaId?: string;
  contatosTelefonicos?: CreatePhoneContactBodyApiDto[];
  contatosApoio?: CreateSupportContactBodyApiDto[];
}

export type UpdateStudentResponseApiDto = Student;

export const updateStudentApi = async (
  id: string,
  data: UpdateStudentBodyApiDto,
) => {
  const response = await api.patch<UpdateStudentResponseApiDto>(
    `/api/v1/students/${id}`,
    data,
  );

  return response.data;
};
