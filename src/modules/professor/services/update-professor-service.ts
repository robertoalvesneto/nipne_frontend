import { api } from "@/shared/services/api";
import type { Professor } from "../interfaces/professor";

export interface UpdateProfessorBodyApiDto {
  nome?: string;
  nomeSocial?: string;
  emailInstitucional?: string;
  matricula?: string;
  unidadesAcademicasIds?: string[];
}

export type UpdateProfessorResponseApiDto = Professor;

export const updateProfessorApi = async (
  id: string,
  data: UpdateProfessorBodyApiDto,
) => {
  const response = await api.patch<UpdateProfessorResponseApiDto>(
    `/api/v1/professors/${id}`,
    data,
  );

  return response.data;
};
