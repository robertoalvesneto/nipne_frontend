import { api } from "@/shared/services/api";
import type { Professor } from "../interfaces/professor";

export interface CreateProfessorBodyApiDto {
  nome: string;
  nomeSocial?: string;
  emailInstitucional: string;
  matricula: string;
  unidadesAcademicasIds: string[];
}

export type CreateProfessorResponseApiDto = Professor;

export const createProfessorApi = async (data: CreateProfessorBodyApiDto) => {
  const response = await api.post<CreateProfessorResponseApiDto>(
    "/api/v1/professors",
    data,
  );

  return response.data;
};
