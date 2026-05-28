import { api } from "@/shared/services/api";
import type { DisciplinaOferta } from "../interfaces/disciplina-oferta";

export interface UpdateClassGroupBodyApiDto {
  disciplinaId?: string;
  periodoLetivoId?: string;
  nome?: string;
  sigla?: string;
}

export type UpdateClassGroupResponseApiDto = DisciplinaOferta;

export const updateClassGroupApi = async (
  id: string,
  data: UpdateClassGroupBodyApiDto,
) => {
  const response = await api.patch<UpdateClassGroupResponseApiDto>(
    `/api/v1/class-groups/${id}`,
    data,
  );

  return response.data;
};
