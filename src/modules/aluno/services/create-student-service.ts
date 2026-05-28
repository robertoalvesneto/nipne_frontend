import { api } from "@/shared/services/api";
import type { Student } from "../interfaces/student";

export interface CreateStudentBodyApiDto {
  nome: string;
  nomeSocial?: string;
  emailInstitucional: string;
  matricula: string;
  dataNascimento?: string;
  unidadeAcademicaId: string;
  contatosTelefonicos?: Array<{
    telefone: string;
    formaPreferencialContato: boolean;
    descricao?: string;
  }>;
  contatosApoio?: Array<{
    nome: string;
    telefone: string;
    relacao: string;
  }>;
}

export type CreateStudentResponseApiDto = Student;

export const createStudentApi = async (data: CreateStudentBodyApiDto) => {
  const response = await api.post<CreateStudentResponseApiDto>(
    "/api/v1/students",
    data,
  );

  return response.data;
};
