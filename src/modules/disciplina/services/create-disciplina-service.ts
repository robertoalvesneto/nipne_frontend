import { api } from "@/shared/services/api";
import type { Disciplina } from "../interfaces/disciplina";

export interface CreateDisciplinaBodyApiDto {
  cursoId: string;
  nome: string;
  cargaHoraria: number;
}

export type CreateDisciplinaResponseApiDto = Disciplina;

export const createDisciplinaApi = async (data: CreateDisciplinaBodyApiDto) => {
  const response = await api.post<CreateDisciplinaResponseApiDto>(
    "/api/v1/disciplines",
    data,
  );

  return response.data;
};
