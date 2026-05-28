import { api } from "@/shared/services/api";
import type { DisciplinaOferta } from "../interfaces/disciplina-oferta";

export interface CreateClassGroupBodyApiDto {
  disciplinaId: string;
  periodoLetivoId: string;
  nome: string;
  sigla: string;
}

export type CreateClassGroupResponseApiDto = DisciplinaOferta;

export const createClassGroupApi = async (
  data: CreateClassGroupBodyApiDto,
) => {
  const response = await api.post<CreateClassGroupResponseApiDto>(
    "/api/v1/class-groups",
    data,
  );

  return response.data;
};
